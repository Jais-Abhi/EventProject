import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Code2, Users, FileText, BarChart3, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
    const links = [
        { name: 'Quiz Studio', href: '/admin/events', icon: Trophy, color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' },
        { name: 'Contest Studio', href: '/admin/contests', icon: Code2, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30' },
        { name: 'Manage Problems', href: '/admin/problems', icon: FileText, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30' },
        { name: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' },
        { name: 'Event Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30' },
        { name: 'All Submissions', href: '/admin/submissions', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight dark:text-slate-50 transition-colors duration-200">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Link key={link.name} to={link.href}>
                        <Card className="hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-slate-50 transition-colors duration-200">
                                    {link.name}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${link.color} transition-colors duration-200`}>
                                    <link.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-slate-50 transition-colors duration-200">Access Panel</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
