'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

type Message = {
  sender: string;
  senderRole: 'consumer' | 'superadmin' | 'contentmanager';
  content: string;
  timestamp: string;
  read: boolean;
};

type ChatWindowProps = {
  purchaseId: string;
  currentUserRole: 'consumer' | 'superadmin' | 'contentmanager';
  currentUserId: string;
  onClose?: () => void;
  isMinimized?: boolean;
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  purchaseId,
  currentUserRole,
  currentUserId,
  onClose,
  isMinimized = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage: sendWebSocketMessage, lastMessage } = useChatWebSocket();

  useEffect(() => {
    fetchChatHistory();
    // clear new-message flag when opening chat
    setHasNewMessage(false);
  }, [purchaseId]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.purchaseId === purchaseId) {
          setMessages(prev => [...prev, data.message]);
          // If the incoming message was sent by someone else, show notification
          if (data.message.sender !== currentUserId) {
            setHasNewMessage(true);
          }
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, purchaseId, currentUserId]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${purchaseId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        // user is viewing history; clear new-message indicator
        setHasNewMessage(false);
        scrollToBottom();
      } else {
        console.error('Failed to fetch chat history:', response.status);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUserId,
      senderRole: currentUserRole,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      const response = await fetch(`/api/chat/${purchaseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        credentials: 'include'
      });

      if (response.ok) {
        sendWebSocketMessage(JSON.stringify({ type: 'chat', purchaseId, message }));
        setMessages(prev => [...prev, message]);
        // user sent a message, clear notification
        setHasNewMessage(false);
        setNewMessage('');
        scrollToBottom();
      } else {
        const data = await response.json().catch(() => ({}));
        console.error('Failed to send message:', data.error || response.status);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg p-3 cursor-pointer hover:bg-gray-50">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {(messages.some(m => !m.read && m.senderRole !== 'superadmin') || hasNewMessage) && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-pulse border-2 border-white"></span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-lg h-[500px] w-[350px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white rounded-t-lg">
        <h3 className="font-semibold">Chat Support</h3>
        {onClose && (
          <div className="flex items-center gap-3">
            {hasNewMessage && (
              <span className="inline-block h-3 w-3 bg-amber-400 rounded-full animate-pulse mr-1 border-2 border-white" title="New message"></span>
            )}
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.senderRole === 'superadmin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2 ${message.senderRole === 'superadmin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${message.senderRole === 'superadmin' ? 'text-indigo-100' : 'text-gray-500'}`}>{formatTimestamp(message.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex items-center gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setHasNewMessage(false)}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;