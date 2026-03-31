'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';
const SEED = [
    { id: 1, name: 'Mr. Ahmed Al-Rashidi', title: 'Undergraduate Researcher', affiliation: 'King Abdullah University of Science & Technology (KAUST)', country: 'Saudi Arabia', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', bio: 'Ahmed is an undergraduate student in mechanical engineering, presenting his first conference paper on Liutex vortex decomposition applied to cavity flows.' },
    { id: 2, name: 'Ms. Sofia Petrov', title: "MSc Student", affiliation: 'Bauman Moscow State Technical University', country: 'Russia', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', bio: "Sofia is a final-year master's student researching coherent vortex structures in rotating machinery using the Rortex method." },
    { id: 3, name: 'Mr. Wei Chen', title: 'PhD Student', affiliation: 'Tsinghua University', country: 'China', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', bio: 'Wei Chen is a second-year PhD student exploring data-driven approaches to vortex identification using neural networks trained on DNS flow field datasets.' },
    { id: 4, name: 'Ms. Priya Nair', title: "MSc Student", affiliation: 'Indian Institute of Science (IISc)', country: 'India', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', bio: "Priya is a master's student in aerospace engineering. Her research focuses on laminar-to-turbulent transition visualised using Liutex and Lambda2 methods." },
    { id: 5, name: 'Mr. Jonas Becker', title: "MSc Student", affiliation: 'Technical University of Munich (TUM)', country: 'Germany', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', bio: "Jonas is pursuing his master's degree in computational mechanics, presenting research on GPU-accelerated vortex identification for large-scale LES simulations." },
    { id: 6, name: 'Ms. Hana Kim', title: 'PhD Student', affiliation: 'Seoul National University', country: 'South Korea', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', bio: 'Hana Kim is a PhD student studying ocean engineering, applying Liutex to underwater vehicle wake analysis for drag reduction.' },
];
export default function StudentsSpeakers() {
    return <SpeakerPage title="Students Speakers" addLabel="Add Student Speaker" accentColor="#f59e0b" dbCategory="Student" initialSpeakers={SEED} />;
}

