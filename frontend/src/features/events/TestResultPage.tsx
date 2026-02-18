import { useLocation, Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

export default function TestResultPage() {
    const location = useLocation();
    const result = location.state?.result;

    if (!result) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader className="flex flex-col items-center">
                    <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="h-10 w-10 text-yellow-600" />
                    </div>
                    <CardTitle className="text-3xl">Test Completed!</CardTitle>
                    <p className="text-gray-500 mt-2">Your submission has been recorded.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center">
                            <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
                            <span className="text-2xl font-bold text-gray-900">{result.correctAnswers || 0}</span>
                            <span className="text-sm text-gray-600">Correct</span>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg flex flex-col items-center">
                            <XCircle className="h-6 w-6 text-red-600 mb-2" />
                            <span className="text-2xl font-bold text-gray-900">{result.wrongAnswers || 0}</span>
                            <span className="text-sm text-gray-600">Wrong</span>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-lg">
                        <p className="text-sm font-medium text-indigo-800 uppercase tracking-wide">Total Score</p>
                        <p className="text-4xl font-extrabold text-indigo-600 mt-2">{result.score}</p>
                        {result.rank && <p className="text-sm text-indigo-600 mt-1">Rank: #{result.rank}</p>}
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/dashboard">
                        <Button size="lg">Return to Dashboard</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
