import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, PlusCircle, Code2, User, ClipboardList, AlertCircle } from 'lucide-react';

export default function DashboardLayout() {
    const { logout, isAdmin } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutDialog(false);
        logout();
        navigate('/login');
    };

    const handleCancelLogout = () => {
        setShowLogoutDialog(false);
    };

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isAdmin ? [{ name: 'Create', href: '/admin', icon: PlusCircle }] : []),
        { name: 'Quiz Studio', href: '/events', icon: ClipboardList },
        { name: 'Contest Studio', href: '/contests', icon: Code2 },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors">
            {/* Top Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-colors">
                        EventHub
                    </Link>

                    {/* Nav Links + Actions */}
                    <div className="flex items-center gap-6">
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Theme toggle icon */}
                        <button
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                <Outlet />
            </main>

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-colors">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-4 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Confirm Logout</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to logout? You'll need to log in again to access your account.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelLogout}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
