// Central API service for all dashboard <-> backend communication
// Uses relative /api path (same-server Next.js routes) unless overridden by env var
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ── Auth token management ────────────────────────────────────
let _authToken = (typeof window !== 'undefined' && localStorage.getItem('authToken')) || null;

export function setAuthToken(token) {
    _authToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }
}

export function getAuthToken() {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('authToken');
        if (stored) _authToken = stored;
    }
    return _authToken;
}

export function clearAuth() {
    _authToken = null;
    _conference = 'liutex';
    if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('activeConference');
        localStorage.removeItem('session');
    }
}

// ── Active conference (set at login, used in all requests) ──────────────────
let _conference = (typeof window !== 'undefined' && localStorage.getItem('activeConference')) || 'liutex';

export function setConference(id) {
    if (!id) return;
    _conference = id;
    if (typeof window !== 'undefined') {
        localStorage.setItem('activeConference', id);
        // Force update any listeners if needed, though most components will re-mount
        window.dispatchEvent(new CustomEvent('conference-change', { detail: id }));
    }
}

export function getConference() {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('activeConference');
        if (stored) _conference = stored;
    }
    return _conference;
}

function withConf(endpoint) {
    const sep = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${sep}conference=${_conference}`;
}

async function request(method, endpoint, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    // ── Attach JWT token for authenticated requests ──
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const opts = {
        method,
        headers,
        cache: 'no-store',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...opts,
        next: { revalidate: 0 } // Extra insurance for Next.js caching
    });
    if (!res.ok) {
        if (res.status === 404) return null; // Gracefully handle missing content
        // ── Handle session expiry ──
        if (res.status === 401) {
            clearAuth();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
            throw new Error('Session expired. Please log in again.');
        }
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || err.message || 'Request failed');
    }
    return res.json();
}

// ── Generic Content CRUD
export const getAllContent = () => request('GET', withConf('/content'));
export const getContent = (key) => request('GET', withConf(`/content/${key}`));
export const updateContent = (key, data) => {
    // Arrays must NOT be spread — { ...[] } turns [a,b] into { 0:a, 1:b }.
    // Use a special _items wrapper so the backend can store the real array.
    const body = Array.isArray(data)
        ? { _items: data, conference: _conference }
        : { ...data, conference: _conference };
    return request('PUT', `/content/${key}`, body);
};

// ── Speakers
export const getSpeakers = (category) =>
    request('GET', withConf(`/speakers/all${category ? `?category=${encodeURIComponent(category)}` : ''}`));
export const getSpeakersPublic = (category) =>
    request('GET', withConf(`/speakers${category ? `?category=${encodeURIComponent(category)}` : ''}`));
export const createSpeaker = (data) =>
    request('POST', '/speakers', { ...data, conference: _conference });
export const updateSpeaker = (id, data) =>
    request('PUT', `/speakers/${id}`, { ...data, conference: _conference });
export const deleteSpeaker = (id) => request('DELETE', `/speakers/${id}`);

// ── Universities
export const getUniversities = () => request('GET', withConf('/universities'));
export const createUniversity = (data) => request('POST', '/universities', { ...data, conference: _conference });
export const updateUniversity = (id, data) => request('PUT', `/universities/${id}`, { ...data, conference: _conference });
export const deleteUniversity = (id) => request('DELETE', `/universities/${id}`);

// ── Sponsors / Media Partners
export const getSponsors = (type) =>
    request('GET', withConf(`/sponsors/all${type ? `?type=${type}` : ''}`));
export const getSponsorsPublic = (type) =>
    request('GET', withConf(`/sponsors${type ? `?type=${encodeURIComponent(type)}` : ''}`));
export const createSponsor = (data) =>
    request('POST', '/sponsors', { ...data, conference: _conference });
export const updateSponsor = (id, data) =>
    request('PUT', `/sponsors/${id}`, { ...data, conference: _conference });
export const deleteSponsor = (id) => request('DELETE', `/sponsors/${id}`);

// ── Abstracts
export const getAbstracts = () => request('GET', withConf('/abstracts'));
export const updateAbstractStatus = (id, data) => request('PATCH', `/abstracts/${id}`, data);

// ── Registrations
export const getRegistrations = () => request('GET', withConf('/registrations'));
export const updateRegistrationStatus = (id, data) => request('PATCH', `/registrations/${id}`, data);

// ── Image upload (stores in MongoDB via /api/upload)
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData, headers });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Upload failed');
    }
    return res.json(); // { url, id, message }
}

// ── File upload (stores PDFs/docs in MongoDB via /api/upload-file)
export async function uploadFile(file, conference) {
    const formData = new FormData();
    formData.append('file', file);
    if (conference) formData.append('conference', conference);

    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/upload-file`, { method: 'POST', body: formData, headers });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'File upload failed');
    }
    return res.json(); // { url, id, filename, originalName, message }
}

// ── Discounts
export const getDiscounts = () => request('GET', withConf('/discounts'));
export const createDiscount = (data) =>
    request('POST', '/discounts', { ...data, conference: _conference });
export const deleteDiscount = (id) => request('DELETE', `/discounts/${id}`);

// ── Dashboard Statistics
export const getDashboardStats = () => request('GET', withConf('/stats'));
