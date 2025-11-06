import { Album, Artist, Song } from '@/types';
import Playlist from '@/types/Playlist';
import User from '@/types/User';
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

// Tìm kiếm artists theo tên
export async function searchArtists(query: string): Promise<Artist[]> {
  if (!query.trim()) return [];
  
  const path = `/artists/search?name=${encodeURIComponent(query)}`;
  try {
    const response = await request<any>(path);
    
    // Xử lý response có thể là PageableResponse hoặc array
    if (response && response.content && Array.isArray(response.content)) {
      return response.content;
    } else if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching artists:', error);
    return [];
  }
}

// Tìm kiếm songs theo tên
export async function searchSongs(query: string): Promise<Song[]> {
  if (!query.trim()) return [];
  
  const path = `/songs/search?name=${encodeURIComponent(query)}`;
  try {
    const response = await request<any>(path);
    
    // Xử lý response có thể là PageableResponse hoặc array
    if (response && response.content && Array.isArray(response.content)) {
      return response.content;
    } else if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
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
  } catch (error: any) {
    // Không log error cho 404 (album có thể đã bị xóa)
    if (error.message && !error.message.includes('404')) {
      console.error('Error fetching album by id:', error);
    }
    return null;
  }
}

// Cập nhật thông tin album
export async function updateAlbum(albumId: string, albumData: Partial<Album>): Promise<Album | null> {
  try {
    const response = await axiosInstance.put(`/albums/update/${albumId}`, albumData);
    return response.data;
  } catch (error) {
    console.error('Error updating album:', error);
    return null;
  }
}

// Cập nhật lượt thích cho album
export async function updateAlbumFavourites(albumId: string, favourites: number): Promise<boolean> {
  try {
    await axiosInstance.put(
      `/albums/updateFavourites/${albumId}`,
      null, // Body rỗng
      {
        params: { favourites }, // Query parameters
      }
    );
    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error('Album not found:', albumId);
    } else {
      console.error('Error updating album favourites:', error);
    }
    return false;
  }
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  const path = `/artists/${artistId}`;
  try {
    const artist = await request<Artist>(path);
    return artist;
  } catch (error) {
    console.error('Error fetching artist by id:', error);
    return null;
  }
}

// Lấy nhiều songs theo danh sách IDs
export async function getSongsByIds(songIds: string[]): Promise<Song[]> {
  if (!songIds || songIds.length === 0) return [];
  
  try {
    const songPromises = songIds.map(id => getSongById(id));
    const songs = await Promise.all(songPromises);
    return songs.filter((song): song is Song => song !== null);
  } catch (error) {
    console.error('Error fetching songs by ids:', error);
    return [];
  }
}

// Lấy nhiều artists theo danh sách IDs
export async function getArtistsByIds(artistIds: string[]): Promise<Artist[]> {
  if (!artistIds || artistIds.length === 0) return [];
  
  try {
    const artistPromises = artistIds.map(id => getArtistById(id));
    const artists = await Promise.all(artistPromises);
    return artists.filter((artist): artist is Artist => artist !== null);
  } catch (error) {
    console.error('Error fetching artists by ids:', error);
    return [];
  }
}

// Lấy playlist theo ID
export async function getPlaylistById(playlistId: string): Promise<Playlist | null> {
  try {
    const response = await axiosInstance.get(`/playlists/${playlistId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching playlist by id:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Lấy nhiều playlists theo danh sách IDs
export async function getPlaylistsByIds(playlistIds: string[]): Promise<Playlist[]> {
  if (!playlistIds || playlistIds.length === 0) return [];
  
  try {
    const playlistPromises = playlistIds.map(id => getPlaylistById(id));
    const playlists = await Promise.all(playlistPromises);
    return playlists.filter((playlist): playlist is Playlist => playlist !== null);
  } catch (error) {
    console.error('Error fetching playlists by ids:', error);
    return [];
  }
}

// Lấy thông tin user hiện tại (cần JWT token)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

// Cập nhật thông tin user (cần JWT token)
export async function updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
  try {
    const response = await axiosInstance.put(`/api/auth/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Đổi tên user (cần JWT token)
export async function renameUser(userId: string, newName: string): Promise<User | null> {
  try {
    const response = await axiosInstance.put(
      `/api/auth/users/${userId}/rename`,
      null,
      {
        params: { newName }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error renaming user:', error);
    return null;
  }
}

// Thêm album vào danh sách yêu thích (Library)
// Tự động tăng favourite count của album
export async function addFavouriteAlbum(userId: string, albumId: string): Promise<boolean> {
  try {
    // Bước 1: Thêm album vào library backend
    const addedToLibrary = await addAlbumToLibrary(userId, albumId);
    
    if (!addedToLibrary) {
      console.error('Failed to add album to library');
      return false;
    }

    // Bước 2: Lấy thông tin album hiện tại để cập nhật favourite count
    const album = await getAlbumById(albumId);
    if (album) {
      // Tăng favourite count của album
      await updateAlbumFavourites(albumId, album.favourites + 1);
    }

    return true;
  } catch (error) {
    console.error('Error adding favourite album:', error);
    return false;
  }
}

// Xóa album khỏi danh sách yêu thích (Library)
// Tự động giảm favourite count của album
export async function removeFavouriteAlbum(userId: string, albumId: string): Promise<boolean> {
  try {
    // Bước 1: Xóa album khỏi library backend
    const removedFromLibrary = await removeAlbumFromLibrary(userId, albumId);
    
    if (!removedFromLibrary) {
      console.error('Failed to remove album from library');
      return false;
    }

    // Bước 2: Lấy thông tin album hiện tại để cập nhật favourite count
    const album = await getAlbumById(albumId);
    if (album) {
      // Giảm favourite count của album
      await updateAlbumFavourites(albumId, Math.max(0, album.favourites - 1));
    }

    return true;
  } catch (error) {
    console.error('Error removing favourite album:', error);
    return false;
  }
}

// Thêm song vào danh sách yêu thích (Library)
export async function addFavouriteSong(userId: string, songId: string): Promise<boolean> {
  try {
    // Thêm song vào library backend
    const addedToLibrary = await addSongToLibrary(userId, songId);
    
    if (!addedToLibrary) {
      console.error('Failed to add song to library');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding favourite song:', error);
    return false;
  }
}

// Xóa song khỏi danh sách yêu thích (Library)
export async function removeFavouriteSong(userId: string, songId: string): Promise<boolean> {
  try {
    // Xóa song khỏi library backend
    const removedFromLibrary = await removeSongFromLibrary(userId, songId);
    
    if (!removedFromLibrary) {
      console.error('Failed to remove song from library');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing favourite song:', error);
    return false;
  }
}

// Thêm artist vào danh sách yêu thích (Library)
export async function addFavouriteArtist(userId: string, artistId: string): Promise<boolean> {
  try {
    // Thêm artist vào library backend
    const addedToLibrary = await addArtistToLibrary(userId, artistId);
    
    if (!addedToLibrary) {
      console.error('Failed to add artist to library');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding favourite artist:', error);
    return false;
  }
}

// Xóa artist khỏi danh sách yêu thích (Library)
export async function removeFavouriteArtist(userId: string, artistId: string): Promise<boolean> {
  try {
    // Xóa artist khỏi library backend
    const removedFromLibrary = await removeArtistFromLibrary(userId, artistId);
    
    if (!removedFromLibrary) {
      console.error('Failed to remove artist from library');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing favourite artist:', error);
    return false;
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

// Lấy thống kê số lượng items trong library
export async function getLibraryStats(userId: string): Promise<{
  songs: number;
  albums: number;
  playlists: number;
  artists: number;
} | null> {
  try {
    const library = await getLibrary(userId);
    if (!library) {
      return {
        songs: 0,
        albums: 0,
        playlists: 0,
        artists: 0,
      };
    }

    return {
      songs: library.favouriteSongs?.length ?? 0,
      albums: library.favouriteAlbums?.length ?? 0,
      playlists: library.favouritePlaylists?.length ?? 0,
      artists: library.favouriteArtists?.length ?? 0,
    };
  } catch (error) {
    console.error('Error getting library stats:', error);
    return {
      songs: 0,
      albums: 0,
      playlists: 0,
      artists: 0,
    };
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
    await axiosInstance.post(`/libraries/${userId}/playlists`, { itemId: playlistId });
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
  getLibraryStats,
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
  getArtistById,
  getSongsByIds,
  getArtistsByIds,
  getPlaylistsByIds,
  searchArtists,
  searchSongs,
  getCurrentUser,
  updateUser,
  renameUser,
  updateAlbum,
  updateAlbumFavourites,
  addFavouriteSong,
  removeFavouriteSong,
  addFavouriteAlbum,
  removeFavouriteAlbum,
  addFavouriteArtist,
  removeFavouriteArtist,
};
