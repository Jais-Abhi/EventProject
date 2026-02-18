import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    ArrowLeft,
    Download,
    Users,
    CheckCircle,
    XCircle,
    Trophy,
    TrendingUp,
    Target
} from 'lucide-react';
import { toast } from 'sonner';

interface TopPerformer {
    studentId: string;
    username: string;
    rollNumber: string;
    score: number;
    rank: number;
}

interface Analytics {
    totalRegistrations: number;
    totalAttempts: number;
    totalAbsent: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passPercentage: number;
    topPerformers: TopPerformer[];
}

export default function AdminEventAnalyticsPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (eventId) fetchAnalytics();
    }, [eventId]);

    const fetchAnalytics = async () => {
        try {
            const response = await api.get(`/api/mcq/admin/analytics/${eventId}`);
            setAnalytics(response.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await api.get(`/api/mcq/admin/analytics/pdf/${eventId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-${eventId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-500">No analytics data available.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/events')}>
                    Back to Events
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/events')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quiz Analytics</h1>
                        <p className="text-gray-500">Detailed performance report for the event</p>
                    </div>
                </div>
                <Button onClick={downloadPdf} isLoading={isDownloading} variant="outline" className="w-full md:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Download Report
                </Button>
            </div>

            {/* Summary Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Registered</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalRegistrations}</div>
                        <p className="text-xs text-gray-400 mt-1">Students registered</p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Attempted</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{analytics.totalAttempts}</div>
                        <p className="text-xs text-gray-400 mt-1">{((analytics.totalAttempts / analytics.totalRegistrations) * 100).toFixed(1)}% participation</p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Absent</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{analytics.totalAbsent}</div>
                        <p className="text-xs text-gray-400 mt-1">Missed the event</p>
                    </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">Pass Percentage</CardTitle>
                        <Target className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{analytics.passPercentage.toFixed(1)}%</div>
                        <p className="text-xs text-gray-400 mt-1">Success rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Score Breakdown */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                            Highest Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics.highestScore}</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                            Average Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics.averageScore.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 border-l-4 border-l-gray-400">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Target className="h-4 w-4 mr-2 text-gray-500" />
                            Lowest Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{analytics.lowestScore}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performers Table */}
            <Card className="bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                        Top Performers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm uppercase">
                                    <th className="px-6 py-4 font-semibold">Rank</th>
                                    <th className="px-6 py-4 font-semibold">Username</th>
                                    <th className="px-6 py-4 font-semibold">Roll Number</th>
                                    <th className="px-6 py-4 font-semibold">Student ID</th>
                                    <th className="px-6 py-4 font-semibold text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {analytics.topPerformers.map((performer) => (
                                    <tr key={performer.studentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {performer.rank <= 3 ? (
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${performer.rank === 1 ? 'bg-yellow-400 shadow-sm shadow-yellow-200' :
                                                        performer.rank === 2 ? 'bg-gray-300 shadow-sm shadow-gray-200' :
                                                            'bg-orange-400 shadow-sm shadow-orange-200'
                                                        }`}>
                                                        {performer.rank}
                                                    </span>
                                                ) : (
                                                    <span className="w-8 h-8 flex items-center justify-center text-gray-500 font-medium">
                                                        #{performer.rank}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{performer.username}</td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{performer.rollNumber}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-sm">{performer.studentId}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-bold text-indigo-700">
                                                {performer.score}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {analytics.topPerformers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No submissions yet to show top performers.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
