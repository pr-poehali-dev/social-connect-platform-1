import Navigation from '@/components/Navigation';
import { VkCallModal } from '@/components/VkCallModal';
import SosButton from '@/components/sos/SosButton';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { Chat, Message } from './types';

interface MessagesLayoutProps {
  activeTab: 'personal' | 'group' | 'deal' | 'live';
  setActiveTab: (tab: 'personal' | 'group' | 'deal') => void;
  selectedChat: number | null;
  setSelectedChat: (id: number | null) => void;
  chats: Chat[];
  messages: Message[];
  loading: boolean;
  currentUserId: number | null;
  messageText: string;
  setMessageText: (text: string) => void;
  callModal: { isOpen: boolean; type: 'audio' | 'video' };
  setCallModal: (modal: { isOpen: boolean; type: 'audio' | 'video' }) => void;
  currentChat: Chat | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any;
  onSendMessage: () => void;
  onCall: (type: 'audio' | 'video') => void;
  onDeleteChat: (chatId: number) => void;
  onClearChat: (chatId: number) => void;
  onBlockUser: (userId: number) => void;
  onSosCreated: (conversationId: number) => void;
  onSosResolve: (sosRequestId: number, conversationId: number) => void;
}

export default function MessagesLayout({
  activeTab,
  setActiveTab,
  selectedChat,
  setSelectedChat,
  chats,
  messages,
  loading,
  currentUserId,
  messageText,
  setMessageText,
  callModal,
  setCallModal,
  currentChat,
  toast,
  onSendMessage,
  onCall,
  onDeleteChat,
  onClearChat,
  onBlockUser,
  onSosCreated,
  onSosResolve,
}: MessagesLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />

      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6 relative">
              <div className={`${selectedChat ? 'hidden lg:block' : 'block'}`}>
                <div className="flex justify-end mb-2">
                  <SosButton
                    token={localStorage.getItem('access_token') || ''}
                    onSosCreated={onSosCreated}
                    onToast={toast}
                  />
                </div>
                <ChatList
                  chats={chats}
                  loading={loading}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                  onDeleteChat={onDeleteChat}
                  activeTab={activeTab as 'personal' | 'group' | 'deal'}
                  onTabChange={(tab) => setActiveTab(tab)}
                />
              </div>

              {selectedChat && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:col-span-2 pt-0 pb-0 lg:pt-0 lg:pb-0">
                  <div className="h-full lg:px-0">
                    <ChatWindow
                      currentChat={currentChat}
                      messages={messages}
                      currentUserId={currentUserId}
                      messageText={messageText}
                      setMessageText={setMessageText}
                      onSendMessage={onSendMessage}
                      onCall={onCall}
                      toast={toast}
                      onClose={() => setSelectedChat(null)}
                      onClearChat={onClearChat}
                      onDeleteChat={onDeleteChat}
                      onBlockUser={onBlockUser}
                      onSosResolve={currentChat?.isSos && currentChat?.sosRequestId ? () => onSosResolve(currentChat.sosRequestId!, currentChat.id) : undefined}
                    />
                  </div>
                </div>
              )}

              {!selectedChat && (
                <div className="hidden lg:block lg:col-span-2">
                  <ChatWindow
                    currentChat={currentChat}
                    messages={messages}
                    currentUserId={currentUserId}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    onSendMessage={onSendMessage}
                    onCall={onCall}
                    toast={toast}
                    onClearChat={onClearChat}
                    onDeleteChat={onDeleteChat}
                    onBlockUser={onBlockUser}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <VkCallModal
        isOpen={callModal.isOpen}
        onClose={() => setCallModal({ ...callModal, isOpen: false })}
        recipientId={currentChat?.vkId ? parseInt(currentChat.vkId) : undefined}
        recipientName={currentChat?.name || 'Пользователь'}
        callType={callModal.type}
      />
    </div>
  );
}
