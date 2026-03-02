// Central API service for all dashboard <-> backend communication
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ── Active conference (set at login, used in all requests) ──────────────────
let _conference = 'liutex';

export function setConference(id) {
    _conference = id || 'liutex';
}

export function getConference() {
    return _conference;
}

function withConf(endpoint) {
    const sep = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${sep}conference=${_conference}`;
}

async function request(method, endpoint, body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

// ── Generic Content CRUD
export const getAllContent = () => request('GET', withConf('/content'));
export const getContent = (key) => request('GET', withConf(`/content/${key}`));
export const updateContent = (key, data) =>
    request('PUT', `/content/${key}`, { ...data, conference: _conference });

// ── Speakers
export const getSpeakers = (category) =>
    request('GET', withConf(`/speakers/all${category ? `&category=${category}` : ''}`));
export const getSpeakersPublic = (category) =>
    request('GET', withConf(`/speakers${category ? `&category=${encodeURIComponent(category)}` : ''}`));
export const createSpeaker = (data) =>
    request('POST', '/speakers', { ...data, conference: _conference });
export const updateSpeaker = (id, data) =>
    request('PUT', `/speakers/${id}`, { ...data, conference: _conference });
export const deleteSpeaker = (id) => request('DELETE', `/speakers/${id}`);

// ── Sponsors / Media Partners
export const getSponsors = (type) =>
    request('GET', withConf(`/sponsors/all${type ? `&type=${type}` : ''}`));
export const getSponsorsPublic = (type) =>
    request('GET', withConf(`/sponsors${type ? `&type=${encodeURIComponent(type)}` : ''}`));
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

// ── Image upload
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
}

// ── Discounts
export const getDiscounts = () => request('GET', withConf('/discounts'));
export const createDiscount = (data) =>
    request('POST', '/discounts', { ...data, conference: _conference });
export const deleteDiscount = (id) => request('DELETE', `/discounts/${id}`);

// ── Dashboard Statistics
export const getDashboardStats = () => request('GET', withConf('/stats'));
