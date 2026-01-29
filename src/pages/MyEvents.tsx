import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import EventCard, { Event } from '@/components/events/EventCard';
import EventTabs from '@/components/events/EventTabs';
import CreateEventModal from '@/components/events/CreateEventModal';

const MyEvents = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'my' | 'participating' | 'completed'>('my');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
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
    image: undefined as string | undefined
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8');
        const data = await response.json();
        
        const userProfile = localStorage.getItem('userProfile');
        const userId = userProfile ? JSON.parse(userProfile).id : null;
        
        const formattedEvents = data.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description || '',
          date: evt.event_date,
          time: evt.event_time,
          location: evt.location,
          city: evt.city,
          category: evt.category || 'entertainment',
          price: Number(evt.price) || 0,
          participants: evt.participants || 0,
          maxParticipants: evt.max_participants || 10,
          image: evt.image_url || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
          status: evt.is_active ? 'active' : 'completed'
        }));
        
        const my = formattedEvents.filter((e: any) => e.status === 'active');
        const completed = formattedEvents.filter((e: any) => e.status === 'completed');
        
        setMyEvents(my);
        setParticipatingEvents([]);
        setCompletedEvents(completed);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить мероприятия',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleEditEvent = (eventId: number) => {
    const allEvents = [...myEvents, ...completedEvents];
    const eventToEdit = allEvents.find(e => e.id === eventId);
    
    if (eventToEdit) {
      setNewEvent({
        title: eventToEdit.title,
        description: eventToEdit.description,
        date: eventToEdit.date,
        time: eventToEdit.time,
        location: eventToEdit.location,
        city: eventToEdit.city,
        category: eventToEdit.category,
        price: eventToEdit.price,
        maxParticipants: eventToEdit.maxParticipants,
        image: eventToEdit.image
      });
      setEditingEventId(eventId);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    toast({
      title: 'Мероприятие удалено',
      description: 'Ваше мероприятие было удалено',
    });
  };

  const handleCancelParticipation = (eventId: number) => {
    toast({
      title: 'Вы отменили участие',
      description: 'Вы больше не участвуете в этом мероприятии',
    });
  };

  const handleSaveEdit = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.city) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Изменения сохранены!',
      description: `Мероприятие "${newEvent.title}" обновлено`,
    });

    setIsEditModalOpen(false);
    setEditingEventId(null);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      city: '',
      category: 'entertainment',
      price: 0,
      maxParticipants: 10,
      image: undefined
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.city) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Мероприятие создано!',
      description: `"${newEvent.title}" успешно добавлено`,
    });

    setIsCreateModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      city: '',
      category: 'entertainment',
      price: 0,
      maxParticipants: 10,
      image: undefined
    });
  };

  const currentEvents = activeTab === 'my' ? myEvents : activeTab === 'participating' ? participatingEvents : completedEvents;

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 lg:mb-8">
              <h1 className="font-bold whitespace-nowrap text-3xl mb-4">Мои мероприятия</h1>
              <Button
                className="gap-2 rounded-2xl w-full lg:hidden"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Icon name="Plus" size={18} />
                Создать новое мероприятие
              </Button>
            </div>

            <EventTabs
              activeTab={activeTab}
              myEventsCount={myEvents.length}
              participatingEventsCount={participatingEvents.length}
              completedEventsCount={completedEvents.length}
              onTabChange={setActiveTab}
              onCreateClick={() => setIsCreateModalOpen(true)}
            />

            {currentEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    activeTab={activeTab}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onCancelParticipation={handleCancelParticipation}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <Card className="max-w-md mx-auto text-center p-12 rounded-3xl">
                <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-semibold mb-2">
                  {activeTab === 'my' ? 'У вас пока нет мероприятий' : 'Вы ни в чём не участвуете'}
                </p>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'my' 
                    ? 'Создайте своё первое мероприятие' 
                    : 'Найдите интересные события и присоединяйтесь'}
                </p>
                {activeTab === 'my' && (
                  <Button className="gap-2 rounded-2xl" onClick={() => setIsCreateModalOpen(true)}>
                    <Icon name="Plus" size={18} />
                    Создать мероприятие
                  </Button>
                )}
              </Card>
            )}


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
            category: 'entertainment',
            price: 0,
            maxParticipants: 10,
            image: undefined
          });
        }}
        newEvent={newEvent}
        onEventChange={setNewEvent}
        onCreate={handleCreateEvent}
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
            category: 'entertainment',
            price: 0,
            maxParticipants: 10,
            image: undefined
          });
        }}
        newEvent={newEvent}
        onEventChange={setNewEvent}
        onCreate={handleSaveEdit}
        isEdit={true}
      />
    </div>
  );
};

export default MyEvents;