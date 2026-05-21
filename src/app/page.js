'use client';

import { useState, useEffect } from 'react';
import Login from '@/components/dashboard/Login';
import { Info } from 'lucide-react';
import { setConference, setAuthToken, clearAuth } from '@/lib/api';
import { CONFERENCE_CONFIG } from '@/lib/conferences';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ImportantDates from '@/components/dashboard/pages/ImportantDates';

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
import Collaborations from '@/components/dashboard/pages/Collaborations';
import Universities from '@/components/dashboard/pages/Universities';
import VenueHospitality from '@/components/dashboard/pages/VenueHospitality';
import Accommodation from '@/components/dashboard/pages/Accommodation';
import PreviousGlimpses from '@/components/dashboard/pages/PreviousGlimpses';
import ViewRegistrations from '@/components/dashboard/pages/ViewRegistrations';
import ViewAbstracts from '@/components/dashboard/pages/ViewAbstracts';
import GeneratePaymentLink from '@/components/dashboard/pages/GeneratePaymentLink';
import Discount from '@/components/dashboard/pages/Discount';
import Invoices from '@/components/dashboard/pages/Invoices';
import Receipts from '@/components/dashboard/pages/Receipts';
import WebsiteSections from '@/components/dashboard/pages/WebsiteSections';

import Sessions from '@/components/dashboard/pages/Sessions';
import ConferenceSchedule from '@/components/dashboard/pages/ConferenceSchedule';
import ContactSettings from '@/components/dashboard/pages/ContactSettings';
import RegistrationPrices from '@/components/dashboard/pages/RegistrationPrices';
import VisaInfo from '@/components/dashboard/pages/VisaInfo';
import FAQManager from '@/components/dashboard/pages/FAQManager';
import HeroChairs from '@/components/dashboard/pages/HeroChairs';
import BrochureDashboard from '@/components/dashboard/pages/Brochure';


/* Ã¢â€ â‚¬Ã¢â€ â‚¬ Simple page router Ã¢â€ â‚¬Ã¢â€ â‚¬ */
function PageContent({ activeNav, setActiveNav, conf }) {
  switch (activeNav) {

    case 'committee-speakers': return <CommitteeSpeakers conf={conf} />;
    case 'speakers-list': return <Speakers conf={conf} />;
    case 'keynote-speakers': return <KeynoteSpeakers conf={conf} />;
    case 'plenary-speakers': return <PlenarySpeakers conf={conf} />;
    case 'posters-speakers': return <PostersSpeakers conf={conf} />;
    case 'students-speakers': return <StudentsSpeakers conf={conf} />;
    case 'delegates-speakers': return <DelegatesSpeakers conf={conf} />;
    case 'important-dates': return <ImportantDates conf={conf} />;
    case 'sessions': return <Sessions conf={conf} />;
    case 'conference-schedule': return <ConferenceSchedule conf={conf} />;
    case 'metatags': return <MetaTags conf={conf} />;
    case 'uploadpdf': return <UploadPdfs conf={conf} />;
    case 'dailyupdate': return <DailyUpdate conf={conf} />;
    case 'sponsors': return <Sponsors conf={conf} />;
    case 'mediapartners': return <MediaPartners conf={conf} />;
    case 'ws-collaborations': return <Collaborations conf={conf} />;
    case 'venue-hospitality': return <VenueHospitality conf={conf} />;
    case 'accommodation': return <Accommodation conf={conf} />;
    case 'prev-glimpses': return <PreviousGlimpses conf={conf} />;
    case 'view-registrations': return <ViewRegistrations conf={conf} />;
    case 'view-abstracts': return <ViewAbstracts conf={conf} />;
    case 'payment-link': return <GeneratePaymentLink conf={conf} />;
    case 'discount': return <Discount conf={conf} />;
    case 'invoices': return <Invoices conf={conf} />;
    case 'receipts': return <Receipts conf={conf} />;
    case 'registration-prices': return <RegistrationPrices conf={conf} />;

    case 'ws-hero': return <WebsiteSections section="hero" conf={conf} />;
    case 'ws-hero-chairs': return <HeroChairs conf={conf} />;
    case 'ws-about': return <WebsiteSections section="about" conf={conf} />;
    case 'ws-marquee': return <Universities conf={conf} />;
    case 'ws-pricing': return <WebsiteSections section="pricing" conf={conf} />;
    case 'ws-partners': return <MediaPartners conf={conf} />;
    case 'visa-info': return <VisaInfo conf={conf} />;
    case 'faq': return <FAQManager conf={conf} />;
    case 'venue': return <VenueHospitality conf={conf} />;
    case 'brochure': return <BrochureDashboard conf={conf} />;

    case 'abstracts': return <ViewAbstracts conf={conf} />;
    case 'registrations': return <ViewRegistrations conf={conf} />;
    case 'scientific': return <Sessions conf={conf} />;
    case 'plenary': return <PlenarySpeakers conf={conf} />;
    case 'keynote': return <KeynoteSpeakers conf={conf} />;
    case 'featured': return <FeaturedSpeakers conf={conf} />;
    case 'invited': return <InvitedSpeakers conf={conf} />;
    case 'poster': return <PostersSpeakers conf={conf} />;
    case 'student': return <StudentsSpeakers conf={conf} />;
    case 'delegate': return <DelegatesSpeakers conf={conf} />;
    case 'tracks': return <Sessions conf={conf} />;

    case 'contact-email': return <ContactSettings type="email" conf={conf} />;
    case 'contact-phone': return <ContactSettings type="phone" conf={conf} />;
    case 'contact-whatsapp': return <ContactSettings type="whatsapp" conf={conf} />;

    default:
      return (
        <>
          <StatsGrid onCardClick={(id) => setActiveNav(id)} conf={conf} />
          <div className="note-banner">
            <span className="note-icon">Ã°Å¸â€œÅ’</span>
            <p>
              <strong>Note:</strong>
              {' Session will be Logged out automatically after '}
              <strong>1 hour</strong>
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

  const conf = session ? (CONFERENCE_CONFIG[session.conferenceId?.toLowerCase()] || CONFERENCE_CONFIG.liutex) : null;

  useEffect(() => {
    // 1. Session Restoration with Expiry Check (1 Hour TTL)
    const saved = localStorage.getItem('session');
    if (saved) {
      try {
        const info = JSON.parse(saved);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        // If session is older than 1 hour, clear it
        if (!info.timestamp || (now - info.timestamp) > oneHour) {
          localStorage.removeItem('session');
          setSession(null);
        } else {
          // Valid session, restore it
          setConference(info.conferenceId);
          setSession(info);
          // Refresh the timestamp to keep it alive
          const updated = { ...info, timestamp: now };
          localStorage.setItem('session', JSON.stringify(updated));
        }
      } catch (e) {
        localStorage.removeItem('session');
      }
    }

    // Listen for nav events
    const handler = (e) => setActiveNav(e.detail);
    window.addEventListener('nav-to', handler);

    // Listen for server-side session expiry
    const sessionExpiredHandler = () => {
      clearAuth();
      setSession(null);
      setActiveNav('dashboard');
    };
    window.addEventListener('session-expired', sessionExpiredHandler);

    return () => {
      window.removeEventListener('nav-to', handler);
      window.removeEventListener('session-expired', sessionExpiredHandler);
    };
  }, []);

  // Update "last active" timestamp on navigation to prevent premature logout
  useEffect(() => {
    if (session) {
      const updated = { ...session, timestamp: Date.now() };
      localStorage.setItem('session', JSON.stringify(updated));
    }
  }, [activeNav, session]);

  useEffect(() => {
    if (conf) {
      document.documentElement.style.setProperty('--accent', conf.accentColor);
      document.documentElement.style.setProperty('--accent-glow', conf.accentGlow);
    }
  }, [conf]);

  const handleLogout = () => {
    clearAuth();
    setSession(null);
    setActiveNav('dashboard');
  };

  if (!session) {
    return (
      <Login
        onLogin={(info) => {
          const sessionWithTime = {
            ...info,
            timestamp: Date.now()
          };
          localStorage.setItem('session', JSON.stringify(sessionWithTime));
          setConference(info.conferenceId);
          // Store JWT token for server-side authentication
          if (info.token) {
            setAuthToken(info.token);
          }
          setSession(sessionWithTime);
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
        onLogout={handleLogout}
      />
      <div className="main-wrapper">
        <Topbar
          onToggleSidebar={() => setCollapsed(c => !c)}
          eventName={conf.displayName}
          username={session.username}
          onLogout={handleLogout}
          conf={conf}
        />
        <main className="page-content">
          <PageContent
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            conf={conf}
          />
        </main>
        <footer className="page-footer">
          <span>{conf.footerText}</span>
        </footer>
      </div>
    </div>
  );
}

