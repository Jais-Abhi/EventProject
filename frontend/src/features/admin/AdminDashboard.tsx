'use client';

import { motion } from 'framer-motion';
import { Trophy, Code2, Users, FileText, BarChart3, ClipboardList, TrendingUp, Zap, Shield } from 'lucide-react';
import { GlassmorphismCard } from './components/GlassmorphismCard';
import { StatCard } from './components/StatCard';

export default function AdminDashboard() {

    const links = [
        {
            name: 'Quiz Studio',
            href: '/admin/events',
            icon: Trophy,
            gradientBg: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Contest Studio',
            href: '/admin/contests',
            icon: Code2,
            gradientBg: 'from-indigo-500 to-purple-500',
        },
        {
            name: 'Manage Problems',
            href: '/admin/problems',
            icon: FileText,
            gradientBg: 'from-amber-500 to-orange-500',
        },
        {
            name: 'Manage Users',
            href: '/admin/users',
            icon: Users,
            gradientBg: 'from-emerald-500 to-teal-500',
        },
        {
            name: 'Event Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
            gradientBg: 'from-violet-500 to-fuchsia-500',
        },
        {
            name: 'All Submissions',
            href: '/admin/submissions',
            icon: ClipboardList,
            gradientBg: 'from-orange-500 to-red-500',
        },
    ];

    const stats = [
        { icon: Trophy, label: 'Active Quizzes', value: 24, color: 'text-blue-700 dark:text-blue-400' },
        { icon: Code2, label: 'Running Contests', value: 8, color: 'text-indigo-700 dark:text-indigo-400' },
        { icon: Users, label: 'Total Users', value: 1250, color: 'text-emerald-700 dark:text-emerald-400' },
        { icon: TrendingUp, label: 'Submissions', value: 3542, color: 'text-purple-700 dark:text-purple-400' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            {/* Animated Background Elements - Responsive */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Light Mode Blobs */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-10 sm:top-20 right-10 sm:right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-blue-300/20 to-purple-300/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-10 sm:bottom-40 -left-10 sm:left-20 w-80 sm:w-96 h-80 sm:h-96 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-full blur-3xl"
                />
                {/* Additional Light Mode Blob */}
                <motion.div
                    animate={{ rotate: 180 }}
                    transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/2 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-r from-indigo-300/20 to-pink-300/20 dark:from-indigo-500/10 dark:to-pink-500/10 rounded-full blur-3xl"
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
                {/* Main Content Area - Full Screen */}
                <div className="py-8 sm:py-12 lg:py-16">
                    {/* Page Intro */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 sm:mb-12 lg:mb-16 max-w-7xl mx-auto"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">Admin Dashboard</h2>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-400">Manage your platform and monitor real-time activity</p>
                    </motion.div>

                    {/* Stats Grid - Responsive */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16 max-w-7xl mx-auto"
                    >
                        {stats.map((stat, i) => (
                            <StatCard
                                key={i}
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                                color={stat.color}
                                delay={i * 0.1}
                            />
                        ))}
                    </motion.div>

                    {/* Management Cards Grid - Responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-8 sm:mb-12 max-w-7xl mx-auto"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                            <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-500 dark:text-yellow-400" />
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white">Quick Access Panels</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl">
                            {links.map((link, index) => (
                                <GlassmorphismCard
                                    key={link.name}
                                    name={link.name}
                                    href={link.href}
                                    icon={link.icon}
                                    gradientBg={link.gradientBg}
                                    delay={0.1 + index * 0.08}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom CTA Section - Responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-12 sm:mt-16 lg:mt-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-300/60 dark:border-blue-900 p-6 sm:p-8 lg:p-10 text-center max-w-7xl mx-auto"
                    >
                        <Shield className="h-10 sm:h-12 lg:h-14 w-10 sm:w-12 lg:w-14 mx-auto mb-3 sm:mb-4 text-blue-700 dark:text-blue-400" />
                        <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-3">Platform Overview</h3>
                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Monitor all your quizzes, contests, and user submissions in real-time. Get detailed analytics and insights to improve your platform.
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
