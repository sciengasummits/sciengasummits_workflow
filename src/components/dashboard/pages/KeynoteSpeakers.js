'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';

const SEED = [
    { id: 1, name: 'Dr. Jane Smith', title: 'Professor of Renewable Energy', affiliation: 'MIT, USA', country: 'USA', image: null, bio: 'Dr. Jane Smith is a leading expert in renewable energy systems and sustainable development.' },
    { id: 2, name: 'Prof. John Doe', title: 'Director of Climate Research', affiliation: 'Oxford University, UK', country: 'UK', image: null, bio: 'Prof. John Doe has pioneered research in climate change mitigation and green energy solutions.' },
];

export default function KeynoteSpeakers() {
    return (
        <SpeakerPage
            title="Keynote Speakers"
            addLabel="Add Keynote Speaker"
            accentColor="#0ea5e9"
            dbCategory="Keynote Speaker"
            initialSpeakers={SEED}
        />
    );
}
