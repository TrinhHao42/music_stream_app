type Artist = {
  artistId: string;
  artistName: string;
  albums: {
    albumName: string;
    image?: string;
  }[] | null;
  songs: {
    title: string;
    coverUrl?: string;
  }[];
  followers: number;
};

export default Artist;
