import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest, type Problem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const IST_TZ = 'Asia/Kolkata';

export default function ContestDetailsPage() {
    const { contestId } = useParams();
    const { user } = useAuth();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [solvedProblemIds, setSolvedProblemIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContestAndProblems = async () => {
            try {
                const response = await api.get(`/contest/getById/${contestId}`);
                const contestData = response.data.contest || response.data;
                setContest(contestData);

                if (contestData.problemIds && contestData.problemIds.length > 0) {
                    const problemPromises = contestData.problemIds.map((id: string) =>
                        api.get(`/problem/getById/${id}`).then(res => res.data).catch(() => null)
                    );
                    const problemsData = await Promise.all(problemPromises);
                    setProblems(problemsData.filter((p: any) => p !== null));
                }
            } catch (error) {
                console.error("Failed to fetch contest details");
            } finally {
                setIsLoading(false);
            }
        };
        if (contestId) fetchContestAndProblems();
    }, [contestId]);

    // Fetch user's accepted submissions for this contest
    useEffect(() => {
        const fetchSolvedProblems = async () => {
            if (!user || !contestId) return;
            try {
                const response = await api.get(`/submission/userId/${user.id}`);
                const submissions: Array<{ problemId: string; contestId: string; verdict: string }> = response.data;
                const solved = new Set(
                    submissions
                        .filter(s => s.contestId === contestId && s.verdict === 'ACCEPTED')
                        .map(s => s.problemId)
                );
                setSolvedProblemIds(solved);
            } catch {
                // silently ignore
            }
        };
        fetchSolvedProblems();
    }, [user, contestId]);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!contest) return <div>Contest not found</div>;

    const solvedCount = problems.filter(p => solvedProblemIds.has(p.id)).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{contest.title}</h1>
                    <p className="text-gray-500 mt-1">
                        {new Date(contest.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })} — {new Date(contest.endTime).toLocaleString('en-IN', { timeZone: IST_TZ })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {problems.length > 0 && (
                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {solvedCount} / {problems.length} Solved
                        </span>
                    )}
                    <Link to={`/leaderboard/${contest.id}`}>
                        <Button variant="outline">View Leaderboard</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4">
                {problems.map((problem, idx) => {
                    const isSolved = solvedProblemIds.has(problem.id);
                    return (
                        <Card
                            key={problem.id}
                            className={`hover:shadow-md transition-shadow ${isSolved ? 'border-green-300 bg-green-50' : ''}`}
                        >
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    {/* Problem index badge */}
                                    <span className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isSolved
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {isSolved
                                            ? <CheckCircle2 className="h-5 w-5" />
                                            : String.fromCharCode(65 + idx)
                                        }
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            {problem.title}
                                            {isSolved && (
                                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                    ✓ Solved
                                                </span>
                                            )}
                                        </h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                                problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/contests/${contest.id}/problem/${problem.id}`}>
                                    <Button variant={isSolved ? 'outline' : 'secondary'} size="sm">
                                        {isSolved ? 'View' : 'Solve'} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
                {problems.length === 0 && <p>No problems added yet.</p>}
            </div>
        </div>
    );
}
