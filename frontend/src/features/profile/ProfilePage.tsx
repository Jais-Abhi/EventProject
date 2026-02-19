import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import {
    UserCircle, Mail, BookOpen, GraduationCap, Save, Loader2, Key,
    Trophy, Calendar, CheckCircle2, ChevronRight, BarChart3, ArrowLeft, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { type UserActivity } from '@/types';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Shared field styles ─────────────────────────────────────────────────────
const fieldLabel = 'text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 flex items-center gap-1.5';
const fieldInput = 'w-full bg-gray-50 dark:bg-gray-700 disabled:opacity-70 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-600/40 focus:border-blue-500 dark:focus:border-blue-600 transition-all';

export default function ProfilePage() {
    const { user: currentUser } = useAuth();
    const { userId } = useParams();
    const navigate = useNavigate();

    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUserDataLoading, setIsUserDataLoading] = useState(!!userId);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        email: '',
        username: '',
        course: '',
        branch: '',
        rollNumber: '',
        password: '',
    });
    const [activity, setActivity] = useState<UserActivity | null>(null);
    const [isActivityLoading, setIsActivityLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');

    const isViewOnly = !!userId && userId !== currentUser?.id;

    // ── Fetch target user ────────────────────────────────────────────────────
    useEffect(() => {
        const fetchTargetUser = async () => {
            if (!userId) {
                setTargetUser(currentUser);
                setIsUserDataLoading(false);
                return;
            }
            if (userId === currentUser?.id) {
                setTargetUser(currentUser);
                setIsUserDataLoading(false);
                return;
            }
            try {
                const response = await api.get(`/user/getById/${userId}`);
                setTargetUser(response.data);
            } catch {
                toast.error('User not found');
                navigate('/admin/users');
            } finally {
                setIsUserDataLoading(false);
            }
        };
        fetchTargetUser();
    }, [userId, currentUser, navigate]);

    // ── Populate form when user data arrives ─────────────────────────────────
    useEffect(() => {
        if (targetUser) {
            setFormData({
                firstName: targetUser.firstName || '',
                lastName: targetUser.lastName || '',
                fatherName: targetUser.fatherName || '',
                email: targetUser.email || '',
                username: targetUser.username || '',
                course: targetUser.course || '',
                branch: targetUser.branch || '',
                rollNumber: targetUser.rollNumber || '',
                password: '',
            });
        }
    }, [targetUser]);

    // ── Fetch activity ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchActivity = async () => {
            setIsActivityLoading(true);
            try {
                const url = userId ? `/user/activity/${userId}` : '/user/activity';
                const response = await api.get(url);
                setActivity(response.data);
            } catch {
                console.error('Failed to fetch activity');
            } finally {
                setIsActivityLoading(false);
            }
        };
        fetchActivity();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewOnly) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsLoading(true);
        try {
            await api.put(`/user/update/${currentUser.id}`, formData);
            const response = await api.get('/user/me');
            localStorage.setItem('auth_user', JSON.stringify(response.data));
            if (formData.password) {
                localStorage.setItem('auth_credentials', JSON.stringify({ username: formData.username, password: formData.password }));
            } else if (formData.username !== currentUser.username) {
                const storedCreds = localStorage.getItem('auth_credentials');
                if (storedCreds) {
                    const creds = JSON.parse(storedCreds);
                    creds.username = formData.username;
                    localStorage.setItem('auth_credentials', JSON.stringify(creds));
                }
            }
            toast.success('Profile updated successfully');
            window.location.reload();
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Loading / not-found guards ───────────────────────────────────────────
    if (isUserDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
            </div>
        );
    }
    if (!targetUser) return null;

    // ── Helper: section card wrapper ─────────────────────────────────────────
    const SectionCard = ({ children }: { children: React.ReactNode }) => (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-6">
            {children}
        </div>
    );

    const SectionHeader = ({ icon, title, color = 'text-blue-600 dark:text-blue-400' }: { icon: React.ReactNode; title: string; color?: string }) => (
        <div className={`flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4 ${color}`}>
            {icon}
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Back button for admin view */}
            {isViewOnly && (
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Manage Users
                </Button>
            )}

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <UserCircle className="h-40 w-40" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/30 flex-shrink-0">
                        {targetUser.firstName?.[0]}{targetUser.lastName?.[0]}
                    </div>

                    {/* Name + meta */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {targetUser.firstName} {targetUser.lastName}
                        </h1>
                        <p className="text-white/80 mt-1 flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                                {targetUser.role}
                            </span>
                            <span>@{targetUser.username}</span>
                            {targetUser.rollNumber && (
                                <span className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />{targetUser.rollNumber}
                                </span>
                            )}
                        </p>
                        <p className="text-white/70 text-sm mt-1">{targetUser.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mt-8">
                    {(['profile', 'activity'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl font-bold transition-all capitalize ${activeTab === tab
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab === 'profile'
                                ? (isViewOnly ? 'View Profile' : 'Edit Profile')
                                : (isViewOnly ? 'User Activity' : 'My Activity')}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === 'profile' ? (
                <div className="space-y-6">

                    {/* Personal Information */}
                    <SectionCard>
                        <SectionHeader icon={<UserCircle className="h-5 w-5" />} title="Personal Information" color="text-blue-600 dark:text-blue-400" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={fieldLabel}>First Name</label>
                                <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            <div className="space-y-2">
                                <label className={fieldLabel}>Last Name</label>
                                <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            <div className="space-y-2">
                                <label className={fieldLabel}>Father's Name</label>
                                <Input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            <div className="space-y-2">
                                <label className={fieldLabel}><Mail className="h-3.5 w-3.5" /> Email Address</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Academic Details */}
                    <SectionCard>
                        <SectionHeader icon={<GraduationCap className="h-5 w-5" />} title="Academic Details" color="text-purple-600 dark:text-purple-400" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className={fieldLabel}><BookOpen className="h-3.5 w-3.5" /> Course</label>
                                <Input type="text" name="course" value={formData.course} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            <div className="space-y-2">
                                <label className={fieldLabel}>Branch</label>
                                <Input type="text" name="branch" value={formData.branch} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            <div className="space-y-2">
                                <label className={fieldLabel}><Hash className="h-3.5 w-3.5" /> Roll Number</label>
                                <Input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Account & Security */}
                    <SectionCard>
                        <SectionHeader icon={<Key className="h-5 w-5" />} title="Account & Security" color="text-red-600 dark:text-red-400" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={fieldLabel}>Username</label>
                                <Input type="text" name="username" value={formData.username} onChange={handleChange} disabled={isViewOnly} className={fieldInput} />
                            </div>
                            {!isViewOnly && (
                                <div className="space-y-2">
                                    <label className={fieldLabel}>New Password <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(leave blank to keep current)</span></label>
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={fieldInput}
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* Save Button */}
                    {!isViewOnly && (
                        <div className="flex items-center justify-end gap-4 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all h-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="bg-blue-600 dark:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50 h-auto"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

            ) : (
                /* ── Activity Tab ─────────────────────────────────────────── */
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                    {/* Quizzes */}
                    <SectionCard>
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3 text-yellow-500 dark:text-yellow-400">
                                <Trophy className="h-6 w-6" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Quizzes</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {activity?.mcqActivities.length ?? 0} events
                            </span>
                        </div>

                        {isActivityLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400" /></div>
                        ) : !activity?.mcqActivities.length ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No quiz participation yet.</p>
                                {!isViewOnly && <Link to="/events" className="text-blue-600 dark:text-blue-400 font-bold mt-2 inline-block">Explore Events →</Link>}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {activity.mcqActivities.map(act => (
                                    <div key={act.eventId} className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${act.status === 'COMPLETED'
                                                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {act.status === 'COMPLETED' ? <CheckCircle2 className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{act.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex flex-wrap items-center gap-2">
                                                    <span>Registered: {new Date(act.registeredAt).toLocaleDateString()}</span>
                                                    {act.rank && (
                                                        <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter text-[10px]">
                                                            Rank #{act.rank}
                                                        </span>
                                                    )}
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${act.status === 'COMPLETED'
                                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                                        }`}>{act.status}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            {act.score !== undefined && (
                                                <div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Score</p>
                                                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                                                        {act.score}<span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {act.totalMarks}</span>
                                                    </p>
                                                </div>
                                            )}
                                            <Link to={`/test/${act.eventId}/result`} className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all">
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Contests */}
                    <SectionCard>
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="flex items-center gap-3 text-indigo-500 dark:text-indigo-400">
                                <BarChart3 className="h-6 w-6" />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Contests</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                {activity?.contestActivities.length ?? 0} participated
                            </span>
                        </div>

                        {isActivityLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600 dark:text-blue-400" /></div>
                        ) : !activity?.contestActivities.length ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                                <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No contest participation yet.</p>
                                {!isViewOnly && <Link to="/contests" className="text-indigo-600 dark:text-indigo-400 font-bold mt-2 inline-block">Join Contests →</Link>}
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {activity.contestActivities.map(act => (
                                    <div key={act.contestId} className="group p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                                <Trophy className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{act.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Solved {act.problemsSolved} / {act.totalProblems} problems
                                                    {act.rank && <span className="ml-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter text-[10px]">Rank #{act.rank}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Score</p>
                                                <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{act.totalScore}</p>
                                            </div>
                                            <Link to={`/contests/${act.contestId}`} className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-all">
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            )}
        </div>
    );
}
