import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Event } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Calendar, Clock, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EventDetailsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    // Need to know if already registered? 
    // API doesn't allow checking registration status easily without failing?
    // We'll treat the "Register" button as idempotent or handle error "Already registered".
    // Actually, we can check if user is allowed to start.

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/api/events/getEventById/${eventId}`);
                setEvent(response.data);
            } catch (error) {
                navigate('/events');
            } finally {
                setIsLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId, navigate]);

    const handleRegister = async () => {
        if (!event || !user) return;
        setIsRegistering(true);
        try {
            // POST /api/registrations/{eventId} with studentId in header (handled by axios interceptor if auth_user is set)
            await api.post(`/api/registrations/${event.id}`);
            toast.success('Successfully registered for the event!');
            // Update UI? Maybe refresh or just show "Start" if live?
        } catch (error: any) {
            // If error says "already registered", that's fine.
            if (error.response?.data?.message?.includes('already')) {
                toast.info('You are already registered.');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleStartTest = () => {
        navigate(`/test/${event?.id}`);
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!event) return <div>Event not found</div>;

    const isLive = event.status === 'LIVE';
    const isCompleted = event.status === 'COMPLETED';

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{event.title}</CardTitle>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                            {event.type}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                            <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Start Time</p>
                                <p>{new Date(event.startTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Clock className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p>{event.durationInMinutes} minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Coordinators */}
                    {(event.facultyCoordinators?.length || event.studentCoordinators?.length) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.facultyCoordinators?.length ? (
                                <div className="flex items-start gap-3 text-gray-700">
                                    <Users className="h-5 w-5 mr-1 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Faculty Coordinators</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {event.facultyCoordinators.map(fc => (
                                                <span key={fc} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-100">{fc}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            {event.studentCoordinators?.length ? (
                                <div className="flex items-start gap-3 text-gray-700">
                                    <Users className="h-5 w-5 mr-1 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Student Coordinators</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {event.studentCoordinators.map(sc => (
                                                <span key={sc} className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-100">{sc}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                        <h4 className="flex items-center text-yellow-800 font-medium">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Instructions
                        </h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-yellow-700 space-y-1">
                            <li>Total Marks: {event.totalMarks}</li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Do not refresh the page during the test.</li>
                            <li>The test will auto-submit when the timer ends.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                    {!isCompleted && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleRegister}
                                disabled={isRegistering || isLive} // Allow registering if not live? Or even if live?
                                isLoading={isRegistering}
                            >
                                Register
                            </Button>
                            {isLive && (
                                <Button onClick={handleStartTest}>
                                    Start Test
                                </Button>
                            )}
                        </>
                    )}
                    {isCompleted && (
                        <Button variant="outline" disabled>Event Completed</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
