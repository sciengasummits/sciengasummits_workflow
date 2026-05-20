/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Script — ASTROSPACESUMMIT2026
 * Conference ID : 'astrospace'
 * Run with     : node --experimental-vm-modules scripts/seed-astrospace.js
 * Force update : node --experimental-vm-modules scripts/seed-astrospace.js --force
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds all SiteContent keys used by the ASTROSPACESUMMIT2026 frontend:
 *   hero · heroChairs · about · importantDates · stats · contact ·
 *   sessions · pricing · registration-prices · faq · venue · brochure · marquee
 * ─────────────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import mongoose from 'mongoose';

// ─── MongoDB connection ───────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌  MONGODB_URI is not set. Add it to workflow/.env');
    process.exit(1);
}

// ─── SiteContent model (inline) ───────────────────────────────────────────────
const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key:        { type: String, required: true },
    data:       { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt:  { type: Date, default: Date.now },
});
SiteContentSchema.index({ conference: 1, key: 1 }, { unique: true });
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

// ─── Conference ID ────────────────────────────────────────────────────────────
const CONF = 'astrospace';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const seedData = [

    // ── 1. Hero Section ──────────────────────────────────────────────────────
    {
        key: 'hero',
        data: {
            subtitle: 'ANNUAL INTERNATIONAL CONFERENCE ON',
            title: 'ASTRONOMY, ASTROPHYSICS\nAND SPACE SCIENCE',
            description: 'Annual International Conference on Astronomy, Astrophysics and Space Science, where global experts unite to explore the mysteries of the universe. Discover ground-breaking research, connect with leading astronomers and astrophysicists, and explore cutting-edge discoveries transforming our understanding of space and cosmic phenomena.',
            conferenceDate: 'April 12-14, 2027',
            venue: 'Tokyo, Japan',
            countdownTarget: '2027-04-12T09:00:00+09:00',
            showRegister: true,
            showAbstract: true,
            showBrochure: true,
            showAnnouncement: false,
            announcementUrl: '/pdfs/announcement.pdf',
            bgImage: '',
        },
    },

    // ── 2. Hero Chairs ───────────────────────────────────────────────────────
    {
        key: 'heroChairs',
        data: [
            {
                id: 1,
                name: 'Dr. Hiroshi Tanaka',
                affiliation: 'University of Tokyo, Japan',
                country: 'Japan',
                title: 'Conference Chairman',
                image: '',
            },
            {
                id: 2,
                name: 'Dr. Elena Vasquez',
                affiliation: 'European Space Agency (ESA)',
                country: 'Netherlands',
                title: 'Conference Co-Chairman',
                image: '',
            },
            {
                id: 3,
                name: 'Prof. Rajan Mehta',
                affiliation: 'Indian Space Research Organisation (ISRO)',
                country: 'India',
                title: 'Conference Co-Chairman',
                image: '',
            },
        ],
    },

    // ── 3. About Section ─────────────────────────────────────────────────────
    {
        key: 'about',
        data: {
            subtitle: 'Welcome to Tokyo, Japan',
            title: 'About the Conference',
            paragraph1: 'We are thrilled to welcome you to the Annual International Conference on Astronomy, Astrophysics and Space Science (ASTROSPACESUMMIT 2026), scheduled to take place from April 12–14, 2027, in the vibrant city of Tokyo, Japan. This premier scientific gathering brings together global experts from academia, research institutions, and space agencies to discuss groundbreaking advancements in astronomical science.',
            paragraph2: 'Our mission is to foster a collaborative environment where researchers can share innovative findings, explore the next generation of space telescopes and observatories, and discuss the practical applications of astrophysical discoveries. Through interdisciplinary dialogue, we aim to accelerate the transition from theoretical astronomy to real-world space exploration missions.',
            paragraph3: 'Join us for three immersive days of high-level plenary talks, technical sessions, poster presentations, and meaningful networking in the heart of Japan!',
            objectives: [
                'Accelerate Innovation: To provide a global stage for showcasing breakthrough research in astronomy, astrophysics, and space exploration.',
                'Bridge Research and Industry: To facilitate knowledge transfer between theoretical astrophysics and real-world space mission implementation.',
                'Foster Collaborative Networks: To connect leading scientists with emerging researchers to build lasting international partnerships.',
                'Discuss Future Missions: To address upcoming space telescope missions, planetary exploration, and deep-space research priorities.',
                'Empower the Next Generation: To support students and early-career researchers through specialized workshops and poster sessions.',
            ],
            keyThemes: [
                'Stellar Astrophysics & Stellar Evolution',
                'Galactic & Extragalactic Astronomy',
                'Cosmology & Dark Matter/Dark Energy',
                'Exoplanet Detection & Characterization',
                'High-Energy Astrophysics & Black Holes',
                'Space Telescopes & Observational Techniques',
                'Planetary Science & Solar System Exploration',
                'Gravitational Waves & Multi-Messenger Astronomy',
            ],
        },
    },

    // ── 4. Important Dates ───────────────────────────────────────────────────
    {
        key: 'importantDates',
        data: {
            dates: [
                { month: 'JAN', day: '15', year: '2027', event: 'Abstract Submission Opens',    icon: 'CalendarDays' },
                { month: 'FEB', day: '28', year: '2027', event: 'Early Bird Deadline',           icon: 'CheckCircle' },
                { month: 'MAR', day: '20', year: '2027', event: 'Final Submission Deadline',     icon: 'Clock' },
                { month: 'APR', day: '12', year: '2027', event: 'Conference Start Date', sub: 'April 12–14, Tokyo, Japan', icon: 'Star' },
            ],
        },
    },

    // ── 5. Stats Section ─────────────────────────────────────────────────────
    {
        key: 'stats',
        data: {
            title: 'ASTRONOMY, ASTROPHYSICS AND SPACE SCIENCE SUMMIT APPROACH',
            items: [
                { id: 1, icon: 'Calendar',     number: '15+',   label: 'Years Experience' },
                { id: 2, icon: 'CalendarCheck',number: '100+',  label: 'Events'           },
                { id: 3, icon: 'MapPin',       number: '200+',  label: 'Onsite Approach'  },
                { id: 4, icon: 'Mic',          number: '2000+', label: 'Speakers'         },
                { id: 5, icon: 'Users',        number: '5000+', label: 'Attendees'        },
                { id: 6, icon: 'Building2',    number: '20+',   label: 'Exhibitors'       },
                { id: 7, icon: 'Globe',        number: '150+',  label: 'Countries'        },
                { id: 8, icon: 'Newspaper',    number: '2000+', label: 'Publications'     },
            ],
        },
    },

    // ── 6. Contact ───────────────────────────────────────────────────────────
    {
        key: 'contact',
        data: {
            email:    'astrospace@sciengasummits.com',
            phone:    '+91 7842090097',
            whatsapp: '+91 7842090097',
            venue:    'Tokyo, Japan',
        },
    },

    // ── 7. Sessions & Key Themes ─────────────────────────────────────────────
    {
        key: 'sessions',
        data: {
            sessions: [
                { title: 'Stellar Astrophysics & Stellar Evolution',         icon: 'Star'        },
                { title: 'Galactic & Extragalactic Astronomy',               icon: 'Globe'       },
                { title: 'Cosmology & Large-Scale Structure',                icon: 'Cpu'         },
                { title: 'Dark Matter & Dark Energy',                        icon: 'Activity'    },
                { title: 'Exoplanet Detection & Habitability',               icon: 'Zap'         },
                { title: 'High-Energy Astrophysics & Black Holes',           icon: 'ShieldCheck' },
                { title: 'Space Telescopes & Instrumentation',               icon: 'Lightbulb'   },
                { title: 'Planetary Science & Solar System',                 icon: 'MapPin'      },
                { title: 'Gravitational Waves & Multi-Messenger Astronomy',  icon: 'Activity'    },
                { title: 'Astrochemistry & Molecular Clouds',                icon: 'Cpu'         },
                { title: 'Radio Astronomy & VLBI',                           icon: 'Globe'       },
                { title: 'Astrobiology & Origins of Life',                   icon: 'ShieldCheck' },
                { title: 'Space Mission Design & Engineering',               icon: 'Factory'     },
                { title: 'Computational Astrophysics & Simulations',         icon: 'Cpu'         },
                { title: 'Space Policy, Outreach & Education',               icon: 'Newspaper'   },
            ],
            schedule: {
                day1: [
                    { time: '8.30 – 9.00',   program: 'Registration' },
                    { time: '9.00 – 9.30',   program: 'Conference Inauguration' },
                    { time: '9.30 – 11.00',  program: 'Plenary Sessions' },
                    { time: '11.00 – 11.20', program: 'Tea/Coffee Break' },
                    { time: '11.20 – 13.00', program: 'Plenary Sessions' },
                    { time: '13.00 – 13.10', program: 'Group Photograph' },
                    { time: '13.10 – 14.00', program: 'Lunch' },
                    { time: '14.00 – 15.40', program: 'Keynote Sessions' },
                    { time: '15.40 – 16.00', program: 'Tea/Coffee Break' },
                    { time: '16.00 – 17.30', program: 'Keynote Sessions' },
                    { time: '17.30 – 18.30', program: 'Workshop' },
                ],
                day2: [
                    { time: '9.00 – 10.30',  program: 'Scientific Sessions' },
                    { time: '10.30 – 10.50', program: 'Tea/Coffee Break' },
                    { time: '10.50 – 13.00', program: 'Poster Presentations' },
                    { time: '13.00 – 14.00', program: 'Lunch' },
                    { time: '14.00 – 15.30', program: 'Panel Discussions' },
                    { time: '15.30 – 16.00', program: 'Award Ceremony & Closing' },
                ],
                day3: [
                    { time: '9.00 – 10.30',  program: 'Networking Session' },
                    { time: '10.30 – 11.00', program: 'Tea/Coffee Break' },
                    { time: '11.00 – 12.30', program: 'Future Trends Workshop' },
                    { time: '12.30 – 13.30', program: 'Lunch' },
                    { time: '13.30 – 15.00', program: 'Final Remarks & Departure' },
                ],
            },
        },
    },

    // ── 8. Pricing (homepage preview cards) ──────────────────────────────────
    {
        key: 'pricing',
        data: {
            packages: [
                {
                    title: 'Speaker',
                    price: '$749',
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
                    price: '$899',
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
                    price: '$199',
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

    // ── 9. Registration Prices ────────────────────────────────────────────────
    {
        key: 'registration-prices',
        data: {
            registrationStartDate: '2026-10-01',
            earlyBirdEndDate:      '2027-02-28',
            standardEndDate:       '2027-03-20',
            onspotEndDate:         '2027-04-12',
            processingFeePercent:  5,
            accompanyingPersonPrice: 249,
            categories: [
                { id: 'speaker',  label: 'Speaker Registration',  early: 749,  standard: 849,  onspot: 949  },
                { id: 'delegate', label: 'Delegate Registration',  early: 899,  standard: 999,  onspot: 1099 },
                { id: 'poster',   label: 'Poster Registration',    early: 449,  standard: 549,  onspot: 649  },
                { id: 'student',  label: 'Student',                early: 299,  standard: 399,  onspot: 499  },
                { id: 'virtual',  label: 'Virtual (Online)',        early: 199,  standard: 249,  onspot: 299  },
            ],
            sponsorships: [
                { id: 'platinum',  label: 'Platinum Sponsor', price: 4999 },
                { id: 'diamond',   label: 'Diamond Sponsor',  price: 3999 },
                { id: 'gold',      label: 'Gold Sponsor',     price: 2999 },
                { id: 'exhibitor', label: 'Exhibitor',         price: 1999 },
            ],
            accommodation: [
                { nights: 2, single: 360, double: 400, triple: 440 },
                { nights: 3, single: 540, double: 600, triple: 660 },
                { nights: 4, single: 720, double: 800, triple: 880 },
                { nights: 5, single: 900, double: 1000, triple: 1100 },
            ],
        },
    },

    // ── 10. FAQ ───────────────────────────────────────────────────────────────
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
                            question: 'How can I register for ASTROSPACESUMMIT 2026?',
                            answer: "You can register online through our website by visiting the 'Register' page. Early bird registration is available until February 28, 2027.",
                        },
                        {
                            question: 'Is there a discount for group registrations?',
                            answer: 'Yes, we offer group discounts for groups larger than 5 attendees. Please contact our support team for more details.',
                        },
                        {
                            question: 'Can I cancel my registration?',
                            answer: 'Cancellations are subject to our refund policy. Please refer to the Terms & Conditions page for detailed information.',
                        },
                    ],
                },
                {
                    id: 'cat_scientific',
                    category: 'Scientific Program',
                    items: [
                        {
                            question: 'How can I submit an abstract?',
                            answer: "Abstracts can be submitted via the 'Abstract Submission' page. Please follow the guidelines for formatting and submission deadlines.",
                        },
                        {
                            question: 'When will I be notified about abstract acceptance?',
                            answer: 'Notifications of acceptance will be sent via email within 2–3 weeks after the submission deadline.',
                        },
                    ],
                },
                {
                    id: 'cat_venue',
                    category: 'Venue & Accommodation',
                    items: [
                        {
                            question: 'Where is the conference taking place?',
                            answer: 'The conference will be held in Tokyo, Japan. Detailed venue information is available on the Venue page.',
                        },
                        {
                            question: 'Are there recommended hotels nearby?',
                            answer: 'Yes, we have partnered with several hotels near the venue to offer discounted rates for attendees.',
                        },
                    ],
                },
                {
                    id: 'cat_visa',
                    category: 'Visa & Travel',
                    items: [
                        {
                            question: 'Do I need a visa to attend?',
                            answer: 'Visa requirements depend on your nationality. We can provide an invitation letter upon successful registration. Contact astrospace@sciengasummits.com.',
                        },
                    ],
                },
            ],
        },
    },

    // ── 11. Venue ─────────────────────────────────────────────────────────────
    {
        key: 'venue',
        data: {
            images: [
                'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
                'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1920&q=80',
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80',
            ],
        },
    },

    // ── 12. Brochure ──────────────────────────────────────────────────────────
    {
        key: 'brochure',
        data: {
            pdfUrl: '',
            title: 'Annual International Conference on Astronomy, Astrophysics and Space Science (ASTROSPACESUMMIT 2026)',
            note: '* Format: PDF • Updated: May 2026',
        },
    },

    // ── 13. Marquee (Universities) ────────────────────────────────────────────
    {
        key: 'marquee',
        data: {
            title: 'Supporting Universities & Institutions',
            items: [],
        },
    },

    // ── 14. Partners / Media Logos ────────────────────────────────────────────
    {
        key: 'partners_logos',
        data: {
            title: 'Promoting & Media Partners',
            items: [],
        },
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
