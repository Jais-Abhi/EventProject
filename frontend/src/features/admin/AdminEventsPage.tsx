import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

// IST timezone identifier
const IST_TZ = 'Asia/Kolkata';

/**
 * Convert a UTC ISO string to a datetime-local input value displayed in IST.
 * Uses Intl to format the date correctly in IST, avoiding double-offset bugs.
 */
function toISTInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format as YYYY-MM-DDTHH:mm in IST
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Convert a datetime-local input value (which the browser treats as LOCAL time)
 * to a UTC ISO string. Since the server is in India and the admin is in India,
 * the browser's local time IS IST — so we just parse it directly.
 */
function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    // Append +05:30 explicitly so it's always treated as IST regardless of browser locale
    return new Date(localValue + ':00+05:30').toISOString();
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/events/getAllEvent');
            setEvents(response.data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Validate
            if (!currentEvent.title || !currentEvent.startTime || !currentEvent.endTime) {
                toast.error('Please fill required fields');
                return;
            }

            const payload = {
                ...currentEvent,
                type: "MCQ", // Locked to MCQ
                // Ensure dates are ISO strings
                startTime: new Date(currentEvent.startTime!).toISOString(),
                endTime: new Date(currentEvent.endTime!).toISOString(),
            };

            if (currentEvent.id) {
                await api.put(`/api/events/updateEvent/${currentEvent.id}`, payload);
                toast.success('Event updated');
            } else {
                await api.post('/api/events/createEvent', payload);
                toast.success('Event created');
            }
            setIsEditing(false);
            setCurrentEvent({});
            fetchEvents();
        } catch (error) {
            toast.error('Failed to save event');
        }
    };

    const openEdit = (event: Event) => {
        setCurrentEvent({
            ...event,
        });
        setIsEditing(true);
    };

    const openCreate = () => {
        setCurrentEvent({
            type: 'MCQ',
            durationInMinutes: 60,
            totalMarks: 100,
            attendanceProcessed: false,
            status: 'UPCOMING'
        });
        setIsEditing(true);
    };

    if (isLoading && !isEditing) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create Event</Button>
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader><CardTitle>{currentEvent.id ? 'Edit Event' : 'New Event'}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Title"
                            value={currentEvent.title || ''}
                            onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Time (IST)"
                                type="datetime-local"
                                value={currentEvent.startTime ? toISTInput(currentEvent.startTime) : ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, startTime: fromISTInput(e.target.value) })}
                            />
                            <Input
                                label="End Time (IST)"
                                type="datetime-local"
                                value={currentEvent.endTime ? toISTInput(currentEvent.endTime) : ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, endTime: fromISTInput(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Duration (mins)"
                                type="number"
                                value={currentEvent.durationInMinutes || ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, durationInMinutes: parseInt(e.target.value) })}
                            />
                            <Input
                                label="Total Marks"
                                type="number"
                                value={currentEvent.totalMarks || ''}
                                onChange={e => setCurrentEvent({ ...currentEvent, totalMarks: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {events.map(event => (
                        <Card key={event.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold">{event.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(event.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })} — {event.status}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => openEdit(event)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="outline" onClick={() => window.location.href = `/admin/events/${event.id}/questions`}>Questions</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
