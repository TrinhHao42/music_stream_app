type Artist = {
  artistId: string;
  artistName: string;
  artistImg: string;
  albums: {
    albumName: string;
    image?: string;
  }[] | null;
  songs: {
    songId: string;
    title: string;
    coverUrl?: string;
  }[];
  followers: number;
  type: 'artist';
};

export default Artist;
