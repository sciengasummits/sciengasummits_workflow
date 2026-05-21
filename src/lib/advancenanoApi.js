/*
 * ADVANCENANOSUMMIT2026 API wrapper
 * Provides functions to fetch data from the ADVANCENANOSUMMIT2026 project.
 * Uses the base URL from environment variable ADVANCENANOSUMMIT2026_BASE_URL
 * or defaults to http://localhost:3000.
 */

const BASE_URL = process.env.ADVANCENANOSUMMIT2026_BASE_URL || 'http://localhost:3000';

export async function fetchContent(key) {
  const res = await fetch(`${BASE_URL}/api/content/${key}?conference=advancenano`);
  if (!res.ok) throw new Error(`Failed to fetch content for key ${key}`);
  return res.json();
}

export async function fetchAllContent() {
  const res = await fetch(`${BASE_URL}/api/content?conference=advancenano`);
  if (!res.ok) throw new Error('Failed to fetch all content');
  return res.json();
}

export async function fetchAbstracts() {
  const res = await fetch(`${BASE_URL}/api/abstracts`);
  if (!res.ok) throw new Error('Failed to fetch abstracts');
  return res.json();
}

export async function fetchSpeakers() {
  const res = await fetch(`${BASE_URL}/api/speakers`);
  if (!res.ok) throw new Error('Failed to fetch speakers');
  return res.json();
}

export async function fetchSponsors() {
  const res = await fetch(`${BASE_URL}/api/sponsors`);
  if (!res.ok) throw new Error('Failed to fetch sponsors');
  return res.json();
}

export async function fetchProgram() {
  const res = await fetch(`${BASE_URL}/api/program`);
  if (!res.ok) throw new Error('Failed to fetch program');
  return res.json();
}
