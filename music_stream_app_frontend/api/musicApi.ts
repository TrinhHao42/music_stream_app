import { Album } from '@/types';

const BASE_URL = process.env.API_URL || 'http://localhost:8080';
console.log(BASE_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

export async function getAlbums(): Promise<Album[]> {
  return await request<Album[]>('/albums');
}

export default {
  getAlbums,
};


