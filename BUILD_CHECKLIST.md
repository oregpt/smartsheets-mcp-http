# MCP Expose Checklist — Smartsheets

## Server Info
- **Source MCP:** C:\Users\oreph\clawd\OrphilLLC\Clients\FinanceStackMCPs\SmartsheetsMCP\mcp-server
- **Service Name:** Smartsheets
- **API Client Class:** SmartsheetClient
- **Constructor Args:** apiKey: string
- **Tool Count:** 63
- **Target Directory:** C:\Users\oreph\clawd\OrphilLLC\Clients\FinanceStackMCPs\General\Exposed\Smartsheets
- **Started:** 2026-03-05

## Phase 1: Read Source
- [x] Read api-client.ts — identified class name and constructor
- [x] Read tools.ts — confirmed tool count
- [x] Read index.ts — confirmed stdio transport
- [x] Read package.json — noted dependencies
- [x] Read tsconfig.json — noted config

## Phase 2: Scaffold
- [ ] Created target directory
- [ ] Created package.json (with express added)
- [ ] Created tsconfig.json
- [ ] Created .gitignore (includes DEPLOYMENT.md)
- [ ] Created .env.example (PORT only, no API keys)
- [ ] Copied api-client.ts (unchanged)
- [ ] Copied tools.ts (unchanged)
- [ ] Created index.ts with Streamable HTTP transport
- [ ] Auth model: Bearer passthrough (no hardcoded keys)
- [ ] Replaced all placeholders with actual values

## Phase 3: Build & Local Test
- [ ] npm install — 0 vulnerabilities
- [ ] npx tsc — 0 errors
- [ ] Smoke test: server starts, shows correct tool count
- [ ] Smoke test: shows "Bearer passthrough" auth mode

## Phase 4: GitHub
- [ ] git init + commit
- [ ] Created repo under agenticledger org
- [ ] Pushed to main branch

## Phase 5: Railway Deploy
- [ ] Created service in FinanceMCPs project
- [ ] Set PORT=3100 env var
- [ ] Connected GitHub repo
- [ ] Deployment status: SUCCESS
- [ ] Created public domain
- [ ] Domain URL: TBD

## Phase 6: End-to-End Tests
- [ ] Health check returns 200 with correct tool count
- [ ] POST /mcp without auth returns 401
- [ ] MCP initialize returns session ID + serverInfo
- [ ] tools/list returns all 63 tools
- [ ] (Optional) Live API call with real credentials works

## Phase 7: Documentation
- [ ] Created DEPLOYMENT.md (gitignored)
- [ ] Includes MCP URL, auth instructions, client config

## Final Validation
- [ ] All Phase 1-7 items checked
- [ ] Server is live and responding at public URL
- [ ] No service credentials stored on the server
- [ ] BUILD_CHECKLIST.md fully complete
