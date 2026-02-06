import { useUserManagement } from './hooks/useUserManagement';
import UserManagementLayout from './components/UserManagementLayout';

const AdminUsers = () => {
  const {
    users,
    total,
    page,
    setPage,
    search,
    setSearch,
    filterVip,
    setFilterVip,
    filterBlocked,
    setFilterBlocked,
    loading,
    selectedUser,
    setSelectedUser,
    showDetails,
    setShowDetails,
    showBlockDialog,
    setShowBlockDialog,
    showBanDialog,
    setShowBanDialog,
    showVipDialog,
    setShowVipDialog,
    showMessageDialog,
    setShowMessageDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    blockReason,
    setBlockReason,
    banReason,
    setBanReason,
    vipDays,
    setVipDays,
    messageText,
    setMessageText,
    loadUserDetails,
    blockUser,
    banUser,
    unblockUser,
    unbanUser,
    setVip,
    removeVip,
    sendMessage,
    deleteUser,
    verifyUser,
    unverifyUser
  } = useUserManagement();

  return (
    <UserManagementLayout
      total={total}
      search={search}
      setSearch={setSearch}
      filterVip={filterVip}
      setFilterVip={setFilterVip}
      filterBlocked={filterBlocked}
      setFilterBlocked={setFilterBlocked}
      users={users}
      loading={loading}
      page={page}
      setPage={setPage}
      selectedUser={selectedUser}
      showDetails={showDetails}
      setShowDetails={setShowDetails}
      showBlockDialog={showBlockDialog}
      setShowBlockDialog={setShowBlockDialog}
      showBanDialog={showBanDialog}
      setShowBanDialog={setShowBanDialog}
      showVipDialog={showVipDialog}
      setShowVipDialog={setShowVipDialog}
      showMessageDialog={showMessageDialog}
      setShowMessageDialog={setShowMessageDialog}
      showDeleteDialog={showDeleteDialog}
      setShowDeleteDialog={setShowDeleteDialog}
      blockReason={blockReason}
      setBlockReason={setBlockReason}
      banReason={banReason}
      setBanReason={setBanReason}
      vipDays={vipDays}
      setVipDays={setVipDays}
      messageText={messageText}
      setMessageText={setMessageText}
      onLoadDetails={loadUserDetails}
      onSendMessage={(user) => { setSelectedUser(user); setShowMessageDialog(true); }}
      onVerify={verifyUser}
      onUnverify={unverifyUser}
      onBlock={(user) => { setSelectedUser(user); setShowBlockDialog(true); }}
      onUnblock={unblockUser}
      onBan={(user) => { setSelectedUser(user); setShowBanDialog(true); }}
      onUnban={unbanUser}
      onSetVip={(user) => { setSelectedUser(user); setShowVipDialog(true); }}
      onRemoveVip={removeVip}
      onDelete={(user) => { setSelectedUser(user); setShowDeleteDialog(true); }}
      blockUser={blockUser}
      banUser={banUser}
      setVip={setVip}
      sendMessage={sendMessage}
      deleteUser={deleteUser}
    />
  );
};

export default AdminUsers;
