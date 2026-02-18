import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<Partial<Problem>>({});

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await api.get('/problem/getAll');
            setProblems(response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete usage logic? This is a simple delete call.')) return;
        try {
            await api.delete(`/problem/delete/${id}`);
            toast.success('Problem deleted');
            fetchProblems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                title: currentProblem.title,
                description: currentProblem.description,
                difficulty: currentProblem.difficulty,
                testCases: currentProblem.testCases || []
            };
            // Basic validation
            if (!payload.title || !payload.description || !payload.difficulty) {
                toast.error('Fill required fields'); return;
            }

            if (currentProblem.id) {
                await api.put(`/problem/update/${currentProblem.id}`, payload);
            } else {
                await api.post('/problem/insert', payload);
            }
            setIsEditing(false);
            fetchProblems();
        } catch (error) {
            toast.error('Save failed');
        }
    };

    if (isLoading && !isEditing) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Manage Problems</h1>
                <Button onClick={() => { setCurrentProblem({ testCases: [] }); setIsEditing(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Problem
                </Button>
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader><CardTitle>Problem Editor</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Title" value={currentProblem.title || ''} onChange={e => setCurrentProblem({ ...currentProblem, title: e.target.value })} />
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description (HTML supported)</label>
                            <textarea
                                className="w-full border rounded-md p-2 text-sm"
                                rows={5}
                                value={currentProblem.description || ''}
                                onChange={e => setCurrentProblem({ ...currentProblem, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Difficulty</label>
                            <select
                                className="w-full border rounded-md p-2 text-sm"
                                value={currentProblem.difficulty || 'EASY'}
                                onChange={e => setCurrentProblem({ ...currentProblem, difficulty: e.target.value as any })}
                            >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                        </div>
                        {/* Test Cases Simplified Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Test Cases (JSON Array of {`{input, expectedOutput, hidden}`})</label>
                            <textarea
                                className="w-full border rounded-md p-2 font-mono text-xs"
                                rows={5}
                                value={JSON.stringify(currentProblem.testCases || [], null, 2)}
                                onChange={e => {
                                    try {
                                        setCurrentProblem({ ...currentProblem, testCases: JSON.parse(e.target.value) });
                                    } catch (e) { }
                                }}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {problems.map(problem => (
                        <Card key={problem.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold">{problem.title}</h3>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{problem.difficulty}</span>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="secondary" onClick={() => { setCurrentProblem(problem); setIsEditing(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(problem.id)}><Trash className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
