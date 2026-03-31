'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';
const SEED = [
    { id: 1, name: 'Prof. Chaoqun Liu', title: 'Founder of Liutex Theory', affiliation: 'University of Texas at Arlington', country: 'USA', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80', bio: 'Prof. Chaoqun Liu is the founder of Liutex theory and a world-renowned expert in computational fluid dynamics. He has led pioneering research in vortex identification and turbulence at UTA for over 30 years.' },
    { id: 2, name: 'Prof. Yiqian Wang', title: 'Professor of Fluid Mechanics', affiliation: 'Soochow University', country: 'China', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', bio: 'Prof. Yiqian Wang is a leading researcher in Liutex applications and vortex dynamics. She has contributed significantly to the mathematical foundations of the Liutex method.' },
    { id: 3, name: 'Prof. Pushkar Raj Pokharel', title: 'Conference General Chair', affiliation: 'Kathmandu University', country: 'Nepal', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80', bio: 'Prof. Pushkar Raj Pokharel specialises in fluid mechanics and engineering education. He chairs the international organising committee for LIUTEX VORTEX SUMMIT 2026.' },
    { id: 4, name: 'Dr. Oscar Alvarez', title: 'Technical Programme Chair', affiliation: 'UNAM â€“ National Autonomous University of Mexico', country: 'Mexico', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', bio: 'Dr. Oscar Alvarez is a researcher in aerodynamics and vortex-induced vibrations with extensive industry collaboration across aerospace and civil engineering sectors.' },
    { id: 5, name: 'Prof. Ping Lu', title: 'Scientific Committee Head', affiliation: 'University of Texas at Arlington', country: 'USA', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', bio: 'Prof. Ping Lu is an expert in turbulent boundary layers and CFD simulations. She has co-authored more than 150 publications on Liutex-based flow field analysis.' },
];
export default function CommitteeSpeakers() {
    return <SpeakerPage title="Committee Speakers" addLabel="Add Committee Speaker" accentColor="#6366f1" dbCategory="Committee" initialSpeakers={SEED} />;
}

