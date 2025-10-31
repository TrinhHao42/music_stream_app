import { AlbumEmbedded } from './embedded';

type Song = {
  songId: string;
  title: string;
  release: string;
  duration: number;
  listens: number;
  likes: number;
  audioUrl: string;
  coverUrl: string;
  album: AlbumEmbedded;
  artist: string[];
};

export default Song;
