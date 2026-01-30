import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/components/events/EventCard';

export interface NewEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  address: string;
  category: string;
  price: number;
  maxParticipants: number;
  paymentUrl: string;
  image: string | undefined;
}

export const useMyEvents = () => {
  const { toast } = useToast();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [completedEvents, setCompletedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState<NewEventData>({
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
          status: evt.is_active ? 'active' : 'completed',
          userId: evt.user_id
        }));
        
        const my = formattedEvents.filter((e: any) => e.userId === userId && e.status === 'active');
        const completed = formattedEvents.filter((e: any) => e.userId === userId && e.status === 'completed');
        
        let participating: Event[] = [];
        if (userId) {
          const participatingResponse = await fetch(`https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?action=participating&user_id=${userId}`);
          const participatingData = await participatingResponse.json();
          participating = participatingData.map((evt: any) => ({
            id: evt.id,
            title: evt.title,
            description: evt.description || '',
            date: evt.event_date,
            time: evt.event_time,
            location: evt.location,
            city: evt.city,
            address: evt.address || '',
            category: evt.category || 'entertainment',
            price: Number(evt.price) || 0,
            participants: evt.participants || 0,
            maxParticipants: evt.max_participants || 10,
            image: evt.image_url || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
            paymentUrl: evt.payment_url || '',
            status: evt.is_active ? 'active' : 'completed'
          }));
        }
        
        setMyEvents(my);
        setParticipatingEvents(participating);
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

  const handleEditEvent = (eventId: number, setEditingEventId: (id: number | null) => void, setIsEditModalOpen: (open: boolean) => void) => {
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
        address: eventToEdit.address || '',
        category: eventToEdit.category,
        price: eventToEdit.price,
        maxParticipants: eventToEdit.maxParticipants,
        paymentUrl: eventToEdit.paymentUrl || '',
        image: eventToEdit.image
      });
      setEditingEventId(eventId);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?id=${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: false,
          title: myEvents.find(e => e.id === eventId)?.title || '',
          description: myEvents.find(e => e.id === eventId)?.description || '',
          event_date: myEvents.find(e => e.id === eventId)?.date || '',
          event_time: myEvents.find(e => e.id === eventId)?.time || '',
          location: myEvents.find(e => e.id === eventId)?.location || '',
          city: myEvents.find(e => e.id === eventId)?.city || '',
          address: myEvents.find(e => e.id === eventId)?.address || '',
          category: myEvents.find(e => e.id === eventId)?.category || 'entertainment',
          price: myEvents.find(e => e.id === eventId)?.price || 0,
          max_participants: myEvents.find(e => e.id === eventId)?.maxParticipants || 10,
          image_url: myEvents.find(e => e.id === eventId)?.image || '',
          payment_url: myEvents.find(e => e.id === eventId)?.paymentUrl || ''
        })
      });

      if (response.ok) {
        setMyEvents(prev => prev.filter(e => e.id !== eventId));
        setCompletedEvents(prev => [...prev, { ...myEvents.find(e => e.id === eventId)!, status: 'completed' }]);
        toast({
          title: 'Мероприятие удалено',
          description: 'Ваше мероприятие было удалено',
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить мероприятие',
        variant: 'destructive'
      });
    }
  };

  const handleCancelParticipation = async (eventId: number) => {
    const userProfile = localStorage.getItem('userProfile');
    const userId = userProfile ? JSON.parse(userProfile).id : null;

    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось определить пользователя',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'leave',
          event_id: eventId,
          user_id: userId
        })
      });

      if (response.ok) {
        setParticipatingEvents(prev => prev.filter(e => e.id !== eventId));
        toast({
          title: 'Вы отменили участие',
          description: 'Вы больше не участвуете в этом мероприятии',
        });
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить участие',
        variant: 'destructive'
      });
    }
  };

  const handleSaveEdit = async (editingEventId: number | null, setIsEditModalOpen: (open: boolean) => void, setEditingEventId: (id: number | null) => void) => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.city) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (newEvent.price > 0 && !newEvent.paymentUrl) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте ссылку на оплату для платного мероприятия',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8?id=${editingEventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.date,
          event_time: newEvent.time,
          location: newEvent.location,
          city: newEvent.city,
          address: newEvent.address,
          category: newEvent.category,
          price: newEvent.price,
          max_participants: newEvent.maxParticipants,
          image_url: newEvent.image || '',
          payment_url: newEvent.paymentUrl,
          is_active: true
        })
      });

      if (response.ok) {
        toast({
          title: 'Изменения сохранены!',
          description: `Мероприятие "${newEvent.title}" обновлено`,
        });

        const fetchResponse = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8');
        const data = await fetchResponse.json();
        
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
          address: evt.address || '',
          category: evt.category || 'entertainment',
          price: Number(evt.price) || 0,
          participants: evt.participants || 0,
          maxParticipants: evt.max_participants || 10,
          image: evt.image_url || '',
          paymentUrl: evt.payment_url || '',
          status: evt.is_active ? 'active' : 'completed',
          userId: evt.user_id
        }));
        
        const my = formattedEvents.filter((e: any) => e.userId === userId && e.status === 'active');
        const completed = formattedEvents.filter((e: any) => e.userId === userId && e.status === 'completed');
        
        setMyEvents(my);
        setCompletedEvents(completed);
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
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить мероприятие',
        variant: 'destructive'
      });
    }
  };

  const handleCreateEvent = async (setIsCreateModalOpen: (open: boolean) => void) => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.city) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (newEvent.price > 0 && !newEvent.paymentUrl) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте ссылку на оплату для платного мероприятия',
        variant: 'destructive'
      });
      return;
    }

    try {
      const userProfile = localStorage.getItem('userProfile');
      const userId = userProfile ? JSON.parse(userProfile).id : null;
      const userName = userProfile ? JSON.parse(userProfile).name : 'Организатор';
      const userAvatar = userProfile ? JSON.parse(userProfile).avatar : '';

      if (!userId) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо авторизоваться',
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch('https://functions.poehali.dev/7505fed2-1ea4-42dd-aa40-46c2608663b8', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.date,
          event_time: newEvent.time,
          location: newEvent.location,
          city: newEvent.city,
          address: newEvent.address,
          author_name: userName,
          author_avatar: userAvatar,
          category: newEvent.category,
          price: newEvent.price,
          max_participants: newEvent.maxParticipants,
          image_url: newEvent.image || '',
          payment_url: newEvent.paymentUrl
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Мероприятие создано!',
          description: `"${newEvent.title}" успешно добавлено`,
        });

        const newEventData: Event = {
          id: result.id,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          city: newEvent.city,
          address: newEvent.address,
          category: newEvent.category,
          price: newEvent.price,
          participants: 0,
          maxParticipants: newEvent.maxParticipants,
          image: newEvent.image || 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/cc85b025-6024-45ac-9ff4-b21ce3691608.jpg',
          paymentUrl: newEvent.paymentUrl,
          status: 'active'
        };

        setMyEvents(prev => [newEventData, ...prev]);
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
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать мероприятие',
        variant: 'destructive'
      });
    }
  };

  return {
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
  };
};
