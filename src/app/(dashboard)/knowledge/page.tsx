'use client'

import { useState, useEffect, useRef } from 'react'
import { UploadCloud, FileText, Loader2, Trash2, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react'
import { kbService, type Document } from '@/services/kb'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'ai_operator') {
      router.push('/dashboard')
      return
    }
    fetchDocuments()
  }, [user, router])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const data = await kbService.listDocuments()
      setDocuments(data)
    } catch (err) {
      setError('Failed to fetch knowledge base documents.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    setError('')

    try {
      await kbService.uploadDocument(file)
      await fetchDocuments()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to upload document.')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await kbService.deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      setError('Failed to delete document.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h2>
        <p className="text-muted mt-1">Upload documents to expand your AI agent's semantic knowledge.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div 
        className={`glass-card p-12 border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".txt,.md,.csv,.json,.pdf,.docx,.doc"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        />
        
        {uploading ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-medium text-foreground">Processing Document...</h3>
            <p className="text-sm text-muted mt-2">Extracting content and generating vector embeddings.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-border shadow-inner">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Drag & drop your file here</h3>
            <p className="text-sm text-muted mt-2">Supports .pdf, .docx, .txt, .md, .csv (Processed securely on backend)</p>
          </>
        )}
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Indexed Documents</h3>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-muted">
              No documents indexed yet. Upload your first file above.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{doc.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span>{doc.file_type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {doc.is_indexed ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Indexed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
