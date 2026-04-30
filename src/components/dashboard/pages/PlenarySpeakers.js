'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';

const SEED = [
    { id: 1, name: 'Dr. Alice Johnson', title: 'Chair of Energy Policy', affiliation: 'Stanford University, USA', country: 'USA', image: null, bio: 'Dr. Alice Johnson is a globally recognized expert in energy policy and sustainable infrastructure.' },
    { id: 2, name: 'Prof. Robert Lee', title: 'Head of Environmental Sciences', affiliation: 'National University of  Munich, Germany', country: ' Munich, Germany', image: null, bio: 'Prof. Robert Lee leads groundbreaking research on climate adaptation strategies and renewable transition.' },
];

export default function PlenarySpeakers() {
    return (
        <SpeakerPage
            title="Plenary Speakers"
            addLabel="Add Plenary Speaker"
            accentColor="#8b5cf6"
            dbCategory="Plenary Speaker"
            initialSpeakers={SEED}
        />
    );
}
