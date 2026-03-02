import React, { useState } from 'react'
import { Plus, Send, Bot } from 'lucide-react'

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I am the Arni Medica AI Assistant. I can help you with quality events, regulatory compliance, and eQMS operations. How can I assist you today?',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }
    setMessages([...messages, userMessage])
    setInputValue('')

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: 'I understand your question. I can help you analyze quality data, suggest process improvements, and support regulatory compliance activities.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-slate-400">Get intelligent insights, recommendations, and support for your eQMS operations</p>
      </div>

      <div className="card p-6 h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-t border-eqms-border pt-4">
          <input
            type="text"
            placeholder="Ask me anything about your eQMS..."
            className="input-field flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
