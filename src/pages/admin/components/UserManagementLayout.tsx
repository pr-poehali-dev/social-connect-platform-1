import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import UserFilters from './UserFilters';
import UserList from './UserList';
import UserDetailsDialog from './UserDetailsDialog';
import UserActionDialogs from './UserActionDialogs';
import { User, UserDetails } from '../types';

interface UserManagementLayoutProps {
  total: number;
  search: string;
  setSearch: (search: string) => void;
  filterVip: string;
  setFilterVip: (filter: string) => void;
  filterBlocked: string;
  setFilterBlocked: (filter: string) => void;
  users: User[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
  selectedUser: UserDetails | null;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  showBlockDialog: boolean;
  setShowBlockDialog: (show: boolean) => void;
  showBanDialog: boolean;
  setShowBanDialog: (show: boolean) => void;
  showVipDialog: boolean;
  setShowVipDialog: (show: boolean) => void;
  showMessageDialog: boolean;
  setShowMessageDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  blockReason: string;
  setBlockReason: (reason: string) => void;
  banReason: string;
  setBanReason: (reason: string) => void;
  vipDays: string;
  setVipDays: (days: string) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  onLoadDetails: (userId: number) => void;
  onSendMessage: (user: User) => void;
  onVerify: (userId: number) => void;
  onUnverify: (userId: number) => void;
  onBlock: (user: User) => void;
  onUnblock: (userId: number) => void;
  onBan: (user: User) => void;
  onUnban: (userId: number) => void;
  onSetVip: (user: User) => void;
  onRemoveVip: (userId: number) => void;
  onDelete: (user: User) => void;
  blockUser: () => void;
  banUser: () => void;
  setVip: () => void;
  sendMessage: () => void;
  deleteUser: () => void;
}

const UserManagementLayout = (props: UserManagementLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <Icon name="ArrowLeft" size={24} className="text-white" />
              <h1 className="text-xl font-bold text-white">Управление пользователями</h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Card className="bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Пользователи ({props.total})</CardTitle>
            <UserFilters
              search={props.search}
              setSearch={props.setSearch}
              filterVip={props.filterVip}
              setFilterVip={props.setFilterVip}
              filterBlocked={props.filterBlocked}
              setFilterBlocked={props.setFilterBlocked}
            />
          </CardHeader>
          <CardContent>
            <UserList
              users={props.users}
              loading={props.loading}
              onLoadDetails={props.onLoadDetails}
              onSendMessage={props.onSendMessage}
              onVerify={props.onVerify}
              onUnverify={props.onUnverify}
              onBlock={props.onBlock}
              onUnblock={props.onUnblock}
              onBan={props.onBan}
              onUnban={props.onUnban}
              onSetVip={props.onSetVip}
              onRemoveVip={props.onRemoveVip}
              onDelete={props.onDelete}
            />

            <div className="flex justify-center gap-2 mt-6">
              <Button disabled={props.page === 1} onClick={() => props.setPage(props.page - 1)}>
                Назад
              </Button>
              <span className="py-2 px-4">Страница {props.page}</span>
              <Button disabled={props.users.length < 50} onClick={() => props.setPage(props.page + 1)}>
                Вперёд
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <UserDetailsDialog
        open={props.showDetails}
        onOpenChange={props.setShowDetails}
        user={props.selectedUser}
      />

      <UserActionDialogs
        showBlockDialog={props.showBlockDialog}
        setShowBlockDialog={props.setShowBlockDialog}
        showBanDialog={props.showBanDialog}
        setShowBanDialog={props.setShowBanDialog}
        showVipDialog={props.showVipDialog}
        setShowVipDialog={props.setShowVipDialog}
        showMessageDialog={props.showMessageDialog}
        setShowMessageDialog={props.setShowMessageDialog}
        showDeleteDialog={props.showDeleteDialog}
        setShowDeleteDialog={props.setShowDeleteDialog}
        blockReason={props.blockReason}
        setBlockReason={props.setBlockReason}
        banReason={props.banReason}
        setBanReason={props.setBanReason}
        vipDays={props.vipDays}
        setVipDays={props.setVipDays}
        messageText={props.messageText}
        setMessageText={props.setMessageText}
        selectedUser={props.selectedUser}
        blockUser={props.blockUser}
        banUser={props.banUser}
        setVip={props.setVip}
        sendMessage={props.sendMessage}
        deleteUser={props.deleteUser}
      />
    </div>
  );
};

export default UserManagementLayout;
