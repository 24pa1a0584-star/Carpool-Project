import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IConversation, IMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageSquare, Send, User, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch user's active conversations
  const { data: convData, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data;
    },
    refetchInterval: 10000, // Poll fallback every 10s
  });

  const conversations: IConversation[] = convData?.conversations || [];

  // Automatically select first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [conversations, activeConversationId]);

  // 2. Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConversationId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };

    fetchMessages();

    // Socket: Join conversation room
    if (socket) {
      socket.emit('join_conversation', activeConversationId);

      const handleNewMessage = (msg: IMessage) => {
        if (msg.conversationId === activeConversationId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.emit('leave_conversation', activeConversationId);
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [activeConversationId, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeConversationId || isSending) return;

    const content = inputContent.trim();
    setInputContent('');
    setIsSending(true);

    try {
      // Send via HTTP (with socket fallback event)
      const res = await api.post(`/messages/${activeConversationId}`, { content });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        refetchConversations();

        // Also emit via socket if connected
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConversationId,
            content,
          });
        }
      }
    } catch (err: any) {
      toast.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c._id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(
    (p) => p._id !== user?._id
  );

  return (
    <div className="min-h-screen pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
      <div className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-navy">
          Ride Messages & Coordination
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60">
          Chat securely with verified passengers and drivers regarding pickup landmarks.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-brand-violet/15 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[600px]">
        {/* Conversation Sidebar */}
        <aside className={`md:col-span-4 border-r border-brand-violet/10 flex flex-col h-full bg-brand-ivory/40 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-brand-violet/10 font-bold text-xs uppercase tracking-wider text-brand-navy/60">
            Active Ride Chats ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-brand-violet/5">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-navy/50 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-brand-violet/30" />
                <p>No conversations yet. Once a seat is reserved, chat opens here!</p>
              </div>
            ) : (
              conversations.map((c) => {
                const other = c.participants.find((p) => p._id !== user?._id);
                const isSelected = c._id === activeConversationId;
                return (
                  <button
                    key={c._id}
                    onClick={() => setActiveConversationId(c._id)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-violet/10 border-l-4 border-brand-violet'
                        : 'hover:bg-brand-lavender/40'
                    }`}
                  >
                    <img
                      src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={other?.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-brand-violet/20"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-brand-navy truncate">
                          {other?.name || 'Commuter'}
                        </span>
                        <span className="text-[10px] text-brand-navy/40">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-brand-violet font-semibold truncate">
                        {c.rideId?.origin?.city} → {c.rideId?.destination?.city}
                      </p>
                      <p className="text-xs text-brand-navy/60 truncate mt-0.5">
                        {c.lastMessage || 'Conversation started'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Message Thread View */}
        <main className={`md:col-span-8 flex flex-col h-full bg-white ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-brand-violet/10 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1.5 -ml-1 text-brand-navy/60"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={otherParticipant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={otherParticipant?.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-violet/20"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-brand-navy">
                      {otherParticipant?.name || 'Commuter'}
                    </h3>
                    <p className="text-xs text-brand-navy/50">
                      Trip: {activeConversation.rideId?.origin?.city} → {activeConversation.rideId?.destination?.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-brand-ivory/20">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-brand-navy/40 space-y-1">
                    <p>No messages yet.</p>
                    <p>Say hi to coordinate your pickup landmark!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId?._id === user?._id || (m.senderId as any) === user?._id;
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-3xl px-4 py-2.5 text-sm shadow-sm ${
                            isMe
                              ? 'bg-brand-violet text-white rounded-br-xs'
                              : 'bg-white border border-brand-violet/15 text-brand-navy rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed break-words">{m.content}</p>
                        </div>
                        <span className="text-[10px] text-brand-navy/40 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-brand-violet/10 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="flex-1 bg-brand-lavender/30 rounded-2xl px-4 py-2.5 text-sm text-brand-navy outline-none border border-transparent focus:border-brand-violet"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-2xl px-4 py-2.5"
                  disabled={!inputContent.trim() || isSending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-brand-navy/50 space-y-3">
              <MessageSquare className="w-12 h-12 text-brand-violet/20" />
              <p>Select a conversation from the sidebar to start chatting.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
