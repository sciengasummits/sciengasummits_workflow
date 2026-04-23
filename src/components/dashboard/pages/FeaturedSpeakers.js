'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';

const SEED = [
    {
        id: 1,
        name: 'Mr. Edward Eastlack',
        title: 'Chief Executive Officer',
        affiliation: 'InterModal Renewables LLC',
        country: 'USA',
        bio: 'Mr. Edward Eastlack is a seasoned energy executive with over 30 years of leadership experience in renewable energy and infrastructure development. He has pioneered multiple clean energy initiatives across North America.',
        image: null,
    },
    {
        id: 2,
        name: 'Dr. Florian Kongoli',
        title: 'Executive President (CEO)',
        affiliation: 'FLOGEN Technologies Inc.',
        country: 'Canada, USA',
        bio: 'Dr. Florian Kongoli is a renowned scientist and industrialist whose work spans metallurgy, materials science, and sustainable energy systems. He is the founder of FLOGEN Technologies.',
        image: null,
    },
    {
        id: 3,
        name: 'Dr. Faisal Manzoor Arain',
        title: 'CEO and Co-Founder',
        affiliation: 'AM Management Global Inc',
        country: 'Alberta, Canada',
        bio: 'Dr. Faisal Manzoor Arain is an experienced academic and industry leader specializing in construction project management, sustainability, and engineering education.',
        image: null,
    },
];

export default function FeaturedSpeakers() {
    return (
        <SpeakerPage
            title="Featured Speakers"
            addLabel="Add Featured Speaker"
            accentColor="#6366f1"
            dbCategory="Featured"
            initialSpeakers={SEED}
        />
    );
}
