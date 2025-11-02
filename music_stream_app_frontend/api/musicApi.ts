import { Album, Artist, Song } from '@/types';

type PageableResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
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

export async function getSongs(page?: number, size?: number): Promise<Song[]> {
  let path = '/songs';
  const params = new URLSearchParams();
  
  if (page !== undefined) {
    params.append('page', page.toString());
  }
  if (size !== undefined) {
    params.append('size', size.toString());
  }
  
  const queryString = params.toString();
  if (queryString) {
    path += `?${queryString}`;
  }
  
  const response = await request<PageableResponse<Song>>(path);
  return response.content;
}

export async function getArtists(page?: number, size?: number): Promise<Artist[]> {
  let path = '/artists';
  const params = new URLSearchParams();
  
  if (page !== undefined) {
    params.append('page', page.toString());
  }
  if (size !== undefined) {
    params.append('size', size.toString());
  }
  
  const queryString = params.toString();
  if (queryString) {
    path += `?${queryString}`;
  }
  
  const response = await request<PageableResponse<Artist>>(path);
  return response.content;
}

export async function getSongByName(name: string): Promise<Song | null> {
  const path = `/songs/search?name=${encodeURIComponent(name)}`;
  try {
    const response = await request<PageableResponse<Song>>(path);
    // Trả về song đầu tiên trong content array
    return response.content.length > 0 ? response.content[0] : null;
  } catch (error) {
    console.error('Error fetching song by name:', error);
    return null;
  }
}

export async function getSongById(songId: string): Promise<Song | null> {
  const path = `/songs/${songId}`;
  try {
    const song = await request<Song>(path);
    return song;
  } catch (error) {
    console.error('Error fetching song by id:', error);
    return null;
  }
}

export default {
  getAlbums,
  getSongs,
  getArtists,
  getSongByName,
  getSongById,
};


