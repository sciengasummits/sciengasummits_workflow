/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Script — IQCES2026 (International Conference on Quantum Computing & Engineering)
 * Conference ID : 'iqces2026'
 * Run with     : node scripts/seed-iqces2026.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds all SiteContent keys used by the IQCES2026 frontend:
 *   hero · about · importantDates · stats · contact · sessions ·
 *   pricing · registration-prices · faq · venue · brochure
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

// ─── SiteContent model (inline so we don't need TS paths) ────────────────────
const SiteContentSchema = new mongoose.Schema({
    conference: { type: String, default: 'liutex', index: true },
    key:        { type: String, required: true },
    data:       { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt:  { type: Date, default: Date.now },
});
SiteContentSchema.index({ conference: 1, key: 1 }, { unique: true });
const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);

// ─── Conference ID (must match workflow/src/lib/conferences.js) ───────────────
const CONF = 'iqces2026';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const seedData = [

    // ── 1. Hero Section ──────────────────────────────────────────────────────
    {
        key: 'hero',
        data: {
            subtitle: 'June 24–26, 2026 • Bern, Switzerland',
            title: 'QUANTUM COMPUTING\n& ENGINEERING',
            description: 'Join the premier international forum bringing together quantum scientists, engineers, and industry leaders to advance the frontiers of quantum technology.',
            date: 'June 24–26, 2026',
            venue: 'Bern, Switzerland',
            countdownTarget: '2026-06-24T09:00:00',
            ctaButtons: [
                { label: 'Register Now', link: '/register', primary: true },
                { label: 'Submit Abstract', link: '/abstract-submission', primary: false },
            ],
            bgImage: '',  // leave blank — dashboard can upload image later
        },
    },

    // ── 2. About Section ─────────────────────────────────────────────────────
    {
        key: 'about',
        data: {
            subtitle: 'Welcome to Bern, Switzerland',
            title: 'About the Conference',
            paragraph1: 'We are thrilled to welcome you to the International Conference on Quantum Computing & Engineering (IQCES-2026), scheduled to take place from June 24–26, 2026, in the historic city of Bern, Switzerland. This premier scientific gathering brings together global experts from academia and industry to discuss groundbreaking advancements in quantum science.',
            paragraph2: 'Our mission is to foster a collaborative environment where researchers can share innovative findings, explore the next generation of quantum platforms, and discuss the practical applications of quantum information science. Through interdisciplinary dialogue, we aim to accelerate the transition from quantum theory to industrial reality.',
            paragraph3: 'Join us for three immersive days of high-level plenary talks, technical sessions, and meaningful networking in the heart of Europe!',
            objectives: [
                'Accelerate Innovation: To provide a global stage for showcasing breakthrough research in quantum computing, communication, and metrology.',
                'Bridge Research and Industry: To facilitate knowledge transfer between theoretical research and real-world industrial implementation.',
                'Foster Collaborative Networks: To connect leading scientists with emerging researchers to build lasting international partnerships.',
                'Discuss Ethical and Future Implications: To address the societal and security impacts of emerging quantum technologies.',
                'Empower the Next Generation: To support students and early-career researchers through specialized workshops and poster sessions.',
            ],
            keyThemes: [
                'Quantum Algorithms and Complexity',
                'Quantum Information Processing',
                'Quantum Error Correction and Fault Tolerance',
                'Quantum Hardware: Superconducting, Trapped Ion, Photonic',
                'Quantum Cryptography and Post-Quantum Security',
                'Quantum Sensing and Precision Measurements',
                'Scalability and Control of Quantum Systems',
                'Hybrid Quantum-Classical Systems',
            ],
        },
    },

    // ── 3. Important Dates ───────────────────────────────────────────────────
    {
        key: 'importantDates',
        data: {
            dates: [
                { month: 'DEC', day: '10', year: '2025', event: 'Abstract Submission Opens', icon: 'CalendarDays' },
                { month: 'FEB', day: '15', year: '2026', event: 'Early Bird Deadline',         icon: 'CheckCircle' },
                { month: 'APR', day: '20', year: '2026', event: 'Final Submission Deadline',   icon: 'Clock' },
                { month: 'JUN', day: '24', year: '2026', event: 'Conference Start Date', sub: 'June 24–26, Bern, Switzerland', icon: 'Star' },
            ],
        },
    },

    // ── 4. Stats Section ─────────────────────────────────────────────────────
    {
        key: 'stats',
        data: {
            title: 'QUANTUM COMPUTING & ENGINEERING SUMMIT APPROACH',
            items: [
                { id: 1, icon: 'Calendar',     number: '15+',   label: 'Years Experience'   },
                { id: 2, icon: 'CalendarCheck',number: '100+',  label: 'Events'              },
                { id: 3, icon: 'MapPin',       number: '200+',  label: 'Onsite Approach'     },
                { id: 4, icon: 'Mic',          number: '2000+', label: 'Speakers'            },
                { id: 5, icon: 'Users',        number: '5000+', label: 'Attendees'           },
                { id: 6, icon: 'Building2',    number: '20+',   label: 'Exhibitors'          },
                { id: 7, icon: 'Globe',        number: '150+',  label: 'Countries'           },
                { id: 8, icon: 'Newspaper',    number: '2000+', label: 'Publications'        },
            ],
        },
    },

    // ── 5. Contact ───────────────────────────────────────────────────────────
    {
        key: 'contact',
        data: {
            email:    'quantumengineering@sciengasummits.com',
            phone:    '+91 7842090097',
            whatsapp: '+91 7842090097',
            venue:    'Bern, Switzerland',
        },
    },

    // ── 6. Sessions & Schedule ───────────────────────────────────────────────
    {
        key: 'sessions',
        data: {
            sessions: [
                { title: 'Quantum Computing Algorithms',           icon: 'Cpu'         },
                { title: 'Quantum Cryptography & Security',         icon: 'ShieldCheck'  },
                { title: 'Quantum Information Theory',              icon: 'Globe'        },
                { title: 'Superconducting Quantum Circuits',        icon: 'Zap'          },
                { title: 'Trapped Ion Quantum Computing',           icon: 'Activity'     },
                { title: 'Photonic Quantum Technologies',            icon: 'Lightbulb'    },
                { title: 'Quantum Sensing & Metrology',             icon: 'Activity'     },
                { title: 'Topological Quantum Computation',         icon: 'Zap'          },
                { title: 'Quantum Error Correction',                icon: 'ShieldCheck'  },
                { title: 'Industrial Applications of Quantum',      icon: 'Factory'      },
                { title: 'Quantum Machine Learning',                icon: 'Cpu'          },
                { title: 'Quantum Networking & Communication',      icon: 'Globe'        },
                { title: 'Ethics in Quantum Computing',             icon: 'ShieldCheck'  },
                { title: 'Quantum Materials Science',               icon: 'Mountain'     },
                { title: 'Post-Quantum Cryptography',               icon: 'ShieldCheck'  },
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

    // ── 7. Pricing (Homepage RegistrationPricingSection preview cards) ────────
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

    // ── 8. Registration Prices (Register.jsx / DiscountRegistration.jsx) ─────
    {
        key: 'registration-prices',
        data: {
            earlyBirdEndDate: '2026-02-15',
            standardEndDate:  '2026-04-20',
            onspotEndDate:    '2026-06-24',
            processingFeePercent: 5,
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
                            question: 'How can I register for IQCES-2026?',
                            answer: "You can register online through our website by visiting the 'Register' page. Early bird registration is available until February 15, 2026.",
                        },
                        {
                            question: 'Is there a discount for group registrations?',
                            answer: 'Yes, we offer group discounts for groups larger than 5 attendees. Please contact our support team for more details.',
                        },
                        {
                            question: 'What is included in the registration fee?',
                            answer: 'The registration fee covers access to all scientific sessions, the exhibition area, conference materials, coffee breaks, and lunch.',
                        },
                        {
                            question: 'Can I cancel my registration?',
                            answer: 'Cancellations are subject to our refund policy. Please refer to the Terms & Conditions page for detailed information regarding deadlines and refund percentages.',
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
                        {
                            question: 'When will I be notified about my abstract acceptance?',
                            answer: 'Notifications of acceptance will be sent via email within 2–3 weeks after the submission deadline.',
                        },
                        {
                            question: 'Can I present more than one abstract?',
                            answer: 'Yes, you can submit multiple abstracts. However, please ensure that each abstract presents distinct research findings.',
                        },
                        {
                            question: 'What form of presentation is available?',
                            answer: 'Presentations can be in the form of oral presentations or poster displays. You can select your preference during submission, but the final decision rests with the Scientific Committee.',
                        },
                    ],
                },
                {
                    id: 'cat_venue',
                    category: 'Venue & Accommodation',
                    items: [
                        {
                            question: 'Where is the conference taking place?',
                            answer: 'The conference will be held in Bern, Switzerland. Detailed venue information and maps are available on the Venue page.',
                        },
                        {
                            question: 'Are there recommended hotels nearby?',
                            answer: 'Yes, we have partnered with several hotels near the venue to offer discounted rates for attendees. Please check the Venue page for a list of recommended accommodations.',
                        },
                        {
                            question: 'Is there parking available at the venue?',
                            answer: 'Yes, the venue offers ample parking space for attendees. Valet services are also available upon request.',
                        },
                    ],
                },
                {
                    id: 'cat_visa',
                    category: 'Visa & Travel',
                    items: [
                        {
                            question: 'Do I need a visa to attend the conference?',
                            answer: 'Visa requirements depend on your country of citizenship. We can provide an invitation letter to support your visa application upon successful registration. Contact us at quantumengineering@sciengasummits.com.',
                        },
                        {
                            question: 'How do I request an invitation letter?',
                            answer: 'Invitation letters can be requested via email after your registration is confirmed. Please send your request along with your registration ID to our support team.',
                        },
                    ],
                },
            ],
        },
    },

    // ── 10. Venue (image carousel) ───────────────────────────────────────────
    {
        key: 'venue',
        data: {
            images: [
                'https://images.unsplash.com/photo-1595181710363-f1109f2d1130?w=1920&q=80',
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80',
                'https://images.unsplash.com/photo-1540575861501-7ad05823c93e?w=1920&q=80',
            ],
        },
    },

    // ── 11. Brochure ─────────────────────────────────────────────────────────
    {
        key: 'brochure',
        data: {
            pdfUrl: '',   // dashboard can upload a real PDF URL here
            title: 'International Conference on Quantum Computing & Engineering (IQCES-2026)',
            note: '* Format: PDF • Updated: December 2025',
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
            // Update in place — preserves any manual dashboard edits if you want;
            // use --force flag (process.argv.includes('--force')) to overwrite.
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
