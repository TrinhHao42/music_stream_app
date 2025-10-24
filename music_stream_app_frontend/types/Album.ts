import Artist from './Artist';

type Album = {
    id: number;
    title: string;
    artist: Artist;
    numsOfSongs: number;
    image: string;
}

export default Album;
