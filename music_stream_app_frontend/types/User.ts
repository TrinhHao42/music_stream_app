type User = {
  userId: string;
  userName: string;
  gender: boolean;
  birthday: string; // ISO date string (LocalDate backend)
  playlists: string[];
  followList: string[]; // artist IDs
  likeList: string[]; // song IDs
  favouriteAlbums: string[]; // album IDs
};

export default User;


