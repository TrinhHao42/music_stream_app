import { Album, Artist, Song } from '@/types';
import Playlist from '@/types/Playlist';
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
    const response = await axiosInstance.get(`/api/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching playlist by id:', error);
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

// Thêm album vào danh sách yêu thích
export async function addFavouriteAlbum(user: User, album: Album): Promise<User | null> {
  try {
    // Tạo user mới với album được thêm vào favouriteAlbums
    const updatedFavouriteAlbums = [...(user.favouriteAlbums || [])];
    if (!updatedFavouriteAlbums.includes(album.albumId)) {
      updatedFavouriteAlbums.push(album.albumId);
    }

    // Tạo user object mới với tất cả thông tin cũ + favouriteAlbums mới
    const updatedUserData: Partial<User> = {
      userName: user.userName,
      playlists: user.playlists,
      followList: user.followList,
      likeList: user.likeList,
      favouriteAlbums: updatedFavouriteAlbums,
    };

    // Bước 1: Cập nhật user (quan trọng nhất)
    const updatedUser = await updateUser(user.userId, updatedUserData);
    
    if (!updatedUser) {
      return null;
    }

    // Bước 2: Cập nhật album favourites (có thể fail nhưng không ảnh hưởng user)
    updateAlbumFavourites(album.albumId, album.favourites + 1).catch((error) => {
      console.error('Failed to update album favourites, but user is updated:', error);
    });

    return updatedUser;
  } catch (error) {
    console.error('Error adding favourite album:', error);
    return null;
  }
}

// Xóa album khỏi danh sách yêu thích
export async function removeFavouriteAlbum(user: User, album: Album): Promise<User | null> {
  try {
    // Tạo user mới với album được xóa khỏi favouriteAlbums
    const updatedFavouriteAlbums = (user.favouriteAlbums || []).filter(id => id !== album.albumId);

    // Tạo user object mới với tất cả thông tin cũ + favouriteAlbums mới
    const updatedUserData: Partial<User> = {
      userName: user.userName,
      playlists: user.playlists,
      followList: user.followList,
      likeList: user.likeList,
      favouriteAlbums: updatedFavouriteAlbums,
    };

    // Bước 1: Cập nhật user (quan trọng nhất)
    const updatedUser = await updateUser(user.userId, updatedUserData);
    
    if (!updatedUser) {
      return null;
    }

    // Bước 2: Cập nhật album favourites (có thể fail nhưng không ảnh hưởng user)
    updateAlbumFavourites(album.albumId, Math.max(0, album.favourites - 1)).catch((error) => {
      console.error('Failed to update album favourites, but user is updated:', error);
    });

    return updatedUser;
  } catch (error) {
    console.error('Error removing favourite album:', error);
    return null;
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
  getArtistById,
  getSongsByIds,
  getArtistsByIds,
  getPlaylistById,
  getPlaylistsByIds,
  searchArtists,
  searchSongs,
  getCurrentUser,
  updateUser,
  updateAlbum,
  updateAlbumFavourites,
  addFavouriteAlbum,
  removeFavouriteAlbum,
};
