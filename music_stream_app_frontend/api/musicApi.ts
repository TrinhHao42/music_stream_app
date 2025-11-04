import { Album, Artist, Song } from '@/types';
import axiosInstance from '@/utils/axiosInstance';

export type PageableResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type DownloadTokenResponse = {
  token: string;
  downloadUrl: string;
  expiresAt: string;
  songTitle: string;
  artist: string;
  fileSizeBytes: number;
};

export type LibraryResponse = {
  libraryId: string;
  userId: string;
  favouriteSongs: Song[];
  favouriteAlbums: Album[];
  favouritePlaylists: {
    playlistId: string;
    playlistName: string;
    userId: string;
    songs: string[];
  }[];
  favouriteArtists: Artist[];
};

export type CreatePlaylistRequest = {
  playlistId?: string;
  playlistName: string;
  userId: string;
  songs: string[];
};

export type AddToLibraryRequest = {
  itemId: string;
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

export async function upgradeToPremium(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/accounts/upgrade/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    return false;
  }
}

export async function getDownloadToken(songId: string): Promise<DownloadTokenResponse | null> {
  const path = `/api/download/token?songId=${songId}`;
  try {
    const response = await request<DownloadTokenResponse>(path);
    return response;
  } catch (error) {
    console.error('Error getting download token:', error);
    return null;
  }
}

export function getDownloadStreamUrl(token: string): string {
  return `${BASE_URL}/api/download/stream/${token}`;
}

export async function logout(): Promise<boolean> {
  try {
    await axiosInstance.post('/api/auth/logout');
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

// Library APIs
export async function createLibrary(userId: string): Promise<boolean> {
  try {
    await axiosInstance.post('/libraries', { userId });
    return true;
  } catch (error: any) {
    console.error('Error creating library:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return false;
  }
}

export async function getLibrary(userId: string): Promise<LibraryResponse | null> {
  try {
    const response = await axiosInstance.get(`/libraries/${userId}`);
    return response.data;
  } catch (error: any) {
    // If library doesn't exist (404), try to create it
    if (error.response?.status === 404) {
      console.log('Library not found, attempting to create...');
      const created = await createLibrary(userId);
      if (created) {
        // Try fetching again after creation
        try {
          const response = await axiosInstance.get(`/libraries/${userId}`);
          return response.data;
        } catch (retryError) {
          console.error('Error fetching library after creation:', retryError);
        }
      }
    }
    return null;
  }
}

export async function addSongToLibrary(userId: string, songId: string): Promise<boolean> {
  try {
    await axiosInstance.post(`/libraries/${userId}/songs`, { itemId: songId });
    return true;
  } catch (error) {
    console.error('Error adding song to library:', error);
    return false;
  }
}

export async function addAlbumToLibrary(userId: string, albumId: string): Promise<boolean> {
  try {
    await axiosInstance.post(`/libraries/${userId}/albums`, { itemId: albumId });
    return true;
  } catch (error) {
    console.error('Error adding album to library:', error);
    return false;
  }
}

export async function addArtistToLibrary(userId: string, artistId: string): Promise<boolean> {
  try {
    await axiosInstance.post(`/libraries/${userId}/artists`, { itemId: artistId });
    return true;
  } catch (error) {
    console.error('Error adding artist to library:', error);
    return false;
  }
}

export async function addPlaylistToLibrary(userId: string, playlistId: string): Promise<boolean> {
  try {
    const response = await axiosInstance.post(`/libraries/${userId}/playlists`, { itemId: playlistId });
    return true;
  } catch (error: any) {
    
    // Throw error to show user
    throw new Error(
      `Failed to add playlist to library: ${error.response?.data?.message || error.message}`
    );
  }
}

// Playlist APIs
export async function createPlaylist(playlist: CreatePlaylistRequest): Promise<any> {
  try {
    const response = await axiosInstance.post('/playlists', playlist);
    return response.data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}

export async function getUserPlaylists(userId: string): Promise<any[]> {
  try {
    console.log('Fetching playlists for userId:', userId);
    const response = await axiosInstance.get(`/playlists/user/${userId}`);
    console.log('User playlists response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error getting user playlists:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    return [];
  }
}

export async function addSongToPlaylist(playlistId: string, songId: string): Promise<boolean> {
  try {
    console.log('Adding song to playlist:', { playlistId, songId });
    const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, { itemId: songId });
    console.log('Add song to playlist response:', response.data);
    return true;
  } catch (error: any) {
    console.error('Error adding song to playlist:', error);
    console.error('Request URL:', `/playlists/${playlistId}/songs`);
    console.error('Request body:', { itemId: songId });
    console.error('Error response:', error.response?.data);
    return false;
  }
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
    return true;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return false;
  }
}

export async function getPlaylistById(playlistId: string): Promise<any | null> {
  try {
    const response = await axiosInstance.get(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting playlist:', error);
    return null;
  }
}

// Remove from Library APIs
export async function removeSongFromLibrary(userId: string, songId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/libraries/${userId}/songs/${songId}`);
    return true;
  } catch (error) {
    console.error('Error removing song from library:', error);
    return false;
  }
}

export async function removeAlbumFromLibrary(userId: string, albumId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/libraries/${userId}/albums/${albumId}`);
    return true;
  } catch (error) {
    console.error('Error removing album from library:', error);
    return false;
  }
}

export async function removeArtistFromLibrary(userId: string, artistId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/libraries/${userId}/artists/${artistId}`);
    return true;
  } catch (error) {
    console.error('Error removing artist from library:', error);
    return false;
  }
}

export async function removePlaylistFromLibrary(userId: string, playlistId: string): Promise<boolean> {
  try {
    await axiosInstance.delete(`/libraries/${userId}/playlists/${playlistId}`);
    return true;
  } catch (error) {
    console.error('Error removing playlist from library:', error);
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
  upgradeToPremium,
  getDownloadToken,
  getDownloadStreamUrl,
  logout,
  createLibrary,
  getLibrary,
  addSongToLibrary,
  addAlbumToLibrary,
  addArtistToLibrary,
  addPlaylistToLibrary,
  createPlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getPlaylistById,
  removeSongFromLibrary,
  removeAlbumFromLibrary,
  removeArtistFromLibrary,
  removePlaylistFromLibrary,
};
