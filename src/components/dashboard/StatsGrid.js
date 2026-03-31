'use client';

import { useState, useEffect } from 'react';
import {
    FileText, ClipboardList, BookOpen, Users, Mic, Megaphone,
    Star, UserPlus, Layers, GraduationCap, Briefcase, Image
} from 'lucide-react';
import { getDashboardStats, getConference } from '@/lib/api';

export default function StatsGrid({ onCardClick }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const activeConf = getConference();
    const [currentConference, setCurrentConference] = useState(activeConf);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
                setCurrentConference(getConference());
                setError(null);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatsConfig = (data) => {
        const isLiutex = currentConference === 'liutex';

        if (isLiutex) {
            return [
                { id: 'abstracts', label: 'Abstracts', value: data?.abstracts || 0, icon: <FileText size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'registrations', label: 'Registrations', value: data?.registrations || 0, icon: <ClipboardList size={28} strokeWidth={2} />, color: 'green' },
                { id: 'scientific', label: 'Scientific Programme', value: data?.scientificProgramme || 0, icon: <BookOpen size={28} strokeWidth={2} />, color: 'gold' },
                { id: 'committee', label: 'Committee Speakers', value: data?.speakers?.committee || 0, icon: <Users size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'speakers-list', label: 'All Speakers', value: data?.speakers?.total || 0, icon: <Mic size={28} strokeWidth={2} />, color: 'green' },
                { id: 'poster', label: 'Poster Speakers', value: data?.speakers?.poster || 0, icon: <Image size={28} strokeWidth={2} />, color: 'gold' },
                { id: 'student', label: 'Student Speakers', value: data?.speakers?.student || 0, icon: <GraduationCap size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'delegate', label: 'Delegate Speakers', value: data?.speakers?.delegate || 0, icon: <Briefcase size={28} strokeWidth={2} />, color: 'green' },
                { id: 'sessions', label: 'Sessions', value: data?.sessions || 0, icon: <Layers size={28} strokeWidth={2} />, color: 'gold' },
            ];
        } else {
            return [
                { id: 'abstracts', label: 'Abstracts', value: data?.abstracts || 0, icon: <FileText size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'registrations', label: 'Registrations', value: data?.registrations || 0, icon: <ClipboardList size={28} strokeWidth={2} />, color: 'green' },
                { id: 'scientific', label: 'Scientific Programme', value: data?.scientificProgramme || 0, icon: <BookOpen size={28} strokeWidth={2} />, color: 'gold' },
                { id: 'committee', label: 'Committee', value: data?.speakers?.committee || 0, icon: <Users size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'plenary', label: 'Plenary Speakers', value: data?.speakers?.plenary || 0, icon: <Mic size={28} strokeWidth={2} />, color: 'green' },
                { id: 'keynote', label: 'Keynote Speakers', value: data?.speakers?.keynote || 0, icon: <Megaphone size={28} strokeWidth={2} />, color: 'gold' },
                { id: 'featured', label: 'Featured Speakers', value: data?.speakers?.featured || 0, icon: <Star size={28} strokeWidth={2} />, color: 'teal' },
                { id: 'invited', label: 'Invited Speakers', value: data?.speakers?.invited || 0, icon: <UserPlus size={28} strokeWidth={2} />, color: 'green' },
                { id: 'tracks', label: 'Tracks', value: data?.sessions || 0, icon: <Layers size={28} strokeWidth={2} />, color: 'gold' },
            ];
        }
    };

    if (loading) {
        return (
            <div className="stats-grid">
                <div className="stats-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="stats-grid">
                <div className="stats-error">
                    <p>Error loading statistics: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    const statsConfig = getStatsConfig(stats);

    return (
        <div className="stats-grid">
            {statsConfig.map((stat) => (
                <div
                    key={stat.id}
                    className={`stat-card ${stat.color}`}
                    onClick={() => onCardClick && onCardClick(stat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick(stat.id)}
                >
                    <div className="stat-icon-wrap">{stat.icon}</div>
                    <div className="stat-info">
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
