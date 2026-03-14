import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Abstract from '@/models/Abstract';
import Registration from '@/models/Registration';
import Speaker from '@/models/Speaker';
import SiteContent from '@/models/SiteContent';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';

        const abstractsCount = await Abstract.countDocuments({ conference: conf });
        const registrationsCount = await Registration.countDocuments({ conference: conf });

        const allSpeakers = await Speaker.find({ conference: conf });
        const speakerStats = {
            total: allSpeakers.length,
            committee: allSpeakers.filter(s => s.category === 'Committee').length,
            plenary: allSpeakers.filter(s => s.category === 'Plenary').length,
            keynote: allSpeakers.filter(s => s.category === 'Keynote').length,
            featured: allSpeakers.filter(s => s.category === 'Featured').length,
            invited: allSpeakers.filter(s => s.category === 'Invited').length,
            poster: allSpeakers.filter(s => s.category === 'Poster Presenter').length,
            student: allSpeakers.filter(s => s.category === 'Student').length,
            delegate: allSpeakers.filter(s => s.category === 'Delegate').length,
        };

        let sessionsCount = 0;
        try {
            const sessionsContent = await SiteContent.findOne({ conference: conf, key: 'sessions' });
            if (sessionsContent?.data?.sessions) {
                sessionsCount = sessionsContent.data.sessions.length;
            }
        } catch (err) {
            console.warn('Could not fetch sessions count:', err.message);
        }

        return NextResponse.json({
            abstracts: abstractsCount,
            registrations: registrationsCount,
            scientificProgramme: sessionsCount,
            speakers: speakerStats,
            sessions: sessionsCount,
        });
    } catch (err) {
        console.error('Stats API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
