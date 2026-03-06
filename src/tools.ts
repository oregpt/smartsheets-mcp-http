import { z } from 'zod';
import { SmartsheetClient } from './api-client.js';

interface ToolDef {
  name: string;
  description: string;
  inputSchema: z.ZodType<any>;
  handler: (client: SmartsheetClient, args: any) => Promise<any>;
}

const paginationParams = {
  page: z.number().optional().describe('Page number (1-based)'),
  pageSize: z.number().optional().describe('Rows per page (max 500)'),
};

export const tools: ToolDef[] = [
  // === Sheets ===
  {
    name: 'sheets_list',
    description: 'List all sheets accessible to the user',
    inputSchema: z.object({
      ...paginationParams,
      includeAll: z.boolean().optional().describe('Return all results (ignore pagination)'),
    }),
    handler: async (client, args) => client.listSheets(args.page, args.pageSize, args.includeAll),
  },
  {
    name: 'sheet_get',
    description: 'Get a sheet with rows, columns, and data',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      include: z.string().optional().describe('Comma-separated: attachments,comments,format'),
      exclude: z.string().optional().describe('Comma-separated fields to exclude'),
      rowIds: z.string().optional().describe('Comma-separated row IDs to filter'),
      columnIds: z.string().optional().describe('Comma-separated column IDs to filter'),
      filterId: z.string().optional().describe('Filter ID to apply'),
      ...paginationParams,
    }),
    handler: async (client, args) =>
      client.getSheet(args.sheetId, args.include, args.exclude, args.rowIds, args.columnIds, args.filterId, args.page, args.pageSize),
  },
  {
    name: 'sheet_create',
    description: 'Create a new sheet with columns',
    inputSchema: z.object({
      name: z.string().describe('Sheet name'),
      columns: z.string().describe('JSON array of column defs: [{title, type, primary?}]'),
    }),
    handler: async (client, args) => client.createSheet(args.name, JSON.parse(args.columns)),
  },
  {
    name: 'sheet_update',
    description: 'Update sheet properties (name, etc.)',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      name: z.string().optional().describe('New sheet name'),
    }),
    handler: async (client, args) => {
      const { sheetId, ...data } = args;
      return client.updateSheet(sheetId, data);
    },
  },
  {
    name: 'sheet_delete',
    description: 'Delete a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
    }),
    handler: async (client, args) => client.deleteSheet(args.sheetId),
  },
  {
    name: 'sheet_copy',
    description: 'Copy a sheet to a folder or workspace',
    inputSchema: z.object({
      sheetId: z.string().describe('Source sheet ID'),
      destinationType: z.string().describe('Destination type: folder or workspace'),
      destinationId: z.string().describe('Destination folder/workspace ID'),
      newName: z.string().optional().describe('Name for the copy'),
    }),
    handler: async (client, args) =>
      client.copySheet(args.sheetId, args.destinationType, args.destinationId, args.newName),
  },
  {
    name: 'sheet_move',
    description: 'Move a sheet to a folder or workspace',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      destinationType: z.string().describe('Destination type: folder or workspace'),
      destinationId: z.string().describe('Destination folder/workspace ID'),
    }),
    handler: async (client, args) =>
      client.moveSheet(args.sheetId, args.destinationType, args.destinationId),
  },

  // === Rows ===
  {
    name: 'row_get',
    description: 'Get a specific row from a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowId: z.string().describe('Row ID'),
      include: z.string().optional().describe('Comma-separated: columns,format,attachments'),
    }),
    handler: async (client, args) => client.getRow(args.sheetId, args.rowId, args.include),
  },
  {
    name: 'rows_add',
    description: 'Add one or more rows to a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rows: z.string().describe('JSON array of rows: [{toBottom:true, cells:[{columnId, value}]}]'),
    }),
    handler: async (client, args) => client.addRows(args.sheetId, JSON.parse(args.rows)),
  },
  {
    name: 'rows_update',
    description: 'Update one or more rows in a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rows: z.string().describe('JSON array: [{id: rowId, cells:[{columnId, value}]}]'),
    }),
    handler: async (client, args) => client.updateRows(args.sheetId, JSON.parse(args.rows)),
  },
  {
    name: 'rows_delete',
    description: 'Delete rows from a sheet by IDs',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowIds: z.string().describe('Comma-separated row IDs to delete'),
      ignoreRowsNotFound: z.boolean().optional().describe('Ignore missing row IDs'),
    }),
    handler: async (client, args) =>
      client.deleteRows(args.sheetId, args.rowIds, args.ignoreRowsNotFound),
  },
  {
    name: 'rows_copy',
    description: 'Copy rows to another sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Source sheet ID'),
      rowIds: z.string().describe('JSON array of row IDs to copy'),
      destinationSheetId: z.string().describe('Destination sheet ID'),
    }),
    handler: async (client, args) =>
      client.copyRows(args.sheetId, JSON.parse(args.rowIds), args.destinationSheetId),
  },
  {
    name: 'rows_move',
    description: 'Move rows to another sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Source sheet ID'),
      rowIds: z.string().describe('JSON array of row IDs to move'),
      destinationSheetId: z.string().describe('Destination sheet ID'),
    }),
    handler: async (client, args) =>
      client.moveRows(args.sheetId, JSON.parse(args.rowIds), args.destinationSheetId),
  },

  // === Columns ===
  {
    name: 'columns_list',
    description: 'List all columns in a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      ...paginationParams,
    }),
    handler: async (client, args) => client.listColumns(args.sheetId, args.page, args.pageSize),
  },
  {
    name: 'column_get',
    description: 'Get a specific column definition',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      columnId: z.string().describe('Column ID'),
    }),
    handler: async (client, args) => client.getColumn(args.sheetId, args.columnId),
  },
  {
    name: 'columns_add',
    description: 'Add columns to a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      columns: z.string().describe('JSON array: [{title, type, index?}]'),
    }),
    handler: async (client, args) => client.addColumns(args.sheetId, JSON.parse(args.columns)),
  },
  {
    name: 'column_update',
    description: 'Update a column definition',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      columnId: z.string().describe('Column ID'),
      data: z.string().describe('JSON object with column updates: {title?, type?, index?}'),
    }),
    handler: async (client, args) => client.updateColumn(args.sheetId, args.columnId, JSON.parse(args.data)),
  },
  {
    name: 'column_delete',
    description: 'Delete a column from a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      columnId: z.string().describe('Column ID'),
    }),
    handler: async (client, args) => client.deleteColumn(args.sheetId, args.columnId),
  },

  // === Cells ===
  {
    name: 'cell_history',
    description: 'Get change history for a specific cell',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowId: z.string().describe('Row ID'),
      columnId: z.string().describe('Column ID'),
      ...paginationParams,
    }),
    handler: async (client, args) =>
      client.getCellHistory(args.sheetId, args.rowId, args.columnId, args.page, args.pageSize),
  },

  // === Attachments ===
  {
    name: 'attachments_list',
    description: 'List attachments on a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      ...paginationParams,
    }),
    handler: async (client, args) => client.listSheetAttachments(args.sheetId, args.page, args.pageSize),
  },
  {
    name: 'row_attachments_list',
    description: 'List attachments on a specific row',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowId: z.string().describe('Row ID'),
      ...paginationParams,
    }),
    handler: async (client, args) =>
      client.listRowAttachments(args.sheetId, args.rowId, args.page, args.pageSize),
  },
  {
    name: 'attachment_get',
    description: 'Get attachment details and download URL',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      attachmentId: z.string().describe('Attachment ID'),
    }),
    handler: async (client, args) => client.getAttachment(args.sheetId, args.attachmentId),
  },
  {
    name: 'attachment_delete',
    description: 'Delete an attachment',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      attachmentId: z.string().describe('Attachment ID'),
    }),
    handler: async (client, args) => client.deleteAttachment(args.sheetId, args.attachmentId),
  },
  {
    name: 'attachment_add_url',
    description: 'Attach a URL to a row',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowId: z.string().describe('Row ID'),
      name: z.string().describe('Attachment name'),
      url: z.string().describe('URL to attach'),
      attachmentType: z.string().describe('Type: LINK, BOX_COM, GOOGLE_DRIVE, etc.'),
    }),
    handler: async (client, args) =>
      client.attachUrl(args.sheetId, args.rowId, args.name, args.url, args.attachmentType),
  },

  // === Comments / Discussions ===
  {
    name: 'discussions_list',
    description: 'List discussions with comments on a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      ...paginationParams,
    }),
    handler: async (client, args) => client.listComments(args.sheetId, args.page, args.pageSize),
  },
  {
    name: 'comment_add',
    description: 'Add a comment to a row',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      rowId: z.string().describe('Row ID'),
      text: z.string().describe('Comment text'),
    }),
    handler: async (client, args) => client.addComment(args.sheetId, args.rowId, args.text),
  },
  {
    name: 'comment_get',
    description: 'Get a specific comment',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      commentId: z.string().describe('Comment ID'),
    }),
    handler: async (client, args) => client.getComment(args.sheetId, args.commentId),
  },
  {
    name: 'comment_delete',
    description: 'Delete a comment',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      commentId: z.string().describe('Comment ID'),
    }),
    handler: async (client, args) => client.deleteComment(args.sheetId, args.commentId),
  },

  // === Users ===
  {
    name: 'users_list',
    description: 'List users in the organization',
    inputSchema: z.object({
      ...paginationParams,
      email: z.string().optional().describe('Filter by email address'),
    }),
    handler: async (client, args) => client.listUsers(args.page, args.pageSize, args.email),
  },
  {
    name: 'user_get_current',
    description: 'Get the current authenticated user',
    inputSchema: z.object({}),
    handler: async (client) => client.getCurrentUser(),
  },
  {
    name: 'user_get',
    description: 'Get a specific user by ID',
    inputSchema: z.object({
      userId: z.string().describe('User ID'),
    }),
    handler: async (client, args) => client.getUser(args.userId),
  },
  {
    name: 'user_add',
    description: 'Add a user to the organization',
    inputSchema: z.object({
      email: z.string().describe('User email address'),
      admin: z.boolean().describe('Grant admin privileges'),
      licensedSheetCreator: z.boolean().describe('Licensed sheet creator'),
      firstName: z.string().optional().describe('First name'),
      lastName: z.string().optional().describe('Last name'),
    }),
    handler: async (client, args) =>
      client.addUser(args.email, args.admin, args.licensedSheetCreator, args.firstName, args.lastName),
  },
  {
    name: 'user_remove',
    description: 'Remove a user from the organization',
    inputSchema: z.object({
      userId: z.string().describe('User ID'),
      transferTo: z.string().optional().describe('Transfer owned items to this user ID'),
    }),
    handler: async (client, args) => client.removeUser(args.userId, args.transferTo),
  },

  // === Groups ===
  {
    name: 'groups_list',
    description: 'List all groups in the organization',
    inputSchema: z.object({
      ...paginationParams,
    }),
    handler: async (client, args) => client.listGroups(args.page, args.pageSize),
  },
  {
    name: 'group_get',
    description: 'Get a specific group',
    inputSchema: z.object({
      groupId: z.string().describe('Group ID'),
    }),
    handler: async (client, args) => client.getGroup(args.groupId),
  },
  {
    name: 'group_create',
    description: 'Create a new group',
    inputSchema: z.object({
      name: z.string().describe('Group name'),
      description: z.string().optional().describe('Group description'),
      members: z.string().optional().describe('JSON array of members: [{email}]'),
    }),
    handler: async (client, args) =>
      client.createGroup(args.name, args.description, args.members ? JSON.parse(args.members) : undefined),
  },
  {
    name: 'group_update',
    description: 'Update a group',
    inputSchema: z.object({
      groupId: z.string().describe('Group ID'),
      data: z.string().describe('JSON object: {name?, description?}'),
    }),
    handler: async (client, args) => client.updateGroup(args.groupId, JSON.parse(args.data)),
  },
  {
    name: 'group_delete',
    description: 'Delete a group',
    inputSchema: z.object({
      groupId: z.string().describe('Group ID'),
    }),
    handler: async (client, args) => client.deleteGroup(args.groupId),
  },

  // === Workspaces ===
  {
    name: 'workspaces_list',
    description: 'List all workspaces',
    inputSchema: z.object({
      ...paginationParams,
    }),
    handler: async (client, args) => client.listWorkspaces(args.page, args.pageSize),
  },
  {
    name: 'workspace_get',
    description: 'Get a workspace with contents',
    inputSchema: z.object({
      workspaceId: z.string().describe('Workspace ID'),
    }),
    handler: async (client, args) => client.getWorkspace(args.workspaceId),
  },
  {
    name: 'workspace_create',
    description: 'Create a new workspace',
    inputSchema: z.object({
      name: z.string().describe('Workspace name'),
    }),
    handler: async (client, args) => client.createWorkspace(args.name),
  },
  {
    name: 'workspace_update',
    description: 'Rename a workspace',
    inputSchema: z.object({
      workspaceId: z.string().describe('Workspace ID'),
      name: z.string().describe('New workspace name'),
    }),
    handler: async (client, args) => client.updateWorkspace(args.workspaceId, args.name),
  },
  {
    name: 'workspace_delete',
    description: 'Delete a workspace',
    inputSchema: z.object({
      workspaceId: z.string().describe('Workspace ID'),
    }),
    handler: async (client, args) => client.deleteWorkspace(args.workspaceId),
  },

  // === Folders ===
  {
    name: 'folders_list',
    description: 'List top-level folders in Home',
    inputSchema: z.object({
      ...paginationParams,
    }),
    handler: async (client, args) => client.listFolders(args.page, args.pageSize),
  },
  {
    name: 'folder_get',
    description: 'Get a folder with its contents',
    inputSchema: z.object({
      folderId: z.string().describe('Folder ID'),
    }),
    handler: async (client, args) => client.getFolder(args.folderId),
  },
  {
    name: 'folder_create',
    description: 'Create a top-level folder in Home',
    inputSchema: z.object({
      name: z.string().describe('Folder name'),
    }),
    handler: async (client, args) => client.createFolder(args.name),
  },
  {
    name: 'subfolder_create',
    description: 'Create a subfolder inside a folder',
    inputSchema: z.object({
      folderId: z.string().describe('Parent folder ID'),
      name: z.string().describe('Subfolder name'),
    }),
    handler: async (client, args) => client.createSubfolder(args.folderId, args.name),
  },
  {
    name: 'folder_update',
    description: 'Rename a folder',
    inputSchema: z.object({
      folderId: z.string().describe('Folder ID'),
      name: z.string().describe('New folder name'),
    }),
    handler: async (client, args) => client.updateFolder(args.folderId, args.name),
  },
  {
    name: 'folder_delete',
    description: 'Delete a folder',
    inputSchema: z.object({
      folderId: z.string().describe('Folder ID'),
    }),
    handler: async (client, args) => client.deleteFolder(args.folderId),
  },

  // === Reports ===
  {
    name: 'reports_list',
    description: 'List all reports',
    inputSchema: z.object({
      ...paginationParams,
    }),
    handler: async (client, args) => client.listReports(args.page, args.pageSize),
  },
  {
    name: 'report_get',
    description: 'Get a report with its data',
    inputSchema: z.object({
      reportId: z.string().describe('Report ID'),
      ...paginationParams,
    }),
    handler: async (client, args) => client.getReport(args.reportId, args.page, args.pageSize),
  },

  // === Search ===
  {
    name: 'search',
    description: 'Search across all sheets, reports, etc.',
    inputSchema: z.object({
      query: z.string().describe('Search query text'),
      include: z.string().optional().describe('Object types to include'),
      scopes: z.string().optional().describe('Scopes to search: personalSheets,favorites'),
    }),
    handler: async (client, args) => client.search(args.query, args.include, args.scopes),
  },
  {
    name: 'search_sheet',
    description: 'Search within a specific sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      query: z.string().describe('Search query text'),
    }),
    handler: async (client, args) => client.searchSheet(args.sheetId, args.query),
  },

  // === Webhooks ===
  {
    name: 'webhooks_list',
    description: 'List all webhooks',
    inputSchema: z.object({
      ...paginationParams,
    }),
    handler: async (client, args) => client.listWebhooks(args.page, args.pageSize),
  },
  {
    name: 'webhook_get',
    description: 'Get a specific webhook',
    inputSchema: z.object({
      webhookId: z.string().describe('Webhook ID'),
    }),
    handler: async (client, args) => client.getWebhook(args.webhookId),
  },
  {
    name: 'webhook_create',
    description: 'Create a new webhook',
    inputSchema: z.object({
      name: z.string().describe('Webhook name'),
      callbackUrl: z.string().describe('Callback URL'),
      scope: z.string().describe('Scope: sheet'),
      scopeObjectId: z.string().describe('Sheet ID for the webhook scope'),
      events: z.string().describe('JSON array of events: ["*.*"] or specific'),
      version: z.number().describe('API version (usually 1)'),
    }),
    handler: async (client, args) =>
      client.createWebhook(args.name, args.callbackUrl, args.scope, args.scopeObjectId, JSON.parse(args.events), args.version),
  },
  {
    name: 'webhook_update',
    description: 'Update a webhook',
    inputSchema: z.object({
      webhookId: z.string().describe('Webhook ID'),
      data: z.string().describe('JSON object: {enabled?, callbackUrl?}'),
    }),
    handler: async (client, args) => client.updateWebhook(args.webhookId, JSON.parse(args.data)),
  },
  {
    name: 'webhook_delete',
    description: 'Delete a webhook',
    inputSchema: z.object({
      webhookId: z.string().describe('Webhook ID'),
    }),
    handler: async (client, args) => client.deleteWebhook(args.webhookId),
  },

  // === Cross-Sheet References ===
  {
    name: 'cross_sheet_references_list',
    description: 'List cross-sheet references in a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      ...paginationParams,
    }),
    handler: async (client, args) =>
      client.listCrossSheetReferences(args.sheetId, args.page, args.pageSize),
  },

  // === Sharing ===
  {
    name: 'sharing_list',
    description: 'List sharing permissions on a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      ...paginationParams,
    }),
    handler: async (client, args) => client.listSharing(args.sheetId, args.page, args.pageSize),
  },
  {
    name: 'sharing_add',
    description: 'Share a sheet with users',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      shares: z.string().describe('JSON array: [{email, accessLevel: VIEWER|EDITOR|ADMIN}]'),
      sendEmail: z.boolean().optional().describe('Send notification email'),
    }),
    handler: async (client, args) =>
      client.shareSheet(args.sheetId, JSON.parse(args.shares), args.sendEmail),
  },
  {
    name: 'sharing_delete',
    description: 'Remove sharing on a sheet',
    inputSchema: z.object({
      sheetId: z.string().describe('Sheet ID'),
      shareId: z.string().describe('Share ID'),
    }),
    handler: async (client, args) => client.deleteShare(args.sheetId, args.shareId),
  },

  // === Server Info ===
  {
    name: 'server_info',
    description: 'Get Smartsheet server info and formats',
    inputSchema: z.object({}),
    handler: async (client) => client.getServerInfo(),
  },
];
