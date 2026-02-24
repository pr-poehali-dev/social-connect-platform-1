import { useMessagesData } from './messages/useMessagesData';
import MessagesLayout from './messages/MessagesLayout';

const Messages = () => {
  const data = useMessagesData();

  return (
    <MessagesLayout
      activeTab={data.activeTab}
      setActiveTab={data.setActiveTab}
      selectedChat={data.selectedChat}
      setSelectedChat={data.setSelectedChat}
      chats={data.chats}
      messages={data.messages}
      loading={data.loading}
      currentUserId={data.currentUserId}
      messageText={data.messageText}
      setMessageText={data.setMessageText}
      callModal={data.callModal}
      setCallModal={data.setCallModal}
      currentChat={data.currentChat}
      toast={data.toast}
      onSendMessage={data.handleSendMessage}
      onCall={data.handleCall}
      onDeleteChat={data.handleDeleteChat}
      onClearChat={data.handleClearChat}
      onBlockUser={data.handleBlockUser}
      onSosCreated={data.handleSosCreated}
      onSosResolve={data.handleSosResolve}
      activeSosConversationId={data.activeSosConversationId}
    />
  );
};

export default Messages;