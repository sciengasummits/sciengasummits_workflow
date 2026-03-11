'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    Home,
    Calendar,
    Tag,
    Users,
    Mic,
    GraduationCap,
    Presentation,
    Upload,
    ClipboardList,
    Briefcase,
    Radio,
    Mailbox,
    MapPin,
    Building,
    BedDouble,
    Image as ImageIcon,
    FileEdit,
    Clipboard,
    FileText,
    Link,
    Ban,
    FileDown,
    CreditCard,
    Receipt,
    ScrollText,
    RefreshCw,
    BarChart2,
    CheckCircle,
    ChevronRight,
    Globe,
    MonitorPlay,
    BookOpen,
    GalleryHorizontalEnd,
    BadgeDollarSign,
    Handshake,
    ListChecks,
    CalendarRange,
    Mail,
    Phone,
    MessageCircle,
    DollarSign,
    MoreHorizontal,
    Plane,
    HelpCircle
} from 'lucide-react';

const iconSize = 20;
const childIconSize = 16;

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
    {
        id: 'contact-info', label: 'Contact Info', icon: <Phone size={iconSize} />,
        children: [
            { id: 'contact-email', label: 'Send Email', icon: <Mail size={childIconSize} /> },
            { id: 'contact-phone', label: 'Call Us Now', icon: <Phone size={childIconSize} /> },
            { id: 'contact-whatsapp', label: 'WhatsApp', icon: <MessageCircle size={childIconSize} /> },
        ]
    },
    {
        id: 'homepage', label: 'Home Page', icon: <Home size={iconSize} />,
        children: [
            { id: 'ws-hero', label: 'Hero Section', icon: <MonitorPlay size={childIconSize} /> },
            { id: 'ws-about', label: 'About Section', icon: <BookOpen size={childIconSize} /> },
            { id: 'important-dates', label: 'Important Dates', icon: <Calendar size={childIconSize} /> },
            { id: 'ws-marquee', label: 'Marquee', icon: <GalleryHorizontalEnd size={childIconSize} /> },
            { id: 'ws-pricing', label: 'Registration Pricing', icon: <BadgeDollarSign size={childIconSize} /> },
            { id: 'ws-partners', label: 'Promoting & Media Partners', icon: <Handshake size={childIconSize} /> },
        ]
    },
    {
        id: 'sessions-group', label: 'Sessions', icon: <ListChecks size={iconSize} />,
        children: [
            { id: 'sessions', label: 'Sessions', icon: <ListChecks size={childIconSize} /> },
            { id: 'conference-schedule', label: 'Conference Schedule', icon: <CalendarRange size={childIconSize} /> },
        ]
    },
    { id: 'metatags', label: 'Meta Tags', icon: <Tag size={iconSize} /> },
    { id: 'committee', label: 'Organizing Committee', icon: <Users size={iconSize} /> },
    {
        id: 'speakers', label: 'Speakers', icon: <Mic size={iconSize} />,
        children: [
            { id: 'committee-speakers', label: 'Committee Speakers', icon: <Users size={childIconSize} /> },
            { id: 'speakers-list', label: 'Speakers', icon: <Mic size={childIconSize} /> },
            { id: 'keynote-speakers', label: 'Keynote Speakers', icon: <BookOpen size={childIconSize} /> },
            { id: 'plenary-speakers', label: 'Plenary Speakers', icon: <GalleryHorizontalEnd size={childIconSize} /> },
            { id: 'posters-speakers', label: 'Posters Speakers', icon: <Presentation size={childIconSize} /> },
            { id: 'students-speakers', label: 'Students Speakers', icon: <GraduationCap size={childIconSize} /> },
            { id: 'delegates-speakers', label: 'Delegates Speakers', icon: <Briefcase size={childIconSize} /> },
        ]
    },
    { id: 'uploadpdf', label: 'Upload PDFs', icon: <Upload size={iconSize} /> },
    { id: 'dailyupdate', label: 'Daily Update', icon: <ClipboardList size={iconSize} /> },
    {
        id: 'partners', label: 'Partners', icon: <Briefcase size={iconSize} />,
        children: [
            { id: 'sponsors', label: 'Sponsors', icon: <Briefcase size={childIconSize} /> },
            { id: 'mediapartners', label: 'Media Partners', icon: <Radio size={childIconSize} /> },
        ]
    },
    { id: 'mailbox', label: 'Mail Box', icon: <Mailbox size={iconSize} /> },
    {
        id: 'location', label: 'Location', icon: <MapPin size={iconSize} />,
        children: [
            { id: 'venue-hospitality', label: 'Venue Hospitality', icon: <Building size={childIconSize} /> },
            { id: 'accommodation', label: 'Accommodation', icon: <BedDouble size={childIconSize} /> },
        ]
    },
    {
        id: 'glimpses', label: 'Previous Glimpses', icon: <ImageIcon size={iconSize} />,
        children: [
            { id: 'prev-glimpses', label: 'Previous Glimpses', icon: <ImageIcon size={childIconSize} /> },
        ]
    },
    {
        id: 'registrations', label: 'Registrations & Abstracts', icon: <FileEdit size={iconSize} />,
        children: [
            { id: 'view-registrations', label: 'View Registrations', icon: <Clipboard size={childIconSize} /> },
            { id: 'view-abstracts', label: 'View Abstracts', icon: <FileText size={childIconSize} /> },
            { id: 'registration-prices', label: 'Registration Prices', icon: <DollarSign size={childIconSize} /> },
            { id: 'payment-link', label: 'Generate Payment Link', icon: <Link size={childIconSize} /> },
            { id: 'export-conf-unsubscribes', label: 'Export Conference Unsubscribes', icon: <Ban size={childIconSize} /> },
            { id: 'export-unsubscribes', label: 'Export Global Unsubscribes', icon: <FileDown size={childIconSize} /> },
        ]
    },
    { id: 'discount', label: 'Discount', icon: <CreditCard size={iconSize} /> },
    { id: 'invoices', label: 'Invoices', icon: <Receipt size={iconSize} /> },
    { id: 'receipts', label: 'Receipts', icon: <ScrollText size={iconSize} /> },
    {
        id: 'workupdates', label: 'Work Updates', icon: <RefreshCw size={iconSize} />,
        children: [
            { id: 'work-reports', label: 'Work Reports', icon: <BarChart2 size={childIconSize} /> },
            { id: 'positives', label: 'Positives', icon: <CheckCircle size={childIconSize} /> },
        ]
    },
    { id: 'website-sections', label: 'Website Sections', icon: <Globe size={iconSize} /> },
    {
        id: 'more', label: 'More', icon: <MoreHorizontal size={iconSize} />,
        children: [
            { id: 'visa-info', label: 'Visa Info', icon: <Plane size={childIconSize} /> },
            { id: 'faq', label: 'FAQ', icon: <HelpCircle size={childIconSize} /> },
        ]
    },
];

export default function Sidebar({ collapsed, activeNav, onNavClick, conf }) {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (id) => {
        setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">{conf ? conf.logoText : 'LV'}<br />{conf ? conf.logoSub : 'Summit'}</div>
                <div className="logo-text">
                    <span className="brand" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{conf ? conf.brandTop : 'LIUTEX'}</span>
                    <span className="sub">{conf ? conf.brandSub : 'VORTEX SUMMIT'}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                    <div className="nav-item" key={item.id}>
                        <div
                            className={`nav-link${activeNav === item.id ? ' active' : ''}${item.children && openMenus[item.id] ? ' open' : ''}`}
                            onClick={() => {
                                if (item.children) {
                                    toggleMenu(item.id);
                                } else {
                                    onNavClick(item.id);
                                }
                            }}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {item.children && <span className="chevron"><ChevronRight size={14} /></span>}
                        </div>

                        {item.children && (
                            <div className={`submenu${openMenus[item.id] && !collapsed ? ' open' : ''}`}>
                                {item.children.map(child => (
                                    <div
                                        key={child.id}
                                        className={`nav-link${activeNav === child.id ? ' active' : ''}`}
                                        onClick={() => onNavClick(child.id)}
                                    >
                                        <span className="nav-icon">{child.icon}</span>
                                        <span className="nav-label">{child.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
