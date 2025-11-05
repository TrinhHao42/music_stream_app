import { SongEmbedded } from './embedded';

type Album = {
  albumId: string;
  albumName: string;
  release: string;
  listens: number;
  favourites: number;
  image: string;
  artists: string[];
  songs: SongEmbedded[];
  type: 'album';
};

export default Album;
