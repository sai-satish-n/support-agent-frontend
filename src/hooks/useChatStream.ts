import { useState, useCallback } from 'react'
import { ChatMessage } from '@/services/chat'

interface UseChatStreamReturn {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  streaming: boolean
  agentState: string | null
  sendMessageStream: (ticketId: string, content: string) => Promise<void>
}

export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [agentState, setAgentState] = useState<string | null>(null)

  const sendMessageStream = useCallback(async (ticketId: string, content: string) => {
    if (!content.trim() || streaming) return

    const userMessage = content.trim()
    const tempId = Date.now().toString()
    
    setMessages(prev => [...prev, {
      id: tempId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }])

    setStreaming(true)
    setAgentState('Analyzing intent...')

    const assistantTempId = `assistant-${tempId}`
    setMessages(prev => [...prev, {
      id: assistantTempId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }])

    try {
      const token = localStorage.getItem('auth_token')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      
      const response = await fetch(`${baseUrl}/chat/${ticketId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: userMessage })
      })

      if (response.status === 429) {
        import('react-hot-toast').then(({ toast }) => {
          toast.error('AI Rate Limit Exceeded. Please wait a moment and try again.', {
            duration: 4000,
            icon: '⏳'
          })
        })
        throw new Error('Rate limit exceeded')
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      setAgentState('Generating response...')
      
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.token) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantTempId 
                      ? { ...msg, content: msg.content + data.token }
                      : msg
                  ))
                } else if (data.metadata) {
                  // Metadata chunk arrived, we might receive state details
                  if (data.metadata.agent_state) {
                    setAgentState(data.metadata.agent_state)
                  }
                  if (data.metadata.confidence !== undefined || data.metadata.message_id) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantTempId 
                        ? { 
                            ...msg, 
                            ...(data.metadata.confidence !== undefined && { confidence: data.metadata.confidence }),
                            ...(data.metadata.message_id && { id: data.metadata.message_id })
                          }
                        : msg
                    ))
                  }
                } else if (data.done) {
                  done = true
                } else if (data.error) {
                  console.error('Stream error:', data.error)
                  setAgentState(`Error: ${data.error}`)
                }
              } catch (e) {
                // Ignore parse errors from incomplete JSON chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to stream response', err)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantTempId 
          ? { ...msg, content: 'Error communicating with AI agent. Please try again.' }
          : msg
      ))
    } finally {
      setStreaming(false)
      setAgentState(null)
      // Clean up the empty assistant bubble if the stream bypassed generating a response
      // (e.g. when a human agent is assigned and the AI is skipped entirely)
      setMessages(prev => prev.filter(msg => msg.id !== assistantTempId || msg.content.trim() !== ''))
    }
  }, [streaming])

  return { messages, setMessages, streaming, agentState, sendMessageStream }
}
