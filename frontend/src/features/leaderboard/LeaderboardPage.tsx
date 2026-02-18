import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type LeaderboardEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Medal } from 'lucide-react';

export default function LeaderboardPage() {
    const { contestId } = useParams();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get(`/leaderboard/${contestId}`);
                // Ensure result is array and sorted
                const sorted = (response.data || []).sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
                    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                    return 0; // Secondary sort by time if needed
                });
                setLeaderboard(sorted);
            } catch (error) {
                // error
            } finally {
                setIsLoading(false);
            }
        };
        if (contestId) fetchLeaderboard();
    }, [contestId]);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Medal className="h-6 w-6 mr-2 text-yellow-500" />
                        Contest Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-3">Rank</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Problems Solved</th>
                                    <th className="px-6 py-3 text-right">Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, idx) => (
                                    <tr key={entry.userId} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{idx + 1}</td>
                                        <td className="px-6 py-4">{entry.userId}</td>
                                        <td className="px-6 py-4">{entry.problemsSolved}</td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600">{entry.totalScore}</td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">No entries yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
