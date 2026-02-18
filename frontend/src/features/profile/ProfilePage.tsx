import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { User, UserCircle, Mail, BookOpen, GraduationCap, Save, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        fatherName: '',
        email: '',
        username: '',
        course: '',
        branch: '',
        password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                fatherName: user.fatherName || '',
                email: user.email || '',
                username: user.username || '',
                course: user.course || '',
                branch: user.branch || '',
                password: '', // Reset password field
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            await api.put(`/user/update/${user.id}`, formData);

            // If username or password changed, we might need to re-login or update storage
            // For now, let's just refresh the user data in context
            const response = await api.get('/user/me');
            localStorage.setItem('auth_user', JSON.stringify(response.data));

            // If password was changed, we must update stored credentials
            if (formData.password) {
                const creds = { username: formData.username, password: formData.password };
                localStorage.setItem('auth_credentials', JSON.stringify(creds));
            } else if (formData.username !== user.username) {
                const storedCreds = localStorage.getItem('auth_credentials');
                if (storedCreds) {
                    const creds = JSON.parse(storedCreds);
                    creds.username = formData.username;
                    localStorage.setItem('auth_credentials', JSON.stringify(creds));
                }
            }

            toast.success('Profile updated successfully');
            // Refresh page to ensure all state is synced
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <UserCircle className="h-40 w-40" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl font-bold border border-white/30">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-white/80 mt-1 flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                                {user.role}
                            </span>
                            • {user.username}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <User className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Father's Name</label>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Academic Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-800">Academic Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" /> Course
                            </label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Branch</label>
                            <input
                                type="text"
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Account & Security */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                        <Key className="h-5 w-5 text-red-600" />
                        <h2 className="text-xl font-bold text-gray-800">Account & Security</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 ml-1">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Area */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
