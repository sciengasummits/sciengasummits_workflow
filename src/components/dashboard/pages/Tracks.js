'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Layers } from 'lucide-react';

const INITIAL_TRACKS = [
    'BioEnergy: Uses Organic Materials for Energy',
    'Biomass Energy: Produces Heat, Electricity, or Biofuels from Organic Materials',
    'Carbon Capture and Storage (CCS): Captures and stores Carbon Emissions',
    'Carbon Pricing: Establishes Carbon-Related Incentives',
    'Circular Economy: Promotes Waste Reduction and Recycling',
    'Clean Energy Investment: Invests in Renewable Projects',
    'Climate Change Mitigation: Develops Strategies to Reduce Emissions',
    'Climate Resilience: Builds Resilience to Climate Change',
    'Distributed Energy Resources (DERs): Deploys localized Power Generation',
    'Energy Efficiency: Reduces Energy Consumption and Waste',
    'Energy Justice: Ensures Equitable Energy Access',
    'Energy Storage Solutions: Stores Energy for later use',
    'Environmental Impact Assessment: Evaluates Environmental Effects of Energy Projects',
    'Fuel Cell Technology: Converts Chemical Energy to Electricity',
    'Geothermal Energy: Harnesses Earth\'s Heat for Power Generation',
    'Green Building and Net Zero Energy: Designs Energy-Efficient Buildings',
    'Green Hydrogen Production: Produces Hydrogen without Carbon Emissions',
    'Grid Modernization: Upgrades Electrical Grids for Efficiency',
    'Hybrid Renewable Energy Systems: Combines Multiple Energy Sources',
    'Hydropower and Small-Scale Hydro: Generates Electricity from Water Flow',
    'Life Cycle Analysis of Energy Systems: Assesses Environmental Impact Throughout Lifecycle',
    'Marine and Tidal Energy: Generates Electricity from Ocean Movements',
    'Microgrid and Off-Grid Solutions: Creates Self-Sufficient Energy Systems',
    'Nuclear Energy and Sustainability: Explores Clean Nuclear Power Options',
    'Ocean Thermal Energy Conversion: Uses Ocean Temperature Differences for Power',
    'Renewable Energy Integration: Integrates Renewable Sources into Existing Energy Systems',
    'Renewable Energy Policy: Formulates policies for Renewable Adoption',
    'Smart Grids: Modernizes electrical grids for efficiency and reliability.',
    'Solar Energy: Uses sunlight to generate Electricity or Heat Water.',
    'Sustainable Agriculture: Promotes Eco-Friendly Farming.',
    'Sustainable Development Goals (SDGs) and Energy: Aligns Energy Initiatives with Global Goals.',
    'Sustainable Transportation: Promotes Environmentally Friendly Transport',
    'Sustainable Urban Planning: Designs cities for Sustainability',
    'Wind Power: Converts wind Energy into Electricity',
    'Smart Renewable Energy Systems: From Innovation to Integration',
    'AI-Driven Optimization in Renewable Power Grids',
    'Storage and Stability in Renewable-Dominated Grids',
    'Renewables for Climate Resilience and Energy Justice',
    'Next-Gen Solar and Wind Technologies',
];

export default function Tracks() {
    const [tracks, setTracks] = useState(INITIAL_TRACKS);
    const listRef = useRef(null);

    const updateTrack = (idx, value) => {
        setTracks(prev => prev.map((t, i) => (i === idx ? value : t)));
    };

    const deleteTrack = (idx) => {
        setTracks(prev => prev.filter((_, i) => i !== idx));
    };

    const addTrack = () => {
        setTracks(prev => [...prev, '']);
        // Scroll to bottom after state updates
        setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollTop = listRef.current.scrollHeight;
            }
        }, 50);
    };

    const handleSubmit = () => {
        // placeholder
    };

    return (
        <div className="tk-page">
            {/* Header */}
            <div className="tk-page-header">
                <div>
                    <h1 className="tk-title">Sessions</h1>
                    <p className="tk-subtitle">Manage conference tracks and sessions below.</p>
                </div>
            </div>

            {/* Card */}
            <div className="tk-card">
                {/* Toolbar */}
                <div className="tk-toolbar">
                    <div className="tk-track-count">
                        <Layers size={15} />
                        <span>{tracks.length} Main tracks</span>
                    </div>
                    <button className="tk-add-btn" onClick={addTrack}>
                        <Plus size={16} /> Add Track
                    </button>
                </div>

                {/* Track List */}
                <div className="tk-list" ref={listRef}>
                    {tracks.map((track, idx) => (
                        <div key={idx} className={`tk-row${idx % 2 !== 0 ? ' tk-row-even' : ''}`}>
                            <span className="tk-row-label">Track {idx + 1}:</span>
                            <input
                                className="tk-row-input"
                                type="text"
                                value={track}
                                onChange={(e) => updateTrack(idx, e.target.value)}
                            />
                            <button
                                className="tk-row-delete"
                                onClick={() => deleteTrack(idx)}
                                title="Delete track"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="tk-footer">
                    <button className="tk-submit-btn" onClick={handleSubmit}>
                        <Save size={15} /> Submit
                    </button>
                    <span className="tk-footer-info">
                        There are <strong>{tracks.length}</strong> Main tracks.
                    </span>
                </div>
            </div>
        </div>
    );
}

