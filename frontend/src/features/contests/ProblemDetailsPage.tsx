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

export default function ProblemDetailsPage() {
    const { contestId, problemId } = useParams();
    const { user } = useAuth();
    const [problem, setProblem] = useState<Problem | null>(null);
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
        if (problemId) fetchProblem();
    }, [problemId]);

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

    if (!problem) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4 p-4">
            {/* Problem Description Panel */}
            <div className="md:w-1/2 flex flex-col overflow-hidden">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{problem.title}</span>
                            <span className={`text-sm px-2 py-1 rounded ${problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                                problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {problem.difficulty}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: problem.description.replace(/\n/g, '<br />') }} />

                        {problem.testCases && problem.testCases.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <h4 className="font-bold text-gray-900">Example Test Cases</h4>
                                {problem.testCases.filter(tc => !tc.hidden).map((tc, idx) => (
                                    <div key={idx} className="bg-gray-50 p-3 rounded-md text-sm font-mono border">
                                        <div className="mb-2">
                                            <span className="text-gray-500 text-xs uppercase block mb-1">Input:</span>
                                            <pre className="whitespace-pre-wrap break-words text-sm">{tc.input}</pre>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 text-xs uppercase block mb-1">Output:</span>
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
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
                        <select
                            className="h-8 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✅ Already Solved
                                </span>
                            ) : (
                                <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
                                    <Play className="h-3 w-3 mr-1" />
                                    Run & Submit
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language === 'c' ? 'c' : language} // Monaco supports 'cpp', 'java', 'python'
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            theme="vs-light"
                            options={{ minimap: { enabled: false }, fontSize: 14 }}
                        />
                    </div>
                </Card>

                {verdict && (
                    <Card className={`border-l-4 ${verdict.status === 'ACCEPTED' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
                        <div className="p-4">
                            <h4 className="font-bold flex items-center">
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
