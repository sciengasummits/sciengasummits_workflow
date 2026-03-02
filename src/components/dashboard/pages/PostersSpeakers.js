'use client';

import SpeakerPage from '@/components/dashboard/SpeakerPage';
const SEED = [
    { id: 1, name: 'Mr. Rahul Sharma', title: 'PhD Candidate', affiliation: 'Indian Institute of Technology Bombay', country: 'India', image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400&q=80', bio: 'Rahul Sharma is a PhD candidate researching vortex ring dynamics and their interaction with solid boundaries, presenting his poster on DNS of turbulent pipe flows.' },
    { id: 2, name: 'Ms. Yuki Tanaka', title: 'Graduate Researcher', affiliation: 'University of Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80', bio: 'Yuki Tanaka is a graduate researcher focusing on Liutex-based coherent structure detection in transitional boundary layers.' },
    { id: 3, name: 'Mr. Carlos Mendez', title: 'MSc Researcher', affiliation: 'Universidad PolitÃ©cnica de Madrid', country: 'Spain', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', bio: 'Carlos Mendez presents experimental and CFD comparisons of the Omega vortex identification method applied to delta wing vortex breakdown.' },
    { id: 4, name: 'Ms. Amira Hassan', title: 'PhD Student', affiliation: 'Cairo University', country: 'Egypt', image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=400&q=80', bio: 'Amira Hassan investigates vortex shedding patterns in bluff body flows using PIV measurements and Liutex post-processing.' },
    { id: 5, name: 'Mr. Luca Rossi', title: 'PhD Candidate', affiliation: 'Politecnico di Milano', country: 'Italy', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', bio: 'Luca Rossi presents his poster on multi-scale vortex interactions in turbulent channel flow, validated against high-resolution experimental datasets.' },
];
export default function PostersSpeakers() {
    return <SpeakerPage title="Posters Speakers" addLabel="Add Poster Speaker" accentColor="#10b981" dbCategory="Poster Presenter" initialSpeakers={SEED} />;
}

