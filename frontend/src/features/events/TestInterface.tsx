import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Question } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from '@/components/ui/card';
import { Loader2, Timer } from 'lucide-react';
import { toast } from 'sonner';

export default function TestInterface() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Questions (Start Test)
    useEffect(() => {
        const startTest = async () => {
            try {
                const response = await api.post(`/api/mcq/start/${eventId}`);
                if (Array.isArray(response.data)) {
                    setQuestions(response.data);
                    setIsLoading(false);
                } else {
                    // Handle Resume or Completed? 
                    // If completed, response might not be array?
                    // Assuming simplified happy path for now
                    setQuestions(response.data); // Assuming it returns Questions
                    setIsLoading(false);
                }
            } catch (error: any) {
                toast.error('Failed to start test or test already completed.');
                navigate(`/events/${eventId}`);
            }
        };
        if (eventId) startTest();
    }, [eventId, navigate]);

    // Sync Timer
    useEffect(() => {
        if (!eventId) return;

        const syncTime = async () => {
            try {
                const response = await api.get(`/api/mcq/remaining-time/${eventId}`);
                // Assuming response is number (seconds) or object { remainingTime: number }
                // Spec says RemainingTimeResponseDTO
                // Let's assume it has `remainingTime` in seconds
                const time = response.data.remainingTime; // seconds
                setRemainingTime(time);

                if (time <= 0) {
                    handleSubmit(true);
                }
            } catch (error) {
                // console.error(error);
            }
        };

        syncTime(); // Initial sync
        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Sync with server every 30s
        const syncInterval = setInterval(syncTime, 30000);

        return () => {
            clearInterval(interval);
            clearInterval(syncInterval);
        };
    }, [eventId]);

    const handleOptionSelect = (questionId: string | undefined, optionIndex: number) => {
        if (!questionId) return; // Should not happen if Question has ID
        // If Question doesn't have ID (from DTO), we rely on index?
        // "questionId" in Answer object. 
        // UserRequest doesn't show ID in CreateQuestionDTO, but Response should have it.
        // Assuming response questions have 'questionId'.
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = useCallback(async (_autoSubmit = false) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const answerList = Object.entries(answers).map(([qId, opt]) => ({
            questionId: qId,
            selectedOption: opt
        }));

        try {
            const response = await api.post(`/api/mcq/submit/${eventId}`, {
                answers: answerList
            });
            // Response is McqResultDTO
            const result = response.data;
            // Store result in local state/context or navigate with state
            navigate(`/test/${eventId}/result`, { state: { result } });
        } catch (error) {
            toast.error('Submission failed. Please try again.');
            setIsSubmitting(false);
        }
    }, [answers, eventId, navigate, isSubmitting]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!questions.length) return <div className="p-10">No questions found.</div>;

    const currentQuestion = questions[currentQuestionIndex];

    // Format Time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-800">MCQ Test</h2>
                {remainingTime !== null && (
                    <div className={`flex items-center space-x-2 text-lg font-mono font-bold ${remainingTime < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                        <Timer className="h-5 w-5" />
                        <span>{formatTime(remainingTime)}</span>
                    </div>
                )}
                <Button variant="danger" onClick={() => handleSubmit(false)} isLoading={isSubmitting}>
                    Submit Test
                </Button>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Area */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="min-h-[400px] flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Question {currentQuestionIndex + 1}</span>
                                <span className="text-sm font-normal text-gray-500">Marks: {currentQuestion.marks}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-lg text-gray-800 mb-6">{currentQuestion.questionText}</p>
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors flex items-center ${answers[currentQuestion.questionId!] === idx
                                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'hover:bg-gray-50 border-gray-200'
                                            }`}
                                        onClick={() => handleOptionSelect(currentQuestion.questionId, idx)}
                                    >
                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${answers[currentQuestion.questionId!] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
                                            }`}>
                                            {answers[currentQuestion.questionId!] === idx && <div className="h-2 w-2 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-gray-700">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4 bg-gray-50 rounded-b-lg">
                            <Button
                                variant="secondary"
                                disabled={currentQuestionIndex === 0}
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev < questions.length - 1 ? prev + 1 : prev)}
                                disabled={currentQuestionIndex === questions.length - 1} // Or change to "Finish"?
                            >
                                Next
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Navigation Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Question Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`h-10 w-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentQuestionIndex === idx
                                            ? 'bg-indigo-600 text-white'
                                            : answers[q.questionId!] !== undefined
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-green-100 border border-green-200 rounded mr-2" />
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-indigo-600 rounded mr-2" />
                                    <span>Current</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-3 w-3 bg-gray-100 rounded mr-2" />
                                    <span>Not Answered</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
