import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Trophy,
    Code2,
    User,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    ClipboardList
} from 'lucide-react';
import { cn } from '@/utils';

export default function DashboardLayout() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Events', href: '/events', icon: Trophy },
        { name: 'Contests', href: '/contests', icon: Code2 },
        { name: 'My Submissions', href: '/submissions', icon: ClipboardList },
        { name: 'Profile', href: '/profile', icon: User },
        ...(isAdmin ? [
            { name: 'Admin Panel', href: '/admin', icon: ShieldAlert }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar for Desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <span className="text-xl font-bold text-indigo-600">EventPlatform</span>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                                    )}
                                >
                                    <item.icon className={cn(
                                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500",
                                        "mr-3 flex-shrink-0 h-6 w-6"
                                    )} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <button
                                onClick={logout}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center mt-1"
                            >
                                <LogOut className="h-3 w-3 mr-1" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b z-10 flex items-center justify-between px-4 h-16">
                <span className="text-xl font-bold text-indigo-600">EventPlatform</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white" onClick={(e) => e.stopPropagation()}>
                        <div className="h-16 flex items-center px-4 border-b">
                            <span className="text-xl font-bold text-indigo-600">Menu</span>
                        </div>
                        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    <div className="flex items-center">
                                        <item.icon className="mr-4 h-6 w-6 text-gray-400" />
                                        {item.name}
                                    </div>
                                </Link>
                            ))}
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-4"
                            >
                                <div className="flex items-center">
                                    <LogOut className="mr-4 h-6 w-6" />
                                    Sign out
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-64 pt-16 md:pt-0">
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
