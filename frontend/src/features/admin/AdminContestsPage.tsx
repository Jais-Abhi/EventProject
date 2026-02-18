import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { type Contest, type Problem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash, Check, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { CLUBS } from '@/lib/constants';

/**
 * A simple tag-input component for entering a list of names.
 * Press Enter or comma to add a tag; click × to remove.
 */
function TagInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
    const [draft, setDraft] = useState('');
    const add = () => {
        const trimmed = draft.trim();
        if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
        setDraft('');
    };
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white min-h-[42px]">
                {values.map(v => (
                    <span key={v} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {v}
                        <button type="button" onClick={() => onChange(values.filter(x => x !== v))}>
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    className="flex-1 min-w-[140px] text-sm outline-none"
                    placeholder={`Type name and press Enter`}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
                    onBlur={add}
                />
            </div>
        </div>
    );
}

// IST timezone identifier
const IST_TZ = 'Asia/Kolkata';

/**
 * Convert a UTC ISO string to a datetime-local input value displayed in IST.
 * Uses Intl to format the date correctly in IST, avoiding double-offset bugs.
 */
function toISTInput(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: IST_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/**
 * Convert a datetime-local input value to a UTC ISO string.
 * Appends +05:30 explicitly so it's always treated as IST regardless of browser locale.
 */
function fromISTInput(localValue: string): string {
    if (!localValue) return '';
    return new Date(localValue + ':00+05:30').toISOString();
}

export default function AdminContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [allProblems, setAllProblems] = useState<Problem[]>([]); // Store all problems
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentContest, setCurrentContest] = useState<Partial<Contest>>({});

    useEffect(() => {
        fetchContests();
        fetchProblems(); // Fetch problems on load
    }, []);

    const fetchContests = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/contest/getAll');
            setContests(response.data);
        } catch (error) {
            toast.error('Failed to load contests');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProblems = async () => {
        try {
            const response = await api.get('/problem/getAll');
            setAllProblems(response.data);
        } catch (error) {
            console.error("Failed to fetch problems");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/contest/delete/${id}`);
            toast.success('Contest deleted');
            fetchContests();
        } catch (error) {
            toast.error('Failed to delete contest');
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                title: currentContest.title,
                startTime: new Date(currentContest.startTime!).toISOString(),
                endTime: new Date(currentContest.endTime!).toISOString(),
                clubId: currentContest.clubId || '',
                problemIds: currentContest.problemIds || [],
                facultyCoordinators: currentContest.facultyCoordinators || [],
                studentCoordinators: currentContest.studentCoordinators || [],
            };

            if (currentContest.id) {
                await api.put(`/contest/update/${currentContest.id}`, payload);
                toast.success('Contest updated');
            } else {
                await api.post('/contest/insert', payload);
                toast.success('Contest created');
            }
            setIsEditing(false);
            setCurrentContest({});
            fetchContests();
        } catch (error) {
            toast.error('Failed to save contest');
        }
    };

    const toggleProblem = (problemId: string) => {
        const currentIds = currentContest.problemIds || [];
        if (currentIds.includes(problemId)) {
            setCurrentContest({
                ...currentContest,
                problemIds: currentIds.filter(id => id !== problemId)
            });
        } else {
            setCurrentContest({
                ...currentContest,
                problemIds: [...currentIds, problemId]
            });
        }
    };

    const openCreate = () => {
        setCurrentContest({ problemIds: [] });
        setIsEditing(true);
    };

    if (isLoading && !isEditing) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Contest Studio</h1>
                <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Create Contest</Button>
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader><CardTitle>{currentContest.id ? 'Edit Contest' : 'New Contest'}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Title"
                            value={currentContest.title || ''}
                            onChange={e => setCurrentContest({ ...currentContest, title: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Time (IST)"
                                type="datetime-local"
                                value={currentContest.startTime ? toISTInput(currentContest.startTime) : ''}
                                onChange={e => setCurrentContest({ ...currentContest, startTime: fromISTInput(e.target.value) })}
                            />
                            <Input
                                label="End Time (IST)"
                                type="datetime-local"
                                value={currentContest.endTime ? toISTInput(currentContest.endTime) : ''}
                                onChange={e => setCurrentContest({ ...currentContest, endTime: fromISTInput(e.target.value) })}
                            />
                        </div>

                        <Select
                            label="Club"
                            value={currentContest.clubId || ''}
                            onChange={e => setCurrentContest({ ...currentContest, clubId: e.target.value })}
                            options={CLUBS.map(c => ({ value: c.id, label: c.name }))}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Problems</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded">
                                {allProblems.map(problem => {
                                    const isSelected = (currentContest.problemIds || []).includes(problem.id);
                                    return (
                                        <div
                                            key={problem.id}
                                            onClick={() => toggleProblem(problem.id)}
                                            className={`p-2 border rounded cursor-pointer flex justify-between items-center ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}
                                        >
                                            <span className="text-sm truncate">{problem.title}</span>
                                            {isSelected && <Check className="h-4 w-4 text-indigo-600" />}
                                        </div>
                                    );
                                })}
                                {allProblems.length === 0 && <p className="text-sm text-gray-500 p-2">No problems found. Create problems first.</p>}
                            </div>
                            <p className="text-xs text-gray-500">Selected: {(currentContest.problemIds || []).length}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TagInput
                                label="Faculty Coordinators"
                                values={currentContest.facultyCoordinators || []}
                                onChange={v => setCurrentContest({ ...currentContest, facultyCoordinators: v })}
                            />
                            <TagInput
                                label="Student Coordinators"
                                values={currentContest.studentCoordinators || []}
                                onChange={v => setCurrentContest({ ...currentContest, studentCoordinators: v })}
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
                    {contests.map(contest => (
                        <Card key={contest.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <h3 className="font-bold">{contest.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(contest.startTime).toLocaleString('en-IN', { timeZone: IST_TZ })} — {new Date(contest.endTime).toLocaleString('en-IN', { timeZone: IST_TZ })}
                                    </p>
                                    <p className="text-xs text-gray-400">Problems: {contest.problemIds?.length || 0}</p>
                                    {(contest.facultyCoordinators?.length || contest.studentCoordinators?.length) ? (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {contest.facultyCoordinators?.length ? `Faculty: ${contest.facultyCoordinators.join(', ')}` : ''}
                                            {contest.facultyCoordinators?.length && contest.studentCoordinators?.length ? ' | ' : ''}
                                            {contest.studentCoordinators?.length ? `Students: ${contest.studentCoordinators.join(', ')}` : ''}
                                        </p>
                                    ) : null}
                                </div>
                                <div className="flex space-x-2">
                                    <Link to={`/admin/contests/${contest.id}/participants`}>
                                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            Participants
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="secondary" onClick={() => { setCurrentContest(contest); setIsEditing(true); }}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(contest.id)}><Trash className="h-4 w-4" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
