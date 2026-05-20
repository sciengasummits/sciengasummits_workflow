/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Seed Script — CONDENSEDPHYSSUMMIT2026
 * Conference ID : 'condensedphys'
 * Run with     : node --experimental-vm-modules scripts/seed-condensedphys.js
 * Force update : node --experimental-vm-modules scripts/seed-condensedphys.js --force
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds all SiteContent keys used by the CONDENSEDPHYSSUMMIT2026 frontend:
 *   hero · heroChairs · about · importantDates · stats · contact ·
 *   sessions · pricing · registration-prices · faq · venue · brochure ·
 *   marquee · partners_logos · visa-info
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
const CONF = 'condensedphys';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────
const seedData = [

    // ── 1. Hero Section ──────────────────────────────────────────────────────
    {
        key: 'hero',
        data: {
            subtitle: 'ANNUAL INTERNATIONAL CONFERENCE ON',
            title: 'CONDENSED MATTER &\nAPPLIED PHYSICS SUMMIT',
            description: 'Annual International Conference on Condensed Matter & Applied Physics Summit, where global experts unite to explore the frontiers of quantum materials, superconductivity, nanoscience, and applied physics. Discover ground-breaking research, connect with leading physicists, and explore cutting-edge discoveries transforming our understanding of matter and its applications.',
            conferenceDate: 'March 23-25, 2027',
            venue: 'Munich, Germany',
            countdownTarget: '2027-03-23T09:00:00+01:00',
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
                name: 'Prof. Klaus Müller',
                affiliation: 'Technical University of Munich, Germany',
                country: 'Germany',
                title: 'Conference Chairman',
                image: '',
            },
            {
                id: 2,
                name: 'Dr. Priya Sharma',
                affiliation: 'Indian Institute of Science (IISc), Bangalore',
                country: 'India',
                title: 'Conference Co-Chairman',
                image: '',
            },
            {
                id: 3,
                name: 'Prof. Li Wei',
                affiliation: 'Peking University, China',
                country: 'China',
                title: 'Conference Co-Chairman',
                image: '',
            },
        ],
    },

    // ── 3. About Section ─────────────────────────────────────────────────────
    {
        key: 'about',
        data: {
            subtitle: 'Welcome to Munich, Germany',
            title: 'About the Conference',
            paragraph1: 'We are thrilled to welcome you to the Annual International Conference on Condensed Matter & Applied Physics Summit 2027, scheduled to take place from March 23–25, 2027, in the vibrant city of Munich, Germany. This premier scientific gathering brings together global experts from academia, research institutions, and industry to discuss groundbreaking advancements in condensed matter physics and applied sciences.',
            paragraph2: 'Our mission is to foster a collaborative environment where researchers can share innovative findings, explore the next generation of quantum materials and devices, and discuss the practical applications of condensed matter physics. Through interdisciplinary dialogue, we aim to accelerate the transition from fundamental physics to real-world technological applications.\n\nMunich is home to world-leading research institutions including the Technical University of Munich (TUM) and Ludwig Maximilian University (LMU), making it an ideal location for this premier scientific event. The city\'s state-of-the-art conference infrastructure and rich scientific heritage provide the perfect backdrop for advancing the frontiers of condensed matter physics.',
            paragraph3: 'Join us for three immersive days of high-level plenary talks, technical sessions, poster presentations, and meaningful networking in the heart of Bavaria!',
            objectives: [
                'Accelerate Innovation: To provide a global stage for showcasing breakthrough research in condensed matter physics, quantum materials, and applied physics.',
                'Bridge Research and Industry: To facilitate knowledge transfer between fundamental physics research and real-world technological applications.',
                'Foster Collaborative Networks: To connect leading scientists with emerging researchers to build lasting international partnerships.',
                'Discuss Future Directions: To address upcoming challenges in quantum computing materials, superconductivity, and next-generation devices.',
                'Empower the Next Generation: To support students and early-career researchers through specialized workshops and poster sessions.',
            ],
            keyThemes: [
                'Condensed Matter Physics & Quantum Materials',
                'Superconductivity & Superfluidity',
                'Nanoscience & Nanotechnology',
                'Topological Materials & Phenomena',
                'Strongly Correlated Electron Systems',
                'Photonics & Optoelectronics',
                'Magnetic Materials & Spintronics',
                'Semiconductor Physics & Devices',
                'Soft Condensed Matter & Biophysics',
                'Computational & Theoretical Physics',
            ],
        },
    },

    // ── 4. Important Dates ───────────────────────────────────────────────────
    {
        key: 'importantDates',
        data: {
            dates: [
                { month: 'SEP', day: '15', year: '2026', event: 'Abstract Submission Opens',    icon: 'CalendarDays' },
                { month: 'NOV', day: '25', year: '2026', event: 'Early Bird Deadline',           icon: 'CheckCircle' },
                { month: 'JAN', day: '25', year: '2027', event: 'Final Submission Deadline',     icon: 'Clock' },
                { month: 'MAR', day: '23', year: '2027', event: 'Conference Start Date', sub: 'March 23–25, Munich, Germany', icon: 'Star' },
            ],
        },
    },

    // ── 5. Stats Section ─────────────────────────────────────────────────────
    {
        key: 'stats',
        data: {
            title: 'CONDENSED MATTER & APPLIED PHYSICS SUMMIT APPROACH',
            items: [
                { id: 1, icon: 'Calendar',      number: '15+',   label: 'Years Experience' },
                { id: 2, icon: 'CalendarCheck', number: '100+',  label: 'Events'           },
                { id: 3, icon: 'MapPin',        number: '200+',  label: 'Onsite Approach'  },
                { id: 4, icon: 'Mic',           number: '2000+', label: 'Speakers'         },
                { id: 5, icon: 'Users',         number: '5000+', label: 'Attendees'        },
                { id: 6, icon: 'Building2',     number: '20+',   label: 'Exhibitors'       },
                { id: 7, icon: 'Globe',         number: '150+',  label: 'Countries'        },
                { id: 8, icon: 'Newspaper',     number: '2000+', label: 'Publications'     },
            ],
        },
    },

    // ── 6. Contact ───────────────────────────────────────────────────────────
    {
        key: 'contact',
        data: {
            email:    'condensedphy@sciengasummits.com',
            phone:    '+91 7842090097',
            whatsapp: '+91 7842090097',
            venue:    'Munich, Germany',
        },
    },

    // ── 7. Sessions & Key Themes ─────────────────────────────────────────────
    {
        key: 'sessions',
        data: {
            sessions: [
                { title: 'Condensed Matter Physics',                    icon: 'Cpu'         },
                { title: 'Quantum Materials & Phenomena',               icon: 'Zap'         },
                { title: 'Applied Physics Research',                    icon: 'Activity'    },
                { title: 'Superconductivity & Superfluidity',           icon: 'ShieldCheck' },
                { title: 'Nanoscience & Nanotechnology',                icon: 'Microscope'  },
                { title: 'Photonics & Optoelectronics',                 icon: 'Lightbulb'   },
                { title: 'Magnetic Materials & Spintronics',            icon: 'Globe'       },
                { title: 'Surface & Interface Physics',                 icon: 'MapPin'      },
                { title: 'Strongly Correlated Systems',                 icon: 'Activity'    },
                { title: 'Computational Physics & Simulations',         icon: 'Cpu'         },
                { title: 'Semiconductor Physics & Devices',             icon: 'Zap'         },
                { title: 'Soft Condensed Matter & Biophysics',          icon: 'Activity'    },
                { title: 'Energy Materials & Devices',                  icon: 'Globe'       },
                { title: 'Topological Materials & Phenomena',           icon: 'Lightbulb'   },
                { title: 'Low-Dimensional Systems & 2D Materials',      icon: 'Cpu'         },
                { title: 'Physics of Complex Systems',                  icon: 'Zap'         },
                { title: 'Materials Characterization Techniques',       icon: 'Microscope'  },
                { title: 'Optical Properties of Solids',                icon: 'Lightbulb'   },
                { title: 'Quantum Computing Materials',                 icon: 'Cpu'         },
                { title: 'Nanoelectronics & Quantum Devices',           icon: 'Zap'         },
                { title: 'Thermoelectric & Piezoelectric Materials',    icon: 'Activity'    },
                { title: 'Disordered Systems & Glasses',                icon: 'Globe'       },
                { title: 'Physics Education & Outreach',                icon: 'Newspaper'   },
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
                    price: '$599',
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
                    price: '$699',
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
                    price: '$200',
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
            registrationStartDate:   '2026-09-15',
            earlyBirdEndDate:        '2026-11-25',
            standardEndDate:         '2027-01-25',
            onspotEndDate:           '2027-03-23',
            processingFeePercent:    5,
            accompanyingPersonPrice: 249,
            categories: [
                { id: 'speaker',  label: 'Speaker Registration',  early: 599, standard: 699, onspot: 799 },
                { id: 'delegate', label: 'Delegate Registration',  early: 699, standard: 799, onspot: 899 },
                { id: 'poster',   label: 'Poster Registration',    early: 399, standard: 499, onspot: 599 },
                { id: 'student',  label: 'Student',                early: 299, standard: 399, onspot: 499 },
                { id: 'virtual',  label: 'Virtual (Online)',        early: 200, standard: 300, onspot: 400 },
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
                            question: 'How can I register for CONDENSEDPHYSSUMMIT 2027?',
                            answer: "You can register online through our website by visiting the 'Register' page and clicking 'Online Registration'. Early bird registration is available until November 25, 2026.",
                        },
                        {
                            question: 'What are the registration categories?',
                            answer: 'We offer Speaker, Delegate, Poster, Student, and Virtual (Online) registration categories. Each comes with different benefits and pricing tiers.',
                        },
                        {
                            question: 'Is there a discount for group registrations?',
                            answer: 'Yes, we offer group discounts for groups larger than 5 attendees. Please contact condensedphy@sciengasummits.com for more details.',
                        },
                        {
                            question: 'Can I cancel my registration?',
                            answer: 'Cancellations are subject to our refund policy. Please refer to the Terms & Conditions page for detailed information.',
                        },
                        {
                            question: 'How do I apply a discount code?',
                            answer: "On the Online Registration page, enter your discount code in the 'Have a Discount Code?' section and click 'Apply Code' before completing your registration.",
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
                        {
                            question: 'What topics are covered at the conference?',
                            answer: 'The conference covers condensed matter physics, quantum materials, superconductivity, nanoscience, photonics, spintronics, topological materials, semiconductor physics, and many more applied physics topics.',
                        },
                    ],
                },
                {
                    id: 'cat_venue',
                    category: 'Venue & Accommodation',
                    items: [
                        {
                            question: 'Where is the conference taking place?',
                            answer: 'The conference will be held in Munich, Germany. Detailed venue information is available on the Venue page.',
                        },
                        {
                            question: 'Are there recommended hotels nearby?',
                            answer: 'Yes, we have partnered with several hotels near the venue to offer discounted rates for attendees. Accommodation packages can be added during registration.',
                        },
                    ],
                },
                {
                    id: 'cat_visa',
                    category: 'Visa & Travel',
                    items: [
                        {
                            question: 'Do I need a visa to attend?',
                            answer: 'Visa requirements depend on your nationality. We can provide an invitation letter upon successful registration. Contact condensedphy@sciengasummits.com.',
                        },
                        {
                            question: 'How do I get an invitation letter?',
                            answer: 'After completing your registration and payment, contact us at condensedphy@sciengasummits.com with your registration ID to request an official invitation letter.',
                        },
                    ],
                },
                {
                    id: 'cat_payment',
                    category: 'Payment',
                    items: [
                        {
                            question: 'What payment methods are accepted?',
                            answer: 'We accept all major credit/debit cards and net banking through our secure Razorpay payment gateway.',
                        },
                        {
                            question: 'Is my payment information secure?',
                            answer: 'Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. Your financial information is never stored on our servers.',
                        },
                        {
                            question: 'Will I receive a receipt after payment?',
                            answer: 'Yes, a confirmation email with your registration details will be sent to your registered email address after successful payment.',
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
                'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1920&q=80',
                'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=80',
                'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=80',
            ],
            title: 'Munich, Germany',
            description: 'Munich, the capital of Bavaria, is a world-class hub for science and technology, home to the Technical University of Munich (TUM) and Ludwig Maximilian University (LMU). The city offers state-of-the-art conference facilities and a rich cultural heritage.',
        },
    },

    // ── 12. Brochure ──────────────────────────────────────────────────────────
    {
        key: 'brochure',
        data: {
            pdfUrl: '',
            title: 'Annual International Conference on Condensed Matter & Applied Physics Summit 2027',
            note: '* Format: PDF • Updated: 2026',
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

    // ── 15. Visa Info ─────────────────────────────────────────────────────────
    {
        key: 'visa-info',
        data: {
            title: 'Visa Information',
            intro: 'Participants from countries requiring a visa to enter Germany should apply well in advance. We are happy to provide an official invitation letter to support your visa application.',
            steps: [
                'Complete your conference registration and payment.',
                'Email condensedphy@sciengasummits.com with your registration ID and passport details.',
                'We will issue an official invitation letter within 3–5 business days.',
                'Submit the invitation letter along with your visa application to the German embassy/consulate in your country.',
            ],
            note: 'Please apply for your visa at least 6–8 weeks before the conference date. The organizing committee cannot be held responsible for visa rejections.',
            contactEmail: 'condensedphy@sciengasummits.com',
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
