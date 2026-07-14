import { useEffect, useRef } from 'react'
import { Send, X } from 'lucide-react'

const ChatPanel = ({ messages, newMessage, setNewMessage, sendMessage, onClose }) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 shadow-2xl flex flex-col">
      <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-semibold">Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center text-sm">No messages yet</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-400 font-medium text-sm">
                  {message.sender}
                </span>
                <span className="text-gray-500 text-xs">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-white text-sm">{message.text}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
