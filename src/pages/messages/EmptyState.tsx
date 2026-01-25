import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface EmptyStateProps {
  type: 'calls' | 'contacts';
}

const EmptyState = ({ type }: EmptyStateProps) => {
  if (type === 'calls') {
    return (
      <Card className="rounded-3xl border-2">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Icon name="PhoneCall" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">История звонков</h3>
            <p className="text-muted-foreground">Здесь будет отображаться история ваших звонков</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-2">
      <CardContent className="p-6">
        <div className="text-center py-12">
          <Icon name="BookUser" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Телефонная книга</h3>
          <p className="text-muted-foreground">Здесь будут отображаться ваши контакты</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
