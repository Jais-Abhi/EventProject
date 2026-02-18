import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { type Event, type Contest } from '@/types';
import { Calendar, Clock, Heart, Loader2, Search } from 'lucide-react';

const IST_TZ = 'Asia/Kolkata';

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        timeZone: IST_TZ,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

// ─── Event Card ─────────────────────────────────────────────────────────────

interface EventCardProps {
    id: string;
    title: string;
    type: 'MCQ' | 'Coding';
    startTime: string;
    endTime: string;
    href: string;
}

function EventCard({ title, type, startTime, endTime, href }: EventCardProps) {
    return (
        <Link to={href} className="group block">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                {/* Card Top — gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative min-h-[120px] flex flex-col justify-between">
                    {/* Badge + heart */}
                    <div className="flex justify-end items-start">
                        <div className="flex items-center gap-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm uppercase tracking-wider">
                                {type}
                            </span>
                            <span className="bg-white/20 text-white rounded-full p-1.5 backdrop-blur-sm">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                            </span>
                        </div>
                    </div>
                    {/* Title */}
                    <h3 className="text-white font-bold text-xl leading-tight line-clamp-2">
                        {title}
                    </h3>
                </div>

                {/* Card Bottom — white */}
                <div className="bg-white p-5 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-tight">Starts</span>
                            <span className="font-medium">{formatDate(startTime)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-tight">Ends</span>
                            <span className="font-medium">{formatDate(endTime)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

type FilterType = 'MCQ' | 'Coding';

export default function DashboardPage() {
    const { user, isAdmin } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('MCQ');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [eventsRes, contestsRes] = await Promise.all([
                    api.get('/api/events/getAllEvent').catch(() => ({ data: [] })),
                    api.get('/contest/getAll').catch(() => ({ data: [] })),
                ]);
                setEvents(eventsRes.data || []);
                setContests(contestsRes.data || []);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Build unified card list based on filter
    const allCards: EventCardProps[] = filter === 'MCQ'
        ? events.map(e => ({
            id: e.id,
            title: e.title,
            type: 'MCQ' as const,
            startTime: e.startTime,
            endTime: e.endTime,
            href: `/events/${e.id}`,
        }))
        : contests.map(c => ({
            id: c.id,
            title: c.title,
            type: 'Coding' as const,
            startTime: c.startTime,
            endTime: c.endTime,
            href: `/contests/${c.id}`,
        }));

    const filtered = allCards.filter(card =>
        card.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* ── Hero Banner ─────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 shadow-lg">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Hello, {user?.firstName || 'admin'} 👋
                    </h1>
                    <p className="text-white/80 mt-3 text-lg">
                        Explore available quizzes and contests.
                    </p>
                </div>
                {isAdmin && (
                    <Link
                        to="/admin"
                        className="inline-block bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl shadow-md hover:bg-white/95 transition-all whitespace-nowrap text-center"
                    >
                        Create Event
                    </Link>
                )}
            </div>

            {/* ── Filter Buttons ───────────────────────────────────── */}
            <div className="flex items-center gap-4">
                {(['MCQ', 'Coding'] as FilterType[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${filter === f
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Search Bar ──────────────────────────────────────── */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all shadow-sm"
                />
            </div>

            {/* ── Cards Grid ──────────────────────────────────────── */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl font-bold text-gray-400">No {filter} {filter === 'MCQ' ? 'events' : 'contests'} found.</p>
                    <p className="text-sm mt-2">
                        {search ? 'Try a different search term.' : 'Check back later!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {filtered.map(card => (
                        <EventCard key={card.id} {...card} />
                    ))}
                </div>
            )}
        </div>
    );
}
