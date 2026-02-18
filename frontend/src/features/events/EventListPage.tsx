import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Clock, CheckCircle } from 'lucide-react';


export default function EventListPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/api/events/getAllEvent');
                setEvents(response.data);
            } catch (error) {
                // toast.error('Failed to load events'); 
                // Error handling in interceptor
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE': return 'text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold';
            case 'UPCOMING': return 'text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold';
            case 'COMPLETED': return 'text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-bold';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Quiz Studio</h1>
                {/* Admin Create Button could go here */}
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No events found</h3>
                    <p className="mt-1 text-sm text-gray-500">Check back later for upcoming quizzes.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl line-clamp-1" title={event.title}>{event.title}</CardTitle>
                                    <span className={getStatusColor(event.status)}>{event.status}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(event.startTime).toLocaleString()}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {event.durationInMinutes} mins
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {event.totalMarks} Marks
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to={`/events/${event.id}`} className="w-full">
                                    <Button className="w-full" variant={event.status === 'COMPLETED' ? 'outline' : 'primary'}>
                                        {event.status === 'LIVE' ? 'Join Now' : 'View Details'}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
