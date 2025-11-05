type User = {
  userId: string;
  userName: string;
  playlists: string[];
  followList: string[]; // artist IDs
  likeList: string[]; // song IDs
  favouriteAlbums: string[]; // album IDs
  isPremium?: boolean; // Premium status
};

export default User;


