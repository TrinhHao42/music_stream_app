import { AlbumEmbedded, SongEmbedded } from './embedded';

type Artist = {
  artistId: string;
  artistName: string;
  albums: AlbumEmbedded[];
  songs: SongEmbedded[];
  followers: number;
};

export default Artist;
