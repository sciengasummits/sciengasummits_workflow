/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Script — AIROBOTSML (International Conference on Artificial Intelligence, Robotics and Machine Learning)
 * Conference ID : 'airobotsml'
 * Run with     : node scripts/seed-airobotsml.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

// ─── MongoDB connection ───────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set. Add it to workflow/.env or backend/.env');
    process.exit(1);
}

// ─── SiteContent model ────────────────────
const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key:        { type: String, required: true },
    data:       { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt:  { type: Date, default: Date.now },
});
SiteContentSchema.index({ conference: 1, key: 1 }, { unique: true });
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

// ─── Conference ID ───────────────
const CONF = 'airobotsml';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const seedData = [

    // ── 1. Hero Section ──────────────────────────────────────────────────────
    {
        key: 'hero',
        data: {
            subtitle: 'March 10–12, 2027 • Seoul, South Korea',
            title: 'ARTIFICIAL INTELLIGENCE,\nROBOTICS & MACHINE LEARNING',
            description: 'Join the premier international forum bringing together AI researchers, robotics engineers, and machine learning experts to discuss the future of intelligent systems.',
            date: 'March 10–12, 2027',
            venue: 'Seoul, South Korea',
            countdownTarget: '2027-03-10T09:00:00',
            ctaButtons: [
                { label: 'Register Now', link: '/register', primary: true },
                { label: 'Submit Abstract', link: '/abstract-submission', primary: false },
            ],
            bgImage: '',
        },
    },

    // ── 2. About Section ─────────────────────────────────────────────────────
    {
        key: 'about',
        data: {
            subtitle: 'Welcome to Seoul',
            title: 'About the Conference',
            paragraph1: 'We are honored to invite you to the International Conference on Artificial Intelligence, Robotics and Machine Learning (AIROBOTSML-2027), taking place from March 10–12, 2027, in the vibrant city of Seoul, South Korea. This summit serves as a global platform for pioneering researchers and industry leaders to explore the latest breakthroughs in AI and robotics.',
            paragraph2: 'The conference will cover a broad spectrum of topics, from neural networks and deep learning to autonomous systems and human-robot interaction. Our goal is to foster collaboration between academia and industry, driving the next wave of technological innovation that will reshape our world.',
            paragraph3: 'Join us for three days of high-impact presentations, technical workshops, and unparalleled networking opportunities in one of the world\'s leading tech hubs!',
            objectives: [
                'Advance AI Research: To showcase the latest developments in machine learning algorithms and their applications.',
                'Robotics Innovation: To discuss the future of autonomous systems and robotic hardware engineering.',
                'Interdisciplinary Synergy: To bridge the gap between AI theory and practical robotics implementation.',
                'Ethics and Governance: To address the societal impacts and ethical considerations of intelligent systems.',
                'Industry Integration: To facilitate the adoption of AI and robotics across various industrial sectors.',
            ],
            keyThemes: [
                'Deep Learning and Neural Networks',
                'Computer Vision and Pattern Recognition',
                'Natural Language Processing',
                'Autonomous Vehicles and Systems',
                'Human-Robot Collaboration',
                'AI in Healthcare and Biomedicine',
                'Ethics and Policy in AI',
                'Edge Computing and Embedded AI',
            ],
        },
    },

    // ── 3. Important Dates ───────────────────────────────────────────────────
    {
        key: 'importantDates',
        data: {
            dates: [
                { month: 'SEP', day: '15', year: '2026', event: 'Abstract Submission Opens', icon: 'CalendarDays' },
                { month: 'NOV', day: '20', year: '2026', event: 'Early Bird Deadline',         icon: 'CheckCircle' },
                { month: 'JAN', day: '10', year: '2027', event: 'Final Submission Deadline',   icon: 'Clock' },
                { month: 'MAR', day: '10', year: '2027', event: 'Conference Start Date', sub: 'March 10–12, Seoul, South Korea', icon: 'Star' },
            ],
        },
    },

    // ── 4. Stats Section ─────────────────────────────────────────────────────
    {
        key: 'stats',
        data: {
            title: 'AI, ROBOTICS & ML SUMMIT APPROACH',
            items: [
                { id: 1, icon: 'Calendar',     number: '12+',   label: 'Years Experience'   },
                { id: 2, icon: 'CalendarCheck',number: '80+',   label: 'Events'              },
                { id: 3, icon: 'MapPin',       number: '150+',  label: 'Onsite Approach'     },
                { id: 4, icon: 'Mic',          number: '1500+', label: 'Speakers'            },
                { id: 5, icon: 'Users',        number: '4000+', label: 'Attendees'           },
                { id: 6, icon: 'Building2',    number: '30+',   label: 'Exhibitors'          },
                { id: 7, icon: 'Globe',        number: '120+',  label: 'Countries'           },
                { id: 8, icon: 'Newspaper',    number: '1800+', label: 'Publications'        },
            ],
        },
    },

    // ── 5. Contact ───────────────────────────────────────────────────────────
    {
        key: 'contact',
        data: {
            email:    'airobotsml@sciengasummits.com',
            phone:    '+91 7842090097',
            whatsapp: '+91 7842090097',
            venue:    'Seoul, South Korea',
        },
    },

    // ── 6. Sessions & Schedule ───────────────────────────────────────────────
    {
        key: 'sessions',
        data: {
            sessions: [
                { title: 'Machine Learning Theory',                icon: 'Cpu'         },
                { title: 'Robotics Design & Control',              icon: 'Activity'     },
                { title: 'Computer Vision Systems',                 icon: 'Eye'          },
                { title: 'NLP & Language Models',                   icon: 'MessageSquare'},
                { title: 'Reinforcement Learning',                  icon: 'Zap'          },
                { title: 'Autonomous Drone Swarms',                 icon: 'Plane'        },
                { title: 'AI in Smart Manufacturing',               icon: 'Factory'      },
                { title: 'Explainable AI (XAI)',                    icon: 'ShieldCheck'  },
                { title: 'Edge AI and IoT',                         icon: 'Globe'        },
                { title: 'Social Robotics',                         icon: 'Users'        },
                { title: 'Ethical AI Frameworks',                   icon: 'Scale'        },
                { title: 'Bio-inspired Robotics',                   icon: 'Mountain'     },
            ],
            schedule: {
                day1: [
                    { time: '8.30 – 9.00',  program: 'Registration' },
                    { time: '9.00 – 9.30',  program: 'Conference Inauguration' },
                    { time: '9.30 – 11.00', program: 'Plenary Sessions' },
                    { time: '11.00 – 11.20',program: 'Tea/Coffee Break' },
                    { time: '11.20 – 13.00',program: 'Plenary Sessions' },
                    { time: '13.00 – 13.10',program: 'Group Photograph' },
                    { time: '13.10 – 14.00',program: 'Lunch' },
                    { time: '14.00 – 15.40',program: 'Keynote Sessions' },
                    { time: '15.40 – 16.00',program: 'Tea/Coffee Break' },
                    { time: '16.00 – 17.30',program: 'Keynote Sessions' },
                    { time: '17.30 – 18.30',program: 'Workshop' },
                ],
                day2: [
                    { time: '9.00 – 10.30', program: 'Scientific Sessions' },
                    { time: '10.30 – 10.50',program: 'Tea/Coffee Break' },
                    { time: '10.50 – 13.00',program: 'Poster Presentations' },
                    { time: '13.00 – 14.00',program: 'Lunch' },
                    { time: '14.00 – 15.30',program: 'Panel Discussions' },
                    { time: '15.30 – 16.00',program: 'Award Ceremony & Closing' },
                ],
                day3: [
                    { time: '9.00 – 10.30', program: 'Networking Session' },
                    { time: '10.30 – 11.00',program: 'Tea/Coffee Break' },
                    { time: '11.00 – 12.30',program: 'Future Trends Workshop' },
                    { time: '12.30 – 13.30',program: 'Lunch' },
                    { time: '13.30 – 15.00',program: 'Final Remarks & Departure' },
                ],
            },
        },
    },

    // ── 7. Pricing ────────
    {
        key: 'pricing',
        data: {
            packages: [
                {
                    title: 'Speaker',
                    price: '$699',
                    badge: 'Early Bird',
                    features: [
                        'Oral / Poster Presentation',
                        'Conference Kit & Certificate',
                        'All Sessions Access',
                        'Lunch & Coffee Breaks',
                        'Networking Events',
                    ],
                },
                {
                    title: 'Delegate',
                    price: '$799',
                    badge: 'Early Bird',
                    featured: true,
                    features: [
                        'Attend All Presentations',
                        'Conference Kit & Certificate',
                        'All Sessions Access',
                        'Lunch & Coffee Breaks',
                        'Networking Events',
                        'Workshop Access',
                    ],
                },
                {
                    title: 'Virtual',
                    price: '$149',
                    badge: 'Early Bird',
                    features: [
                        'Live Stream All Sessions',
                        'Digital Conference Kit',
                        'E-Certificate of Participation',
                        'Recorded Sessions Access',
                        'Online Networking',
                    ],
                },
            ],
        },
    },

    // ── 8. Registration Prices ─────
    {
        key: 'registration-prices',
        data: {
            registrationStartDate: '2026-09-01',
            earlyBirdEndDate: '2026-11-20',
            standardEndDate:  '2027-01-10',
            onspotEndDate:    '2027-03-10',
            processingFeePercent: 5,
            accompanyingPersonPrice: 199,
            categories: [
                { id: 'speaker',  label: 'Speaker Registration',  early: 699,  standard: 799,  onspot: 899  },
                { id: 'delegate', label: 'Delegate Registration',  early: 799,  standard: 899,  onspot: 999 },
                { id: 'poster',   label: 'Poster Registration',    early: 399,  standard: 499,  onspot: 599  },
                { id: 'student',  label: 'Student',                early: 249,  standard: 349,  onspot: 449  },
                { id: 'virtual',  label: 'Virtual (Online)',        early: 149,  standard: 199,  onspot: 249  },
            ],
            sponsorships: [
                { id: 'platinum',  label: 'Platinum Sponsor', price: 4500 },
                { id: 'diamond',   label: 'Diamond Sponsor',  price: 3500 },
                { id: 'gold',      label: 'Gold Sponsor',     price: 2500 },
                { id: 'exhibitor', label: 'Exhibitor',         price: 1500 },
            ],
            accommodation: [
                { nights: 2, single: 300, double: 350, triple: 400 },
                { nights: 3, single: 450, double: 525, triple: 600 },
                { nights: 4, single: 600, double: 700, triple: 800 },
                { nights: 5, single: 750, double: 875, triple: 1000 },
            ],
        },
    },

    // ── 9. FAQ ───────────────────────────────────────────────────────────────
    {
        key: 'faq',
        data: {
            pageTitle: 'Frequently Asked Questions',
            ctaText: "Can't find the answer you're looking for? Please chat to our friendly team.",
            categories: [
                {
                    id: 'cat_registration',
                    category: 'Registration',
                    items: [
                        {
                            question: 'How can I register for AIROBOTSML-2027?',
                            answer: "You can register online through our website by visiting the 'Register' page. Early bird registration is available until November 20, 2026.",
                        },
                        {
                            question: 'Is there a discount for group registrations?',
                            answer: 'Yes, we offer group discounts for groups larger than 5 attendees. Please contact our support team for more details.',
                        },
                    ],
                },
                {
                    id: 'cat_scientific',
                    category: 'Scientific Program',
                    items: [
                        {
                            question: 'How can I submit an abstract?',
                            answer: "Abstracts can be submitted via the 'Abstract Submission' page. Please follow the guidelines provided for formatting and submission deadlines.",
                        },
                    ],
                },
            ],
        },
    },

    // ── 10. Venue ───────────────────────────────────────────────────────────
    {
        key: 'venue',
        data: {
            images: [
                'https://images.unsplash.com/photo-1525625239513-94e94f8ec000?w=1920&q=80',
                'https://images.unsplash.com/photo-1565967511849-75a6fd337d5a?w=1920&q=80',
                'https://images.unsplash.com/photo-1506466010722-395ee2bef877?w=1920&q=80',
            ],
        },
    },

    // ── 11. Brochure ─────────────────────────────────────────────────────────
    {
        key: 'brochure',
        data: {
            pdfUrl: '',
            title: 'International Conference on Artificial Intelligence, Robotics and Machine Learning (AIROBOTSML-2027)',
            note: '* Format: PDF • Updated: September 2026',
        },
    },

    // ── 12. Hero Chairs ──────────────────────────────────────────────────────
    {
        key: 'heroChairs',
        data: [
            {
                id: 1775152215801,
                title: 'Conference Chairperson',
                name: 'Prof. Dr. Sung-Bae Cho',
                designation: 'Professor of Computer Science',
                affiliation: 'Yonsei University',
                country: 'South Korea',
                image: ''
            },
            {
                id: 1775152215802,
                title: 'Conference Co-Chairperson',
                name: 'Prof. Dr. Elizabeth Croft',
                designation: 'Professor of Robotics',
                affiliation: 'Monash University',
                country: 'Australia',
                image: ''
            }
        ]
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
    console.log('\n🔗  Connecting to MongoDB…');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected\n');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const { key, data } of seedData) {
        const filter = { conference: CONF, key };
        const existing = await SiteContent.findOne(filter);

        if (existing) {
            if (process.argv.includes('--force')) {
                await SiteContent.findOneAndUpdate(filter, { $set: { data, updatedAt: new Date() } });
                console.log(`  ♻️   UPDATED  [${key}]`);
                updated++;
            } else {
                console.log(`  ⏩  SKIPPED  [${key}]  (already exists — run with --force to overwrite)`);
                skipped++;
            }
        } else {
            await SiteContent.create({ conference: CONF, key, data });
            console.log(`  ✅  CREATED  [${key}]`);
            created++;
        }
    }

    console.log(`\n─────────────────────────────`);
    console.log(`  Conference : ${CONF}`);
    console.log(`  Created    : ${created}`);
    console.log(`  Updated    : ${updated}`);
    console.log(`  Skipped    : ${skipped}`);
    console.log(`  Total keys : ${seedData.length}`);
    console.log(`─────────────────────────────\n`);

    await mongoose.disconnect();
    console.log('🔌  Disconnected. Done!\n');
}

seed().catch(err => {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
});
