'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';
const SEED = [
    { id: 1, name: 'Prof. John Doe', title: 'Conference Chair', affiliation: 'Global University', country: 'USA', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', bio: 'Expert in the field with over 20 years of experience.' },
    { id: 2, name: 'Dr. Jane Smith', title: 'Technical Chair', affiliation: 'Research Institute', country: 'UK', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', bio: 'Leading researcher in the conference domain.' },
];
export default function CommitteeSpeakers() {
    return <SpeakerPage title="Committee Speakers" addLabel="Add Committee Speaker" accentColor="#6366f1" dbCategory="Committee" initialSpeakers={SEED} />;
}

