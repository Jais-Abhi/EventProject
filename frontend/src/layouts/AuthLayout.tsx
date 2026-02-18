import { type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                        <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-50">{title}</h2>
                    {subtitle && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
}
