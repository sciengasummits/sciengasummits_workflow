'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';
const SEED = [
    { id: 1, name: 'Dr. Elena Kozlov', title: 'Senior Aerodynamics Engineer', affiliation: 'Airbus Defence & Space', country: 'Germany', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', bio: 'Dr. Elena Kozlov is an aerospace engineer attending as a delegate from Airbus, with research interests in advanced CFD methods for laminar flow control and wing design optimisation.' },
    { id: 2, name: 'Eng. Mohammed Al-Farsi', title: 'Senior Process Engineer', affiliation: 'Abu Dhabi National Energy Company (TAQA)', country: 'UAE', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', bio: 'Mohammed Al-Farsi is a senior process engineer specialising in turbomachinery and pipeline flow dynamics, representing TAQA at the conference.' },
    { id: 3, name: 'Dr. Li Wei', title: 'Structural Dynamics Specialist', affiliation: 'COMAC â€“ Commercial Aircraft Corporation of China', country: 'China', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80', bio: 'Dr. Li Wei is a structural dynamics specialist at COMAC attending to explore collaborations in vortex-induced vibration mitigation for next-generation aircraft design.' },
    { id: 4, name: 'Prof. Maria Fernandez', title: 'Professor of Ocean Engineering', affiliation: 'Universitat PolitÃ¨cnica de Catalunya', country: 'Spain', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80', bio: 'Prof. Maria Fernandez is a delegate representing the European fluid mechanics research community, with expertise in oceanic vortex dynamics.' },
    { id: 5, name: 'Mr. Kenji Nakamura', title: 'Research Engineer', affiliation: 'JAXA â€“ Japan Aerospace Exploration Agency', country: 'Japan', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', bio: 'Mr. Kenji Nakamura is a research engineer at JAXA attending as a delegate, contributing to discussions on hypersonic boundary layer transition and vortex instability.' },
];
export default function DelegatesSpeakers() {
    return <SpeakerPage title="Delegates Speakers" addLabel="Add Delegate Speaker" accentColor="#ec4899" dbCategory="Delegate" initialSpeakers={SEED} />;
}

