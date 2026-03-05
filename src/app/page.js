'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/dashboard/Login';
import { Info } from 'lucide-react';
import { setConference } from '@/lib/api';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ImportantDates from '@/components/dashboard/pages/ImportantDates';
import OrganizingCommittee from '@/components/dashboard/pages/OrganizingCommittee';
import CommitteeSpeakers from '@/components/dashboard/pages/CommitteeSpeakers';
import Speakers from '@/components/dashboard/pages/Speakers';
import PostersSpeakers from '@/components/dashboard/pages/PostersSpeakers';
import StudentsSpeakers from '@/components/dashboard/pages/StudentsSpeakers';
import DelegatesSpeakers from '@/components/dashboard/pages/DelegatesSpeakers';
import PlenarySpeakers from '@/components/dashboard/pages/PlenarySpeakers';
import KeynoteSpeakers from '@/components/dashboard/pages/KeynoteSpeakers';
import FeaturedSpeakers from '@/components/dashboard/pages/FeaturedSpeakers';
import InvitedSpeakers from '@/components/dashboard/pages/InvitedSpeakers';
import MetaTags from '@/components/dashboard/pages/MetaTags';
import UploadPdfs from '@/components/dashboard/pages/UploadPdfs';
import DailyUpdate from '@/components/dashboard/pages/DailyUpdate';
import Sponsors from '@/components/dashboard/pages/Sponsors';
import MediaPartners from '@/components/dashboard/pages/MediaPartners';
import VenueHospitality from '@/components/dashboard/pages/VenueHospitality';
import Accommodation from '@/components/dashboard/pages/Accommodation';
import PreviousGlimpses from '@/components/dashboard/pages/PreviousGlimpses';
import ViewRegistrations from '@/components/dashboard/pages/ViewRegistrations';
import ViewAbstracts from '@/components/dashboard/pages/ViewAbstracts';
import GeneratePaymentLink from '@/components/dashboard/pages/GeneratePaymentLink';
import Discount from '@/components/dashboard/pages/Discount';
import Invoices from '@/components/dashboard/pages/Invoices';
import Receipts from '@/components/dashboard/pages/Receipts';
import WorkReports from '@/components/dashboard/pages/WorkReports';
import Positives from '@/components/dashboard/pages/Positives';
import WebsiteSections from '@/components/dashboard/pages/WebsiteSections';
import Sessions from '@/components/dashboard/pages/Sessions';
import ConferenceSchedule from '@/components/dashboard/pages/ConferenceSchedule';

/* ── Conference config map ── */
const CONFERENCE_CONFIG = {
  liutex: {
    conferenceId: 'liutex',
    displayName: 'LIUTEX VORTEX SUMMIT 2026',
    shortName: 'LIUTEX SUMMIT',
    logoText: 'LV',
    logoSub: 'Summit',
    brandTop: 'LIUTEX',
    brandSub: 'VORTEX SUMMIT',
    footerText: '© Copyright 2026 LIUTEX SUMMIT.',
    accentColor: '#6366f1',
    accentGlow: 'rgba(99,102,241,0.35)',
  },
  foodagri: {
    conferenceId: 'foodagri',
    displayName: 'FOOD AGRI SUMMIT 2026',
    shortName: 'FOOD AGRI SUMMIT',
    logoText: 'FA',
    logoSub: 'Summit',
    brandTop: 'FOOD AGRI',
    brandSub: 'SUMMIT 2026',
    footerText: '© Copyright 2026 FOOD AGRI SUMMIT.',
    accentColor: '#16a34a',
    accentGlow: 'rgba(22,163,74,0.35)',
  },
  fluid: {
    conferenceId: 'fluid',
    displayName: 'FLUID MECHANICS & TURBOMACHINERY 2026',
    shortName: 'FLUID SUMMIT',
    logoText: 'FM',
    logoSub: 'Summit',
    brandTop: 'FLUID MECHANICS',
    brandSub: '& TURBOMACHINERY',
    footerText: '© Copyright 2026 FLUID MECHANICS & TURBOMACHINERY SUMMIT.',
    accentColor: '#0891b2',
    accentGlow: 'rgba(8,145,178,0.35)',
  },
  renewable: {
    conferenceId: 'renewable',
    displayName: 'RENEWABLE ENERGY & CLIMATE CHANGE 2026',
    shortName: 'RENEWABLE CLI SUMMIT',
    logoText: 'RE',
    logoSub: 'Summit',
    brandTop: 'RENEWABLE ENERGY',
    brandSub: '& CLIMATE CHANGE',
    footerText: '© Copyright 2026 RENEWABLE ENERGY & CLIMATE CHANGE SUMMIT.',
    accentColor: '#16a34a',
    accentGlow: 'rgba(22,163,74,0.35)',
  },
};

/* ── Simple page router ── */
function PageContent({ activeNav, setActiveNav }) {
  switch (activeNav) {
    case 'committee': return <OrganizingCommittee />;
    case 'committee-speakers': return <CommitteeSpeakers />;
    case 'speakers-list': return <Speakers />;
    case 'keynote-speakers': return <KeynoteSpeakers />;
    case 'plenary-speakers': return <PlenarySpeakers />;
    case 'posters-speakers': return <PostersSpeakers />;
    case 'students-speakers': return <StudentsSpeakers />;
    case 'delegates-speakers': return <DelegatesSpeakers />;
    case 'important-dates': return <ImportantDates />;
    case 'sessions': return <Sessions />;
    case 'conference-schedule': return <ConferenceSchedule />;
    case 'metatags': return <MetaTags />;
    case 'uploadpdf': return <UploadPdfs />;
    case 'dailyupdate': return <DailyUpdate />;
    case 'sponsors': return <Sponsors />;
    case 'mediapartners': return <MediaPartners />;
    case 'venue-hospitality': return <VenueHospitality />;
    case 'accommodation': return <Accommodation />;
    case 'prev-glimpses': return <PreviousGlimpses />;
    case 'view-registrations': return <ViewRegistrations />;
    case 'view-abstracts': return <ViewAbstracts />;
    case 'payment-link': return <GeneratePaymentLink />;
    case 'discount': return <Discount />;
    case 'invoices': return <Invoices />;
    case 'receipts': return <Receipts />;
    case 'work-reports': return <WorkReports />;
    case 'positives': return <Positives />;
    case 'website-sections': return <WebsiteSections />;
    case 'ws-hero': return <WebsiteSections section="hero" />;
    case 'ws-about': return <WebsiteSections section="about" />;
    case 'ws-marquee': return <WebsiteSections section="marquee" />;
    case 'ws-pricing': return <WebsiteSections section="pricing" />;
    case 'ws-partners': return <WebsiteSections section="partners" />;

    case 'abstracts': return <ViewAbstracts />;
    case 'registrations': return <ViewRegistrations />;
    case 'scientific': return <Sessions />;
    case 'plenary': return <PlenarySpeakers />;
    case 'keynote': return <KeynoteSpeakers />;
    case 'featured': return <FeaturedSpeakers />;
    case 'invited': return <InvitedSpeakers />;
    case 'poster': return <PostersSpeakers />;
    case 'student': return <StudentsSpeakers />;
    case 'delegate': return <DelegatesSpeakers />;
    case 'tracks': return <Sessions />;

    default:
      return (
        <>
          <StatsGrid onCardClick={(id) => setActiveNav(id)} />
          <div className="note-banner">
            <Info size={20} className="note-icon" />
            <p>
              <strong>Note:</strong>
              {' Session will be Logged out automatically after '}
              <strong>30 minutes</strong>
              {' of inactivity'}
            </p>
          </div>
        </>
      );
  }
}

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [session, setSession] = useState(null);

  const conf = session ? (CONFERENCE_CONFIG[session.conferenceId] || CONFERENCE_CONFIG.liutex) : null;

  useEffect(() => {
    const handler = (e) => setActiveNav(e.detail);
    window.addEventListener('nav-to', handler);
    return () => window.removeEventListener('nav-to', handler);
  }, []);

  useEffect(() => {
    if (conf) {
      document.documentElement.style.setProperty('--accent', conf.accentColor);
      document.documentElement.style.setProperty('--accent-glow', conf.accentGlow);
    }
  }, [conf]);

  if (!session) {
    return (
      <Login
        onLogin={(info) => {
          setConference(info.conferenceId);
          setSession(info);
          setActiveNav('dashboard');
        }}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        activeNav={activeNav}
        onNavClick={setActiveNav}
        conf={conf}
      />
      <div className="main-wrapper">
        <Topbar
          onToggleSidebar={() => setCollapsed(c => !c)}
          eventName={conf.displayName}
          username={session.username}
          onLogout={() => { setSession(null); setActiveNav('dashboard'); }}
          conf={conf}
        />
        <main className="page-content">
          <PageContent activeNav={activeNav} setActiveNav={setActiveNav} />
        </main>
        <footer className="page-footer">
          <span>{conf.footerText}</span>
        </footer>
      </div>
    </div>
  );
}
