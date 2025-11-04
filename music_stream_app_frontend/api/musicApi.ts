import { Album, Artist, Song } from '@/types';
import User from '@/types/User';
import axiosInstance from '@/utils/axiosInstance';

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
    const response = await request<any>(path);
    
    // Check if response is a PageableResponse or direct Song/Array
    if (response && response.content && Array.isArray(response.content)) {
      // PageableResponse format
      return response.content.length > 0 ? response.content[0] : null;
    } else if (Array.isArray(response)) {
      // Direct array format
      return response.length > 0 ? response[0] : null;
    } else if (response && response.songId) {
      // Direct Song object
      return response as Song;
    }
    
    return null;
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

export async function getAlbumByName(name: string): Promise<Album | null> {
  const path = `/albums/search?name=${encodeURIComponent(name)}`;
  try {
    const response = await request<any>(path);
    
    // Check if response is a PageableResponse or direct Album/Array
    if (response && response.content && Array.isArray(response.content)) {
      // PageableResponse format
      return response.content.length > 0 ? response.content[0] : null;
    } else if (Array.isArray(response)) {
      // Direct array format
      return response.length > 0 ? response[0] : null;
    } else if (response && response.albumId) {
      // Direct Album object
      return response as Album;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching album by name:', error);
    return null;
  }
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  const path = `/albums/${albumId}`;
  try {
    const album = await request<Album>(path);
    return album;
  } catch (error) {
    console.error('Error fetching album by id:', error);
    return null;
  }
}

// Lấy thông tin user hiện tại (cần JWT token)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get('/api/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// Thêm album vào danh sách yêu thích
export async function addFavouriteAlbum(albumId: string): Promise<boolean> {
  try {
    await axiosInstance.post(`/api/users/favourites/albums/${albumId}`);
    return true;
  } catch (error) {
    console.error('Error adding favourite album:', error);
    return false;
  }
}

// Xóa album khỏi danh sách yêu thích
export async function removeFavouriteAlbum(albumId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/api/users/favourites/albums/${albumId}`);
    return true;
  } catch (error) {
    console.error('Error removing favourite album:', error);
    return false;
  }
}

export default {
  getAlbums,
  getSongs,
  getArtists,
  getSongByName,
  getSongById,
  getAlbumByName,
  getAlbumById,
  getCurrentUser,
  addFavouriteAlbum,
  removeFavouriteAlbum,
};
