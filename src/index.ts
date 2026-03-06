#!/usr/bin/env node
/**
 * Smartsheets MCP Server — Exposed via Streamable HTTP
 *
 * Auth model: Client sends their own Smartsheet API key as Bearer token.
 * The server extracts it and creates a per-session API client.
 * No credentials are stored on the server.
 */

import { randomUUID } from 'node:crypto';
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema as _zodToJsonSchema } from 'zod-to-json-schema';
import { SmartsheetClient } from './api-client.js';
import { tools } from './tools.js';

function zodToJsonSchema(schema: any): any {
  return _zodToJsonSchema(schema);
}

const PORT = parseInt(process.env.PORT || '3100', 10);

const app = express();
app.use(express.json());

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    server: 'smartsheets-mcp-http',
    version: '1.0.0',
    tools: tools.length,
    transport: 'streamable-http',
    auth: 'bearer-passthrough',
  });
});

// --- Extract Bearer token from request ---
function extractBearerToken(req: express.Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  return auth.replace(/^Bearer\s+/i, '');
}

// --- Per-session state ---
interface SessionState {
  server: Server;
  transport: StreamableHTTPServerTransport;
  client: SmartsheetClient;
}

const sessions = new Map<string, SessionState>();

function createMCPServer(client: SmartsheetClient): Server {
  const server = new Server(
    { name: 'smartsheets-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.inputSchema),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = tools.find((t) => t.name === name);

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await tool.handler(client, args as any);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

// --- Streamable HTTP endpoint ---
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  // Existing session
  if (sessionId && sessions.has(sessionId)) {
    const { transport } = sessions.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session — requires Bearer token
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({
      error: 'Missing Authorization header. Use: Bearer <your-smartsheet-api-key>',
    });
    return;
  }

  // Create per-session API client with the user's credentials
  const client = new SmartsheetClient(token);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  const server = createMCPServer(client);

  transport.onclose = () => {
    const sid = transport.sessionId;
    if (sid) {
      sessions.delete(sid);
      console.log(`[mcp] Session closed: ${sid}`);
    }
  };

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);

  const newSessionId = transport.sessionId;
  if (newSessionId) {
    sessions.set(newSessionId, { server, transport, client });
    console.log(`[mcp] New session: ${newSessionId}`);
  }
});

// GET /mcp — SSE stream for server notifications
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(400).json({ error: 'Invalid or missing session. Send initialization POST first.' });
    return;
  }
  const { transport } = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// DELETE /mcp — close session
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const { transport, server } = sessions.get(sessionId)!;
  await transport.close();
  await server.close();
  sessions.delete(sessionId);
  res.status(200).json({ status: 'session closed' });
});

app.listen(PORT, () => {
  console.log(`Smartsheets MCP HTTP Server running on port ${PORT}`);
  console.log(`  MCP endpoint:   http://localhost:${PORT}/mcp`);
  console.log(`  Health check:   http://localhost:${PORT}/health`);
  console.log(`  Tools:          ${tools.length}`);
  console.log(`  Transport:      Streamable HTTP`);
  console.log(`  Auth:           Bearer passthrough (client provides Smartsheet API key)`);
});
