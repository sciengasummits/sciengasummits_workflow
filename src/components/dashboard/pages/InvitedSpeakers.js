'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';

const SEED = [
    {
        id: 1,
        name: 'Mr. Edward Eastlack',
        affiliation: 'Chief Executive Officer InterModal Renewables LLC',
        country: 'USA',
        bio: 'Mr. Edward Eastlack is a seasoned energy executive with over 30 years of leadership experience in renewable energy and infrastructure development.'
    },
    {
        id: 2,
        name: 'Dr. Florian Kongoli',
        affiliation: 'FLOGEN Technologies Inc.',
        country: 'Canada, USA',
        bio: 'Dr. Florian Kongoli is a renowned scientist and industrialist whose work spans metallurgy and sustainable energy systems.'
    },
];

export default function InvitedSpeakers() {
    return (
        <SpeakerPage
            title="Invited Speakers"
            addLabel="Add Invited Speaker"
            accentColor="#10b981"
            dbCategory="Invited Speaker"
            initialSpeakers={SEED}
        />
    );
}
