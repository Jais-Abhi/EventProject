import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Problem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play } from 'lucide-react';
import Editor from '@monaco-editor/react';

import { toast } from 'sonner';
import { CountdownTimer } from '@/components/CountdownTimer';
import { type Contest } from '@/types';

export default function ProblemDetailsPage() {
    const { contestId, problemId } = useParams();
    const { user } = useAuth();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [contest, setContest] = useState<Contest | null>(null);
    const [code, setCode] = useState('// Write your code here');
    const [language, setLanguage] = useState('cpp');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verdict, setVerdict] = useState<{ status: string; score: number } | null>(null);
    const [alreadySolved, setAlreadySolved] = useState(false);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await api.get(`/problem/getById/${problemId}`);
                setProblem(response.data);
            } catch (error) {
                toast.error('Failed to load problem');
            }
        };

        const fetchContest = async () => {
            try {
                const response = await api.get(`/contest/getById/${contestId}`);
                const contestData = response.data.contest || response.data;
                setContest(contestData);
            } catch (error) {
                console.error("Failed to fetch contest details");
            }
        };

        if (problemId) fetchProblem();
        if (contestId) fetchContest();
    }, [problemId, contestId]);

    // Check if user already has an accepted submission for this problem
    useEffect(() => {
        const checkAlreadySolved = async () => {
            if (!user || !problemId || !contestId) return;
            try {
                const response = await api.get(
                    `/submission/userId/${user.id}`
                );
                const submissions: Array<{ problemId: string; contestId: string; verdict: string }> = response.data;
                const solved = submissions.some(
                    s => s.problemId === problemId && s.contestId === contestId && s.verdict === 'ACCEPTED'
                );
                setAlreadySolved(solved);
                if (solved) {
                    setVerdict({ status: 'ACCEPTED', score: 100 });
                }
            } catch {
                // silently ignore
            }
        };
        checkAlreadySolved();
    }, [user, problemId, contestId]);

    const handleSubmit = async () => {
        if (!user) return;
        if (alreadySolved) {
            toast.error('You have already solved this problem!');
            return;
        }
        setIsSubmitting(true);
        setVerdict(null);
        try {
            const response = await api.post('/submission', {
                userId: user.id,
                contestId: contestId,
                problemId: problemId,
                code: code,
                language: language
            });
            const result = response.data;
            setVerdict({ status: result.verdict, score: result.score });
            if (result.verdict === 'ACCEPTED') {
                setAlreadySolved(true);
                toast.success('Solution Accepted! 🎉');
            } else {
                toast.error(`Verdict: ${result.verdict}`);
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.response?.data || 'Submission failed';
            if (error?.response?.status === 409) {
                setAlreadySolved(true);
                toast.error('You have already solved this problem!');
            } else {
                toast.error(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!problem) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" /></div>;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 p-4">
            {/* Problem Description Panel */}
            <div className="md:w-1/2 flex flex-col overflow-hidden">
                <Card className="h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-gray-900 dark:text-gray-100">
                            <span>{problem.title}</span>
                            <div className="flex items-center gap-4">
                                {contest && (
                                    <CountdownTimer
                                        targetDate={contest.endTime}
                                        className="text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600"
                                    />
                                )}
                                <span className={`text-sm px-2 py-1 rounded font-semibold ${problem.difficulty === 'EASY' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                                    }`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100">
                        <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br />') }} />

                        {problem.testCases && problem.testCases.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">Example Test Cases</h4>
                                {problem.testCases.filter(tc => !tc.hidden).map((tc, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm font-mono border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                                        <div className="mb-2">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase block mb-1">Input:</span>
                                            <pre className="whitespace-pre-wrap break-words text-sm">{tc.input}</pre>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase block mb-1">Output:</span>
                                            <pre className="whitespace-pre-wrap break-words text-sm">{tc.expectedOutput}</pre>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Editor Panel */}
            <div className="md:w-1/2 flex flex-col space-y-4">
                <Card className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                        <select
                            className="h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                            <option value="c">C</option>
                        </select>
                        <div className="flex space-x-2">
                            {alreadySolved ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                                    ✅ Already Solved
                                </span>
                            ) : (
                                <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting} className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white">
                                    <Play className="h-3 w-3 mr-1" />
                                    Run & Submit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language === 'c' ? 'c' : language}
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-dark"
                            options={{ minimap: { enabled: false }, fontSize: 14 }}
                        />
                    </div>
                </Card>

                {verdict && (
                    <Card className={`border-l-4 ${verdict.status === 'ACCEPTED' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20 border-t border-r border-b border-green-200 dark:border-green-800' : 'border-l-red-500 bg-red-50 dark:bg-red-900/20 border-t border-r border-b border-red-200 dark:border-red-800'}`}>
                        <div className="p-4">
                            <h4 className="font-bold flex items-center text-gray-900 dark:text-gray-100">
                                Verdict: {verdict.status}
                                {verdict.status === 'ACCEPTED' && <span className="ml-2 text-sm font-normal">Score: {verdict.score}</span>}
                            </h4>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
