/**
 * Smartsheet API Client
 * Base URL: https://api.smartsheet.com/2.0
 * Auth: Bearer token (API key)
 */

const BASE_URL = 'https://api.smartsheet.com/2.0';

export class SmartsheetClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options?: {
      method?: string;
      body?: any;
      params?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const method = options?.method || 'GET';

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
    };

    if (options?.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
  }

  // === Sheets ===

  async listSheets(page?: number, pageSize?: number, includeAll?: boolean) {
    return this.request<any>('/sheets', {
      params: { page, pageSize, includeAll },
    });
  }

  async getSheet(
    sheetId: string,
    include?: string,
    exclude?: string,
    rowIds?: string,
    columnIds?: string,
    filterId?: string,
    page?: number,
    pageSize?: number
  ) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}`, {
      params: { include, exclude, rowIds, columnIds, filterId, page, pageSize },
    });
  }

  async createSheet(name: string, columns: any[]) {
    return this.request<any>('/sheets', {
      method: 'POST',
      body: { name, columns },
    });
  }

  async updateSheet(sheetId: string, data: any) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteSheet(sheetId: string) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}`, {
      method: 'DELETE',
    });
  }

  async copySheet(sheetId: string, destinationType: string, destinationId: string, newName?: string) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/copy`, {
      method: 'POST',
      body: {
        destinationType,
        destinationId,
        newName,
      },
    });
  }

  async moveSheet(sheetId: string, destinationType: string, destinationId: string) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/move`, {
      method: 'POST',
      body: { destinationType, destinationId },
    });
  }

  // === Rows ===

  async getRow(sheetId: string, rowId: string, include?: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/rows/${encodeURIComponent(rowId)}`,
      { params: { include } }
    );
  }

  async addRows(sheetId: string, rows: any[]) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/rows`, {
      method: 'POST',
      body: rows,
    });
  }

  async updateRows(sheetId: string, rows: any[]) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/rows`, {
      method: 'PUT',
      body: rows,
    });
  }

  async deleteRows(sheetId: string, rowIds: string, ignoreRowsNotFound?: boolean) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/rows`, {
      method: 'DELETE',
      params: { ids: rowIds, ignoreRowsNotFound },
    });
  }

  async copyRows(sheetId: string, rowIds: number[], destinationSheetId: string) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/rows/copy`, {
      method: 'POST',
      body: { rowIds, to: { sheetId: destinationSheetId } },
    });
  }

  async moveRows(sheetId: string, rowIds: number[], destinationSheetId: string) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/rows/move`, {
      method: 'POST',
      body: { rowIds, to: { sheetId: destinationSheetId } },
    });
  }

  // === Columns ===

  async listColumns(sheetId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/columns`, {
      params: { page, pageSize },
    });
  }

  async getColumn(sheetId: string, columnId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/columns/${encodeURIComponent(columnId)}`
    );
  }

  async addColumns(sheetId: string, columns: any[]) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/columns`, {
      method: 'POST',
      body: columns,
    });
  }

  async updateColumn(sheetId: string, columnId: string, data: any) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/columns/${encodeURIComponent(columnId)}`,
      { method: 'PUT', body: data }
    );
  }

  async deleteColumn(sheetId: string, columnId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/columns/${encodeURIComponent(columnId)}`,
      { method: 'DELETE' }
    );
  }

  // === Cells ===

  async getCellHistory(sheetId: string, rowId: string, columnId: string, page?: number, pageSize?: number) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/rows/${encodeURIComponent(rowId)}/columns/${encodeURIComponent(columnId)}/history`,
      { params: { page, pageSize } }
    );
  }

  // === Attachments ===

  async listSheetAttachments(sheetId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/attachments`, {
      params: { page, pageSize },
    });
  }

  async listRowAttachments(sheetId: string, rowId: string, page?: number, pageSize?: number) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/rows/${encodeURIComponent(rowId)}/attachments`,
      { params: { page, pageSize } }
    );
  }

  async getAttachment(sheetId: string, attachmentId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/attachments/${encodeURIComponent(attachmentId)}`
    );
  }

  async deleteAttachment(sheetId: string, attachmentId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/attachments/${encodeURIComponent(attachmentId)}`,
      { method: 'DELETE' }
    );
  }

  async attachUrl(sheetId: string, rowId: string, name: string, url: string, attachmentType: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/rows/${encodeURIComponent(rowId)}/attachments`,
      {
        method: 'POST',
        body: { name, url, attachmentType },
      }
    );
  }

  // === Comments ===

  async listComments(sheetId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/discussions`, {
      params: { page, pageSize, include: 'comments' },
    });
  }

  async addComment(sheetId: string, rowId: string, text: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/rows/${encodeURIComponent(rowId)}/discussions`,
      {
        method: 'POST',
        body: { comment: { text } },
      }
    );
  }

  async getComment(sheetId: string, commentId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/comments/${encodeURIComponent(commentId)}`
    );
  }

  async deleteComment(sheetId: string, commentId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/comments/${encodeURIComponent(commentId)}`,
      { method: 'DELETE' }
    );
  }

  // === Users ===

  async listUsers(page?: number, pageSize?: number, email?: string) {
    return this.request<any>('/users', {
      params: { page, pageSize, email },
    });
  }

  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  async addUser(email: string, admin: boolean, licensedSheetCreator: boolean, firstName?: string, lastName?: string) {
    return this.request<any>('/users', {
      method: 'POST',
      body: { email, admin, licensedSheetCreator, firstName, lastName },
    });
  }

  async getUser(userId: string) {
    return this.request<any>(`/users/${encodeURIComponent(userId)}`);
  }

  async removeUser(userId: string, transferTo?: string) {
    return this.request<any>(`/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      params: { transferTo },
    });
  }

  // === Groups ===

  async listGroups(page?: number, pageSize?: number) {
    return this.request<any>('/groups', {
      params: { page, pageSize },
    });
  }

  async getGroup(groupId: string) {
    return this.request<any>(`/groups/${encodeURIComponent(groupId)}`);
  }

  async createGroup(name: string, description?: string, members?: Array<{ email: string }>) {
    return this.request<any>('/groups', {
      method: 'POST',
      body: { name, description, members },
    });
  }

  async updateGroup(groupId: string, data: any) {
    return this.request<any>(`/groups/${encodeURIComponent(groupId)}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteGroup(groupId: string) {
    return this.request<any>(`/groups/${encodeURIComponent(groupId)}`, {
      method: 'DELETE',
    });
  }

  // === Workspaces ===

  async listWorkspaces(page?: number, pageSize?: number) {
    return this.request<any>('/workspaces', {
      params: { page, pageSize },
    });
  }

  async getWorkspace(workspaceId: string) {
    return this.request<any>(`/workspaces/${encodeURIComponent(workspaceId)}`);
  }

  async createWorkspace(name: string) {
    return this.request<any>('/workspaces', {
      method: 'POST',
      body: { name },
    });
  }

  async updateWorkspace(workspaceId: string, name: string) {
    return this.request<any>(`/workspaces/${encodeURIComponent(workspaceId)}`, {
      method: 'PUT',
      body: { name },
    });
  }

  async deleteWorkspace(workspaceId: string) {
    return this.request<any>(`/workspaces/${encodeURIComponent(workspaceId)}`, {
      method: 'DELETE',
    });
  }

  // === Folders ===

  async listFolders(page?: number, pageSize?: number) {
    return this.request<any>('/home/folders', {
      params: { page, pageSize },
    });
  }

  async getFolder(folderId: string) {
    return this.request<any>(`/folders/${encodeURIComponent(folderId)}`);
  }

  async createFolder(name: string) {
    return this.request<any>('/home/folders', {
      method: 'POST',
      body: { name },
    });
  }

  async createSubfolder(folderId: string, name: string) {
    return this.request<any>(`/folders/${encodeURIComponent(folderId)}/folders`, {
      method: 'POST',
      body: { name },
    });
  }

  async updateFolder(folderId: string, name: string) {
    return this.request<any>(`/folders/${encodeURIComponent(folderId)}`, {
      method: 'PUT',
      body: { name },
    });
  }

  async deleteFolder(folderId: string) {
    return this.request<any>(`/folders/${encodeURIComponent(folderId)}`, {
      method: 'DELETE',
    });
  }

  // === Reports ===

  async listReports(page?: number, pageSize?: number) {
    return this.request<any>('/reports', {
      params: { page, pageSize },
    });
  }

  async getReport(reportId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/reports/${encodeURIComponent(reportId)}`, {
      params: { page, pageSize },
    });
  }

  // === Search ===

  async search(query: string, include?: string, scopes?: string) {
    return this.request<any>('/search', {
      params: { query, include, scopes },
    });
  }

  async searchSheet(sheetId: string, query: string) {
    return this.request<any>(`/search/sheets/${encodeURIComponent(sheetId)}`, {
      params: { query },
    });
  }

  // === Webhooks ===

  async listWebhooks(page?: number, pageSize?: number) {
    return this.request<any>('/webhooks', {
      params: { page, pageSize },
    });
  }

  async getWebhook(webhookId: string) {
    return this.request<any>(`/webhooks/${encodeURIComponent(webhookId)}`);
  }

  async createWebhook(name: string, callbackUrl: string, scope: string, scopeObjectId: string, events: string[], version: number) {
    return this.request<any>('/webhooks', {
      method: 'POST',
      body: { name, callbackUrl, scope, scopeObjectId, events, version },
    });
  }

  async updateWebhook(webhookId: string, data: any) {
    return this.request<any>(`/webhooks/${encodeURIComponent(webhookId)}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.request<any>(`/webhooks/${encodeURIComponent(webhookId)}`, {
      method: 'DELETE',
    });
  }

  // === Cross-Sheet References ===

  async listCrossSheetReferences(sheetId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/crosssheetreferences`, {
      params: { page, pageSize },
    });
  }

  // === Sharing ===

  async listSharing(sheetId: string, page?: number, pageSize?: number) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/shares`, {
      params: { page, pageSize },
    });
  }

  async shareSheet(sheetId: string, shares: Array<{ email: string; accessLevel: string }>, sendEmail?: boolean) {
    return this.request<any>(`/sheets/${encodeURIComponent(sheetId)}/shares`, {
      method: 'POST',
      params: { sendEmail },
      body: shares,
    });
  }

  async deleteShare(sheetId: string, shareId: string) {
    return this.request<any>(
      `/sheets/${encodeURIComponent(sheetId)}/shares/${encodeURIComponent(shareId)}`,
      { method: 'DELETE' }
    );
  }

  // === Server Info ===

  async getServerInfo() {
    return this.request<any>('/serverinfo');
  }
}
