import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Tab {
  value: string;
  label: string;
  icon: string;
}

interface MessagesTabsProps {
  tabs: Tab[];
  activeTab: string;
  chats: any[];
  onTabChange: (tab: string) => void;
}

const MessagesTabs = ({ tabs, activeTab, chats, onTabChange }: MessagesTabsProps) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const count = chats.filter(c => c.type === tab.value).reduce((sum, c) => sum + (c.unread || 0), 0);
        return (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? 'default' : 'outline'}
            className="gap-2 rounded-2xl flex-shrink-0 relative"
            onClick={() => onTabChange(tab.value)}
          >
            <Icon name={tab.icon} size={18} />
            {tab.label}
            {count > 0 && (
              <Badge variant={activeTab === tab.value ? 'secondary' : 'destructive'} className="ml-1">
                {count > 9 ? '9+' : count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default MessagesTabs;