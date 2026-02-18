import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, FileDown } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        api.get('/api/events/getAllEvent').then(res => setEvents(res.data));
    }, []);

    const downloadPdf = (eventId: string) => {
        window.open(`${import.meta.env.VITE_API_BASE_URL}/api/mcq/admin/analytics/pdf/${eventId}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Analytics & Reports</h1>
            <div className="grid gap-4">
                {events.map(event => (
                    <Card key={event.id}>
                        <CardContent className="flex justify-between items-center p-6">
                            <div>
                                <h3 className="font-bold text-lg">{event.title}</h3>
                                <p className="text-sm text-gray-500">{new Date(event.startTime).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <Link
                                    to={`/admin/events/${event.id}/analytics`}
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    <BarChart3 className="mr-1 h-4 w-4" /> View Details
                                </Link>
                                <button
                                    onClick={() => downloadPdf(event.id)}
                                    className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-500"
                                >
                                    <FileDown className="mr-1 h-4 w-4" /> Download PDF
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
