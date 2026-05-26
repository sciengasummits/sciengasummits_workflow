'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Pen,
    Inbox,
    Star,
    Send,
    File,
    Trash2,
    Bookmark,
    ChevronDown,
    ChevronUp,
    Search,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    Mail,
    MailOpen,
    MoreVertical,
    CornerUpLeft,
    AlertCircle,
    ArrowLeft,
    Check,
    CheckSquare,
    Square,
    Minus,
    Maximize2,
    Minimize2
} from 'lucide-react';
import {
    getEmails,
    sendComposeEmail,
    saveDraftEmail,
    deleteEmails,
    toggleStarEmail,
    markEmailsRead
} from '@/lib/api';

export default function MailBox({ conf }) {
    // Active mailbox folder folder: 'inbox', 'starred', 'sent', 'drafts', 'all', 'bin'
    const [selectedFolder, setSelectedFolder] = useState('inbox');
    const [emails, setEmails] = useState([]);
    const [counts, setCounts] = useState({ inbox: 0, drafts: 0, starred: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInputValue, setSearchInputValue] = useState('');
    
    // Selection state
    const [selectedEmailIds, setSelectedEmailIds] = useState([]);
    
    // Detail view state
    const [openedEmail, setOpenedEmail] = useState(null);
    
    // Sidebar fold state
    const [showMoreFolders, setShowMoreFolders] = useState(false);
    
    // Floating Compose state
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isComposeMinimized, setIsComposeMinimized] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [composeDraftId, setComposeDraftId] = useState(null);
    const [composeStatus, setComposeStatus] = useState(''); // 'Saving...', 'Draft saved', 'Sending...', 'Error'
    
    // Accent color from active conference theme
    const accentColor = conf?.accentColor || '#1a73e8';

    // ── FETCH EMAILS ───────────────────────────────────────────
    const fetchEmails = async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const res = await getEmails(selectedFolder, refresh);
            if (res.success) {
                setEmails(res.emails || []);
                if (res.counts) {
                    setCounts(res.counts);
                }
            } else {
                setError(res.error || 'Failed to retrieve emails');
            }
        } catch (err) {
            setError(err.message || 'Error occurred while loading mailbox');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Refetch when folder changes
    useEffect(() => {
        setOpenedEmail(null);
        setSelectedEmailIds([]);
        fetchEmails(false);
    }, [selectedFolder]);

    // ── DEBOUNCED DRAFT AUTO-SAVE ──────────────────────────────
    useEffect(() => {
        if (!isComposeOpen || !isComposeOpen) return;
        
        // Don't auto-save if all fields are empty
        if (!composeTo.trim() && !composeSubject.trim() && !composeBody.trim()) {
            setComposeStatus('');
            return;
        }

        setComposeStatus('Saving...');
        const delayTimer = setTimeout(async () => {
            try {
                const res = await saveDraftEmail(composeTo, composeSubject, composeBody, composeDraftId);
                if (res.success && res.draftId) {
                    setComposeDraftId(res.draftId);
                    setComposeStatus('Draft saved');
                } else {
                    setComposeStatus('Error auto-saving');
                }
            } catch (err) {
                setComposeStatus('Error auto-saving');
            }
        }, 1500);

        return () => clearTimeout(delayTimer);
    }, [composeTo, composeSubject, composeBody, isComposeOpen]);

    // ── SEARCH FILTER ──────────────────────────────────────────
    const filteredEmails = useMemo(() => {
        if (!searchQuery.trim()) return emails;
        const q = searchQuery.toLowerCase();
        return emails.filter(e => 
            (e.from || '').toLowerCase().includes(q) ||
            (e.to || '').toLowerCase().includes(q) ||
            (e.subject || '').toLowerCase().includes(q) ||
            (e.body || '').toLowerCase().includes(q)
        );
    }, [emails, searchQuery]);

    // ── ACTION HANDLERS ────────────────────────────────────────
    const handleStarToggle = async (e, email) => {
        e.stopPropagation();
        const targetState = !email.isImportant;
        
        // Optimistic UI update
        setEmails(prev => prev.map(item => 
            item._id === email._id ? { ...item, isImportant: targetState } : item
        ));
        
        try {
            await toggleStarEmail(email._id, targetState);
            // Refresh counts in case we starred in a different view
            fetchEmails(false);
        } catch (err) {
            console.error('Failed to star email:', err);
        }
    };

    const handleMarkReadToggle = async (e, emailIds, targetRead) => {
        if (e) e.stopPropagation();
        
        // Optimistic UI update
        setEmails(prev => prev.map(item => 
            emailIds.includes(item._id) ? { ...item, isRead: targetRead } : item
        ));
        if (openedEmail && emailIds.includes(openedEmail._id)) {
            setOpenedEmail(prev => ({ ...prev, isRead: targetRead }));
        }

        try {
            await markEmailsRead(emailIds, targetRead);
            fetchEmails(false);
        } catch (err) {
            console.error('Failed to mark emails:', err);
        }
    };

    const handleDeleteEmails = async (e, emailIds) => {
        if (e) e.stopPropagation();
        setLoading(true);
        try {
            const res = await deleteEmails(emailIds);
            if (res.success) {
                setSelectedEmailIds([]);
                setOpenedEmail(null);
                fetchEmails(false);
            }
        } catch (err) {
            console.error('Failed to delete emails:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAllToggle = () => {
        if (selectedEmailIds.length === filteredEmails.length) {
            setSelectedEmailIds([]);
        } else {
            setSelectedEmailIds(filteredEmails.map(e => e._id));
        }
    };

    const handleSelectRow = (e, emailId) => {
        e.stopPropagation();
        setSelectedEmailIds(prev => 
            prev.includes(emailId) ? prev.filter(id => id !== emailId) : [...prev, emailId]
        );
    };

    const handleRowClick = async (email) => {
        setOpenedEmail(email);
        if (!email.isRead) {
            handleMarkReadToggle(null, [email._id], true);
        }
    };

    // ── COMPOSE ACTIONS ────────────────────────────────────────
    const openNewCompose = () => {
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeDraftId(null);
        setComposeStatus('');
        setIsComposeOpen(true);
        setIsComposeMinimized(false);
    };

    const openDraftCompose = (email) => {
        setComposeTo(email.to || '');
        setComposeSubject(email.subject || '');
        setComposeBody(email.body || '');
        setComposeDraftId(email._id);
        setComposeStatus('Draft loaded');
        setIsComposeOpen(true);
        setIsComposeMinimized(false);
    };

    const handleSendCompose = async () => {
        if (!composeTo.trim()) {
            alert('Please specify a recipient email address.');
            return;
        }
        setComposeStatus('Sending...');
        try {
            const res = await sendComposeEmail(composeTo, composeSubject, composeBody, composeDraftId);
            if (res.success) {
                setIsComposeOpen(false);
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                setComposeDraftId(null);
                setComposeStatus('');
                fetchEmails(false);
            } else {
                setComposeStatus('Error sending email');
                alert(res.error || 'Failed to send email.');
            }
        } catch (err) {
            setComposeStatus('Error sending email');
            alert(err.message || 'Error occurred while sending.');
        }
    };

    const handleDiscardCompose = async () => {
        if (composeDraftId) {
            await deleteEmails([composeDraftId]);
        }
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposeDraftId(null);
        setComposeStatus('');
        fetchEmails(false);
    };

    // ── UTILITIES ──────────────────────────────────────────────
    const getAvatarColor = (name) => {
        if (!name) return '#e0f2fe';
        const colors = [
            'linear-gradient(135deg, #f87171, #ef4444)', // Red
            'linear-gradient(135deg, #fb923c, #f97316)', // Orange
            'linear-gradient(135deg, #fbbf24, #f59e0b)', // Amber
            'linear-gradient(135deg, #34d399, #10b981)', // Emerald
            'linear-gradient(135deg, #60a5fa, #3b82f6)', // Blue
            'linear-gradient(135deg, #818cf8, #6366f1)', // Indigo
            'linear-gradient(135deg, #a78bfa, #8b5cf6)', // Violet
            'linear-gradient(135deg, #f472b6, #ec4899)', // Pink
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getSenderDisplayName = (fromStr) => {
        if (!fromStr) return 'Unknown';
        const match = fromStr.match(/^"([^"]+)"|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
        if (match) return match[1] || match[2];
        return fromStr.split('<')[0].trim() || fromStr;
    };

    const formatDateShort = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    const formatDateLong = (dateInput) => {
        if (!dateInput) return '';
        const d = new Date(dateInput);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) + 
               ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const stripHtmlSnippet = (html) => {
        if (!html) return '';
        const text = html.replace(/<[^>]*>/g, ' ');
        return text.replace(/\s+/g, ' ').trim().slice(0, 75);
    };

    return (
        <div className="mailbox-app-container">
            {/* Embedded styles for pixel-perfect modern Gmail design */}
            <style>{`
                .mailbox-fullscreen {
                    padding: 0 !important;
                    margin: 0 !important;
                    background: #f8fafd !important;
                    height: 100% !important;
                    overflow: hidden !important;
                }
                .mailbox-app-container {
                    display: flex;
                    flex-direction: column;
                    background: #f8fafd;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    border-radius: 0;
                    border: none;
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }
                .mailbox-top-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 24px;
                    background: #f8fafd;
                    border-bottom: 1px solid #e0e8f5;
                }
                .mailbox-search-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                .mailbox-search-input {
                    width: 100%;
                    padding: 9px 16px 9px 44px;
                    border-radius: 24px;
                    border: none;
                    background: #eaf1fb;
                    font-size: 14px;
                    color: #1f1f1f;
                    outline: none;
                    transition: background 0.15s, box-shadow 0.15s;
                }
                .mailbox-search-input:focus {
                    background: #fff;
                    box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
                }
                .mailbox-search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #444746;
                }
                .mailbox-search-clear {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #444746;
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                }
                .mailbox-search-clear:hover {
                    background: rgba(0,0,0,0.06);
                }
                .mailbox-main-layout {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                .mailbox-sidebar {
                    width: 256px;
                    padding: 16px 8px 16px 16px;
                    background: #f8fafd;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    flex-shrink: 0;
                    border-right: 1px solid #e0e8f5;
                }
                .mailbox-compose-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border-radius: 16px;
                    background: #c2e7ff;
                    color: #001d35;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
                    transition: box-shadow 0.2s, background 0.2s;
                    align-self: flex-start;
                    margin-bottom: 8px;
                }
                .mailbox-compose-btn:hover {
                    background: #b3dbf5;
                    box-shadow: 0 2px 3px 0 rgba(60,64,67,0.3), 0 6px 10px 4px rgba(60,64,67,0.15);
                }
                .mailbox-sidebar-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .mailbox-sidebar-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 9px 12px 9px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    color: #444746;
                    cursor: pointer;
                    background: transparent;
                    transition: background 0.1s;
                }
                .mailbox-sidebar-item:hover {
                    background: rgba(0,0,0,0.04);
                    color: #1f1f1f;
                }
                .mailbox-sidebar-item.active {
                    background: #d3e3fd;
                    color: #041e49;
                    font-weight: 700;
                }
                .mailbox-sidebar-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .mailbox-sidebar-badge {
                    font-size: 12px;
                    font-weight: 700;
                }
                .mailbox-content-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                    border-radius: 0;
                    margin: 0;
                    box-shadow: none;
                    overflow: hidden;
                }
                .mailbox-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    border-bottom: 1px solid #e0e8f5;
                    min-height: 48px;
                    background: #fff;
                }
                .mailbox-toolbar-left, .mailbox-toolbar-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .mailbox-tool-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: #444746;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .mailbox-tool-btn:hover {
                    background: rgba(0,0,0,0.06);
                    color: #1f1f1f;
                }
                .mailbox-tool-btn:disabled {
                    color: #cbd5e1;
                    cursor: not-allowed;
                }
                .mailbox-tool-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                    border: none;
                    background: transparent;
                    color: #444746;
                    cursor: pointer;
                }
                .mailbox-tool-checkbox:hover {
                    background: rgba(0,0,0,0.06);
                }
                .mailbox-emails-scroll {
                    flex: 1;
                    overflow-y: auto;
                    background: #fff;
                }
                .mailbox-email-row {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    cursor: pointer;
                    transition: box-shadow 0.15s, background 0.15s;
                    position: relative;
                }
                .mailbox-email-row:hover {
                    background: #f8fafc;
                    box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
                    z-index: 1;
                }
                .mailbox-email-row.unread {
                    background: #f2f6fc;
                }
                .mailbox-email-row.unread .mailbox-email-sender,
                .mailbox-email-row.unread .mailbox-email-subject {
                    font-weight: 700;
                    color: #1f1f1f;
                }
                .mailbox-email-row.selected {
                    background: #c2e7ff;
                }
                .mailbox-email-cols {
                    display: grid;
                    grid-template-columns: 32px 32px 180px 1fr 100px;
                    align-items: center;
                    width: 100%;
                    gap: 12px;
                }
                .mailbox-email-star {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    background: transparent;
                    color: #747775;
                    cursor: pointer;
                }
                .mailbox-email-star:hover {
                    background: rgba(0,0,0,0.06);
                }
                .mailbox-email-star.starred {
                    color: #f4b400;
                }
                .mailbox-email-sender {
                    font-size: 14px;
                    color: #444746;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .mailbox-email-msg-snippet {
                    font-size: 14px;
                    color: #1f1f1f;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: flex;
                    align-items: center;
                }
                .mailbox-email-subject {
                    color: #1f1f1f;
                }
                .mailbox-email-snippet {
                    color: #5f6368;
                    margin-left: 6px;
                }
                .mailbox-email-date {
                    font-size: 12px;
                    color: #5f6368;
                    text-align: right;
                    font-weight: 500;
                }
                .mailbox-row-actions {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: none;
                    align-items: center;
                    gap: 6px;
                    background: #f8fafc;
                    padding-left: 12px;
                    height: calc(100% - 2px);
                }
                .mailbox-email-row:hover .mailbox-row-actions {
                    display: flex;
                }
                .mailbox-email-row.selected .mailbox-row-actions {
                    background: #c2e7ff;
                }
                /* Slider / Open Mail view */
                .mailbox-detail-view {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #ffffff;
                    overflow: hidden;
                }
                .mailbox-detail-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .mailbox-detail-title {
                    font-size: 20px;
                    font-weight: 500;
                    color: #1f1f1f;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .mailbox-detail-sender-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                }
                .mailbox-sender-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .mailbox-sender-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .mailbox-sender-meta {
                    display: flex;
                    flex-direction: column;
                }
                .mailbox-sender-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1f1f1f;
                }
                .mailbox-sender-address {
                    font-size: 12px;
                    color: #5f6368;
                }
                .mailbox-detail-date {
                    font-size: 12px;
                    color: #5f6368;
                }
                .mailbox-detail-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #1f1f1f;
                    border-top: 1px solid #f1f5f9;
                }
                /* Floating Compose Window */
                .mailbox-floating-compose {
                    position: fixed;
                    bottom: 0;
                    right: 80px;
                    width: 540px;
                    height: 480px;
                    background: #ffffff;
                    border-radius: 12px 12px 0 0;
                    box-shadow: 0 12px 24px 0 rgba(0,0,0,0.15), 0 4px 8px 0 rgba(0,0,0,0.15);
                    display: flex;
                    flex-direction: column;
                    z-index: 1000;
                    border: 1px solid #dadce0;
                    overflow: hidden;
                    transition: transform 0.2s, height 0.2s;
                }
                .mailbox-floating-compose.minimized {
                    height: 40px;
                    transform: translateY(0);
                }
                .mailbox-compose-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f2f6fc;
                    padding: 8px 16px;
                    cursor: pointer;
                }
                .mailbox-compose-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1f1f1f;
                }
                .mailbox-compose-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .mailbox-compose-control-btn {
                    background: transparent;
                    border: none;
                    color: #5f6368;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mailbox-compose-control-btn:hover {
                    background: rgba(0,0,0,0.06);
                    color: #1f1f1f;
                }
                .mailbox-compose-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 0 16px 16px 16px;
                }
                .mailbox-compose-field {
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 6px 0;
                }
                .mailbox-compose-field span {
                    font-size: 14px;
                    color: #5f6368;
                    width: 60px;
                }
                .mailbox-compose-field input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    color: #1f1f1f;
                }
                .mailbox-compose-textarea {
                    flex: 1;
                    border: none;
                    resize: none;
                    outline: none;
                    font-size: 14px;
                    color: #1f1f1f;
                    padding-top: 12px;
                    line-height: 1.5;
                }
                .mailbox-compose-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 12px;
                }
                .mailbox-send-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    background: #0b57d0;
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.15s, box-shadow 0.15s;
                }
                .mailbox-send-btn:hover {
                    background: #0842a0;
                    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
                }
                .mailbox-send-btn:disabled {
                    background: #a8c7fa;
                    cursor: not-allowed;
                }
                .mailbox-compose-status {
                    font-size: 12px;
                    color: #5f6368;
                    font-style: italic;
                }
            `}</style>

            {/* TOP GMAIL SEARCH BAR */}
            <div className="mailbox-top-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 3px 8px ${accentColor}33`,
                    }}>
                        <Inbox size={18} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                            {getSenderDisplayName(conf?.email)}
                        </h1>
                        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                            Conference Mailbox System
                        </p>
                    </div>
                </div>

                <div className="mailbox-search-wrapper">
                    <Search size={16} className="mailbox-search-icon" />
                    <input
                        type="text"
                        className="mailbox-search-input"
                        placeholder="Search mail by sender, recipient, subject, or content..."
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setSearchQuery(searchInputValue);
                        }}
                    />
                    {searchInputValue && (
                        <button 
                            className="mailbox-search-clear"
                            onClick={() => {
                                setSearchInputValue('');
                                setSearchQuery('');
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                
                <div>
                    {refreshing ? (
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            Syncing Gmail...
                        </span>
                    ) : (
                        <button 
                            onClick={() => fetchEmails(true)}
                            className="mailbox-tool-btn"
                            title="Sync Gmail mailbox via IMAP"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="mailbox-main-layout">
                {/* LEFT SIDEBAR */}
                <div className="mailbox-sidebar">
                    <button className="mailbox-compose-btn" onClick={openNewCompose}>
                        <Pen size={18} />
                        <span>Compose</span>
                    </button>

                    <div className="mailbox-sidebar-menu">
                        {[
                            { key: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, count: counts.inbox },
                            { key: 'starred', label: 'Starred', icon: <Star size={16} />, count: counts.starred },
                            { key: 'sent', label: 'Sent', icon: <Send size={16} /> },
                            { key: 'drafts', label: 'Drafts', icon: <File size={16} />, count: counts.drafts },
                        ].map(item => (
                            <div 
                                key={item.key}
                                className={`mailbox-sidebar-item ${selectedFolder === item.key ? 'active' : ''}`}
                                onClick={() => setSelectedFolder(item.key)}
                            >
                                <div className="mailbox-sidebar-label">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {item.count > 0 && (
                                    <span className="mailbox-sidebar-badge">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                        ))}

                        {/* Collapsable Menu Toggle */}
                        <div 
                            className="mailbox-sidebar-item"
                            onClick={() => setShowMoreFolders(prev => !prev)}
                        >
                            <div className="mailbox-sidebar-label">
                                {showMoreFolders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                <span>{showMoreFolders ? 'Less' : 'More'}</span>
                            </div>
                        </div>

                        {/* Expanded Menu Folders */}
                        {showMoreFolders && [
                            { key: 'all', label: 'All Mail', icon: <MailOpen size={16} /> },
                            { key: 'bin', label: 'Bin', icon: <Trash2 size={16} /> },
                        ].map(item => (
                            <div 
                                key={item.key}
                                className={`mailbox-sidebar-item ${selectedFolder === item.key ? 'active' : ''}`}
                                onClick={() => setSelectedFolder(item.key)}
                                style={{ paddingLeft: '32px' }}
                            >
                                <div className="mailbox-sidebar-label">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MAIN EMAIL LIST / DETAIL CONTAINER */}
                <div className="mailbox-content-container">
                    {openedEmail ? (
                        /* EMAIL DETAIL VIEW */
                        <div className="mailbox-detail-view">
                            <div className="mailbox-detail-header">
                                <button className="mailbox-tool-btn" onClick={() => setOpenedEmail(null)}>
                                    <ArrowLeft size={16} />
                                </button>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button 
                                        className="mailbox-tool-btn"
                                        onClick={(e) => handleStarToggle(e, openedEmail)}
                                        title={openedEmail.isImportant ? 'Unstar' : 'Star'}
                                    >
                                        <Star size={16} fill={openedEmail.isImportant ? '#f4b400' : 'transparent'} color={openedEmail.isImportant ? '#f4b400' : '#444746'} />
                                    </button>
                                    <button 
                                        className="mailbox-tool-btn"
                                        onClick={(e) => handleDeleteEmails(e, [openedEmail._id])}
                                        title="Move to Trash"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mailbox-detail-title">
                                {openedEmail.subject || '(No Subject)'}
                            </div>

                            <div className="mailbox-detail-sender-row">
                                <div className="mailbox-sender-info">
                                    <div className="mailbox-sender-avatar" style={{ background: getAvatarColor(openedEmail.from) }}>
                                        {openedEmail.from ? openedEmail.from.slice(0, 1).toUpperCase() : 'U'}
                                    </div>
                                    <div className="mailbox-sender-meta">
                                        <span className="mailbox-sender-name">
                                            {getSenderDisplayName(openedEmail.from)}
                                        </span>
                                        <span className="mailbox-sender-address">
                                            {openedEmail.from}
                                        </span>
                                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                            to {openedEmail.to}
                                        </span>
                                    </div>
                                </div>
                                <span className="mailbox-detail-date">
                                    {formatDateLong(openedEmail.createdAt)}
                                </span>
                            </div>

                            {/* HTML-rendered body */}
                            <div className="mailbox-detail-body">
                                {openedEmail.body ? (
                                    openedEmail.body.includes('<') && openedEmail.body.includes('>') ? (
                                        <div dangerouslySetInnerHTML={{ __html: openedEmail.body }} />
                                    ) : (
                                        <pre style={{ 
                                            fontFamily: 'inherit', 
                                            whiteSpace: 'pre-wrap', 
                                            wordBreak: 'break-word',
                                            margin: 0,
                                            color: '#334155'
                                        }}>{openedEmail.body}</pre>
                                    )
                                ) : (
                                    <em style={{ color: '#94a3b8' }}>Empty message body</em>
                                )}
                            </div>

                            {/* Reply Action Footer */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
                                <button 
                                    className="mailbox-send-btn"
                                    onClick={() => {
                                        setComposeTo(openedEmail.from);
                                        setComposeSubject(`Re: ${openedEmail.subject}`);
                                        setComposeBody(`\n\nOn ${formatDateLong(openedEmail.createdAt)}, ${openedEmail.from} wrote:\n> ${openedEmail.body?.replace(/\n/g, '\n> ')}`);
                                        setComposeDraftId(null);
                                        setIsComposeOpen(true);
                                    }}
                                >
                                    <CornerUpLeft size={16} />
                                    Reply
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* EMAIL LIST VIEW */
                        <>
                            {/* Toolbar */}
                            <div className="mailbox-toolbar">
                                <div className="mailbox-toolbar-left">
                                    <button 
                                        className="mailbox-tool-checkbox" 
                                        onClick={handleSelectAllToggle}
                                        title="Select all messages"
                                    >
                                        {selectedEmailIds.length === 0 ? (
                                            <Square size={16} />
                                        ) : selectedEmailIds.length === filteredEmails.length ? (
                                            <CheckSquare size={16} color={accentColor} />
                                        ) : (
                                            <Minus size={16} color={accentColor} />
                                        )}
                                    </button>

                                    {selectedEmailIds.length > 0 && (
                                        <>
                                            <button 
                                                className="mailbox-tool-btn" 
                                                onClick={(e) => handleDeleteEmails(e, selectedEmailIds)}
                                                title="Delete selected emails"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button 
                                                className="mailbox-tool-btn"
                                                onClick={(e) => handleMarkReadToggle(e, selectedEmailIds, true)}
                                                title="Mark as read"
                                            >
                                                <MailOpen size={16} />
                                            </button>
                                            <button 
                                                className="mailbox-tool-btn"
                                                onClick={(e) => handleMarkReadToggle(e, selectedEmailIds, false)}
                                                title="Mark as unread"
                                            >
                                                <Mail size={16} />
                                            </button>
                                            <span style={{ fontSize: 13, color: '#5f6368', marginLeft: 8 }}>
                                                {selectedEmailIds.length} selected
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="mailbox-toolbar-right">
                                    <span style={{ fontSize: 12, color: '#5f6368' }}>
                                        {filteredEmails.length} messages
                                    </span>
                                </div>
                            </div>

                            {/* Emails Grid Scroll */}
                            <div className="mailbox-emails-scroll">
                                {loading && (
                                    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                                        <RefreshCw size={36} style={{ color: accentColor, animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                                        <p style={{ color: '#5f6368', fontSize: 15, margin: 0 }}>Syncing your mailbox...</p>
                                    </div>
                                )}

                                {!loading && error && (
                                    <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fef2f2', margin: 16, borderRadius: 12, border: '1px solid #fecaca' }}>
                                        <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: 12 }} />
                                        <p style={{ color: '#ef4444', margin: 0, fontSize: 14, fontWeight: 600 }}>⚠️ {error}</p>
                                        <button 
                                            onClick={() => fetchEmails(false)}
                                            style={{
                                                marginTop: 16, padding: '8px 18px', borderRadius: 20, 
                                                border: `1px solid ${accentColor}`, background: accentColor, color: '#fff', 
                                                cursor: 'pointer', fontSize: 13, fontWeight: 600
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}

                                {!loading && !error && filteredEmails.length === 0 && (
                                    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                                        <Inbox size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
                                        <p style={{ color: '#9ca3af', margin: 0, fontSize: 15, fontWeight: 500 }}>
                                            {searchQuery ? 'No emails found matching search.' : `Your ${selectedFolder} folder is empty.`}
                                        </p>
                                    </div>
                                )}

                                {!loading && !error && filteredEmails.map((email) => {
                                    const isRowSelected = selectedEmailIds.includes(email._id);
                                    return (
                                        <div
                                            key={email._id}
                                            className={`mailbox-email-row ${email.isRead ? '' : 'unread'} ${isRowSelected ? 'selected' : ''}`}
                                            onClick={() => {
                                                if (selectedFolder === 'drafts') {
                                                    openDraftCompose(email);
                                                } else {
                                                    handleRowClick(email);
                                                }
                                            }}
                                        >
                                            <div className="mailbox-email-cols">
                                                {/* Checkbox */}
                                                <div 
                                                    className="mailbox-tool-checkbox"
                                                    onClick={(e) => handleSelectRow(e, email._id)}
                                                >
                                                    {isRowSelected ? (
                                                        <CheckSquare size={16} color={accentColor} />
                                                    ) : (
                                                        <Square size={16} />
                                                    )}
                                                </div>

                                                {/* Star */}
                                                <button 
                                                    className={`mailbox-email-star ${email.isImportant ? 'starred' : ''}`}
                                                    onClick={(e) => handleStarToggle(e, email)}
                                                >
                                                    <Star size={16} fill={email.isImportant ? '#f4b400' : 'transparent'} />
                                                </button>

                                                {/* Sender */}
                                                <span className="mailbox-email-sender">
                                                    {getSenderDisplayName(email.from)}
                                                </span>

                                                {/* Subject + Snippet */}
                                                <div className="mailbox-email-msg-snippet">
                                                    <span className="mailbox-email-subject">
                                                        {email.subject || '(No Subject)'}
                                                    </span>
                                                    <span className="mailbox-email-snippet">
                                                        — {stripHtmlSnippet(email.body)}
                                                    </span>
                                                </div>

                                                {/* Date */}
                                                <span className="mailbox-email-date">
                                                    {formatDateShort(email.createdAt)}
                                                </span>
                                            </div>

                                            {/* Hover Quick Actions */}
                                            <div className="mailbox-row-actions">
                                                <button 
                                                    className="mailbox-tool-btn" 
                                                    onClick={(e) => handleDeleteEmails(e, [email._id])}
                                                    title="Trash"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button 
                                                    className="mailbox-tool-btn" 
                                                    onClick={(e) => handleMarkReadToggle(e, [email._id], !email.isRead)}
                                                    title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                                                >
                                                    {email.isRead ? <Mail size={16} /> : <MailOpen size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* FLOATING COMPOSE WINDOW */}
            {isComposeOpen && (
                <div className={`mailbox-floating-compose ${isComposeMinimized ? 'minimized' : ''}`}>
                    {/* Header Controls */}
                    <div className="mailbox-compose-header" onClick={() => setIsComposeMinimized(!isComposeMinimized)}>
                        <span className="mailbox-compose-title">New Message</span>
                        <div className="mailbox-compose-controls" onClick={(e) => e.stopPropagation()}>
                            <button className="mailbox-compose-control-btn" onClick={() => setIsComposeMinimized(!isComposeMinimized)}>
                                <Minus size={14} />
                            </button>
                            <button className="mailbox-compose-control-btn" onClick={handleDiscardCompose}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Editor Fields */}
                    {!isComposeMinimized && (
                        <div className="mailbox-compose-body">
                            <div className="mailbox-compose-field">
                                <span>To</span>
                                <input
                                    type="text"
                                    placeholder="recipients@domain.com"
                                    value={composeTo}
                                    onChange={(e) => setComposeTo(e.target.value)}
                                />
                            </div>
                            <div className="mailbox-compose-field">
                                <span>Subject</span>
                                <input
                                    type="text"
                                    placeholder="Subject of the email"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                />
                            </div>
                            <textarea
                                className="mailbox-compose-textarea"
                                placeholder="Type your message here..."
                                value={composeBody}
                                onChange={(e) => setComposeBody(e.target.value)}
                            />

                            {/* Footer send row */}
                            <div className="mailbox-compose-footer">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <button 
                                        className="mailbox-send-btn"
                                        onClick={handleSendCompose}
                                        disabled={composeStatus === 'Sending...'}
                                    >
                                        <Send size={14} />
                                        {composeStatus === 'Sending...' ? 'Sending...' : 'Send'}
                                    </button>
                                    {composeStatus && (
                                        <span className="mailbox-compose-status">{composeStatus}</span>
                                    )}
                                </div>
                                <button 
                                    className="mailbox-tool-btn" 
                                    onClick={handleDiscardCompose}
                                    title="Discard draft"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
