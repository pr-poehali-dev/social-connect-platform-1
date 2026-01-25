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
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={activeTab === tab.value ? 'default' : 'outline'}
          className="gap-2 rounded-2xl flex-shrink-0"
          onClick={() => onTabChange(tab.value)}
        >
          <Icon name={tab.icon} size={18} />
          {tab.label}
          {!['calls', 'contacts'].includes(tab.value) && (
            <Badge variant={activeTab === tab.value ? 'secondary' : 'outline'}>
              {chats.filter(c => c.type === tab.value).length}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default MessagesTabs;
