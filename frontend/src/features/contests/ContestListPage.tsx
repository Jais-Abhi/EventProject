import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Trophy } from 'lucide-react';

export default function ContestListPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await api.get('/contest/getAll');
                setContests(response.data);
            } catch (error) {
                // Error handling
            } finally {
                setIsLoading(false);
            }
        };
        fetchContests();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const getStatus = (start: string, end: string) => {
        const now = new Date();
        const startTime = new Date(start);
        const endTime = new Date(end);
        if (now < startTime) return { label: 'UPCOMING', color: 'text-blue-600 bg-blue-50' };
        if (now >= startTime && now <= endTime) return { label: 'LIVE', color: 'text-green-600 bg-green-50' };
        return { label: 'ENDED', color: 'text-gray-600 bg-gray-50' };
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Contest Studio</h1>
            </div>

            {contests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No contests found</h3>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {contests.map((contest) => {
                        const status = getStatus(contest.startTime, contest.endTime);
                        return (
                            <Card key={contest.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl line-clamp-1">{contest.title}</CardTitle>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>{status.label}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(contest.startTime).toLocaleString()}
                                    </div>
                                    <div className="flex items-center">
                                        <Trophy className="h-4 w-4 mr-2" />
                                        {contest.problemIds?.length || 0} Problems
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link to={`/contests/${contest.id}`} className="w-full">
                                        <Button className="w-full" variant={status.label === 'ENDED' ? 'outline' : 'primary'}>
                                            View Contest
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
