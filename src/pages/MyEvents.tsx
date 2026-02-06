import { useState } from 'react';
import Navigation from '@/components/Navigation';
import EventTabs from '@/components/events/EventTabs';
import CreateEventModal from '@/components/events/CreateEventModal';
import MyEventsHeader from '@/components/events/MyEventsHeader';
import MyEventsContent from '@/components/events/MyEventsContent';
import { useMyEvents } from '@/hooks/useMyEvents';

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'participating' | 'completed'>('my');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const {
    myEvents,
    participatingEvents,
    completedEvents,
    loading,
    newEvent,
    setNewEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleCancelParticipation,
    handleSaveEdit,
    handleCreateEvent
  } = useMyEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const onEditEvent = (eventId: number) => {
    handleEditEvent(eventId, setEditingEventId, setIsEditModalOpen);
  };

  const onSaveEdit = () => {
    handleSaveEdit(editingEventId, setIsEditModalOpen, setEditingEventId);
  };

  const onCreateEvent = () => {
    handleCreateEvent(setIsCreateModalOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 lg:overflow-auto overflow-y-auto overflow-x-hidden">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <MyEventsHeader onCreateClick={() => setIsCreateModalOpen(true)} />

            <EventTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              myEventsCount={myEvents.length}
              participatingCount={participatingEvents.length}
              completedCount={completedEvents.length}
            />

            <MyEventsContent
              activeTab={activeTab}
              myEvents={myEvents}
              participatingEvents={participatingEvents}
              completedEvents={completedEvents}
              formatDate={formatDate}
              onEdit={onEditEvent}
              onDelete={handleDeleteEvent}
              onCancelParticipation={handleCancelParticipation}
            />
          </div>
        </div>
      </main>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewEvent({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            city: '',
            address: '',
            category: 'entertainment',
            price: 0,
            maxParticipants: 10,
            paymentUrl: '',
            image: undefined
          });
        }}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={onCreateEvent}
      />

      <CreateEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEventId(null);
          setNewEvent({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            city: '',
            address: '',
            category: 'entertainment',
            price: 0,
            maxParticipants: 10,
            paymentUrl: '',
            image: undefined
          });
        }}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={onSaveEdit}
        isEditing={true}
      />
    </div>
  );
};

export default MyEvents;