import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';

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
                            <button
                                onClick={() => downloadPdf(event.id)}
                                className="text-indigo-600 hover:underline text-sm font-medium"
                            >
                                Download PDF Report
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
