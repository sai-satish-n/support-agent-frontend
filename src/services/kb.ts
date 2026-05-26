import { apiClient } from './api'

export interface Document {
  id: string
  org_id: string
  name: string
  file_type: string
  is_indexed: boolean
  created_at: string
}

export interface DocumentCreate {
  name: string
  content: string
  file_type: string
}

export const kbService = {
  // Upload a document
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post<Document>('/kb/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // List all documents
  async listDocuments(limit: number = 50, offset: number = 0): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`/kb/documents?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Get a single document
  async getDocument(documentId: string): Promise<Document> {
    const response = await apiClient.get<Document>(`/kb/documents/${documentId}`)
    return response.data
  },

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/kb/documents/${documentId}`)
  },

  // Reindex a document
  async reindexDocument(documentId: string): Promise<void> {
    await apiClient.post(`/kb/documents/${documentId}/reindex`)
  }
}
