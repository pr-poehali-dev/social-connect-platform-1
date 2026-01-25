import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import ReminderDialog from './ReminderDialog';

interface Reminder {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  completed: boolean;
}

interface CalendarViewProps {
  reminders: Reminder[];
  onAddReminder: (data: { title: string; description?: string; date: string; time?: string }) => void;
  onEditReminder: (id: number, data: Partial<Reminder>) => void;
  onDeleteReminder: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
}

const CalendarView = ({ 
  reminders, 
  onAddReminder, 
  onEditReminder, 
  onDeleteReminder,
  onToggleComplete 
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getRemindersForDate = (date: string) => {
    return reminders.filter(r => r.date === date);
  };

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const handleAddClick = (date: string) => {
    setSelectedDate(date);
    setEditingReminder(null);
    setDialogOpen(true);
  };

  const handleEditClick = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setDialogOpen(true);
  };

  const handleSaveReminder = (data: { title: string; description?: string; date: string; time?: string }) => {
    if (editingReminder) {
      onEditReminder(editingReminder.id, data);
    } else {
      onAddReminder(data);
    }
    setDialogOpen(false);
    setEditingReminder(null);
  };

  const days = [];
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayReminders = getRemindersForDate(dateStr);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    days.push(
      <Card
        key={day}
        className={`h-24 p-2 cursor-pointer hover:shadow-md transition-shadow ${
          isToday ? 'border-primary border-2' : ''
        }`}
        onClick={() => handleAddClick(dateStr)}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
            {day}
          </span>
          {dayReminders.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {dayReminders.length}
            </Badge>
          )}
        </div>
        <div className="space-y-1 overflow-y-auto max-h-14">
          {dayReminders.slice(0, 2).map((reminder) => (
            <div
              key={reminder.id}
              className={`text-xs p-1 rounded truncate ${
                reminder.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(reminder);
              }}
            >
              {reminder.time && `${reminder.time.slice(0, 5)} `}
              {reminder.title}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const upcomingReminders = reminders
    .filter(r => !r.completed && new Date(r.date) >= new Date())
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '').localeCompare(b.time || '');
    })
    .slice(0, 5);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <Icon name="ChevronLeft" size={20} />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Ближайшие напоминания</h3>
            <Button size="sm" onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setEditingReminder(null);
              setDialogOpen(true);
            }}>
              <Icon name="Plus" size={16} className="mr-1" />
              Добавить
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Calendar" size={48} className="mx-auto mb-2 opacity-50" />
                <p>Нет предстоящих напоминаний</p>
              </div>
            ) : (
              upcomingReminders.map((reminder) => (
                <Card key={reminder.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => onToggleComplete(reminder.id, !reminder.completed)}
                        >
                          <Icon 
                            name={reminder.completed ? "CheckCircle2" : "Circle"} 
                            size={16}
                            className={reminder.completed ? "text-green-600" : "text-muted-foreground"}
                          />
                        </Button>
                        <h4 className={`font-medium ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {reminder.title}
                        </h4>
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground ml-7 mb-1">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 ml-7 text-xs text-muted-foreground">
                        <Icon name="Calendar" size={12} />
                        {formatDateForDisplay(reminder.date)}
                        {reminder.time && (
                          <>
                            <Icon name="Clock" size={12} />
                            {reminder.time.slice(0, 5)}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(reminder)}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDeleteReminder(reminder.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>

      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveReminder}
        reminder={editingReminder}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
};

export default CalendarView;
