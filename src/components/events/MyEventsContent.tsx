import { Card } from '@/components/ui/card';
import EventCard, { Event } from '@/components/events/EventCard';

interface MyEventsContentProps {
  activeTab: 'my' | 'participating' | 'completed';
  myEvents: Event[];
  participatingEvents: Event[];
  completedEvents: Event[];
  formatDate: (dateString: string) => string;
  onEdit: (eventId: number) => void;
  onDelete: (eventId: number) => void;
  onCancelParticipation: (eventId: number) => void;
}

const MyEventsContent = ({
  activeTab,
  myEvents,
  participatingEvents,
  completedEvents,
  formatDate,
  onEdit,
  onDelete,
  onCancelParticipation
}: MyEventsContentProps) => {
  const currentEvents = activeTab === 'my' ? myEvents : activeTab === 'participating' ? participatingEvents : completedEvents;

  if (currentEvents.length === 0) {
    return (
      <Card className="p-12 text-center rounded-3xl">
        <p className="text-muted-foreground">
          {activeTab === 'my' && 'У вас пока нет созданных мероприятий'}
          {activeTab === 'participating' && 'Вы пока не участвуете в мероприятиях'}
          {activeTab === 'completed' && 'У вас нет завершённых мероприятий'}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {currentEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          activeTab={activeTab}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancelParticipation={onCancelParticipation}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default MyEventsContent;
