type User = {
  userId: string;
  userName: string;
  playlists: string[];
  followList: string[]; // artist IDs
  likeList: string[]; // song IDs
  favouriteAlbums: string[]; // album IDs
};

export default User;


