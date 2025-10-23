import Artist from "./Artist";

type Song = {
    id: number;
    title: string;
    artist: Artist;
    duration: number;
    views: number;
    image: string;
}

export default Song;
