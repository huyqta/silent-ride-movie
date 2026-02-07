// Movie Types for OPhim API

export interface Movie {
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    type: "single" | "series" | "hoathinh" | "tvshows";
    thumb_url: string;
    poster_url: string;
    sub_docquyen: boolean;
    chipiuliui: boolean;
    time: string;
    episode_current: string;
    quality: string;
    lang: string;
    year: number;
    category: Category[];
    country: Country[];
    tmdb?: {
        type?: string;
        id?: string;
        season?: number;
        vote_average?: number;
        vote_count?: number;
    };
    imdb?: {
        id?: string;
    };
}

export interface MovieDetail extends Movie {
    content: string;
    status: string;
    showtimes: string;
    episode_total: string;
    actor: string[];
    director: string[];
    trailer_url: string;
    notify: string;
    view: number;
    episodes: Episode[];
}

export interface Episode {
    server_name: string;
    server_data: EpisodeData[];
}

export interface EpisodeData {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Country {
    id: string;
    name: string;
    slug: string;
}

export interface Person {
    tmdb_people_id: number;
    name: string;
    original_name: string;
    character: string;
    known_for_department: string;
    profile_path: string | null;
}

export interface MoviePeoplesResponse {
    success: boolean;
    message: string;
    data: {
        tmdb_id: number;
        tmdb_type: string;
        ophim_id: string;
        slug: string;
        imdb_id: string;
        peoples: Person[];
    };
}

// API Response Types
export interface MoviesResponse {
    status: string;
    msg: string;
    data: {
        seoOnPage: SEOOnPage;
        breadCrumb: BreadCrumb[];
        titlePage: string;
        items: Movie[];
        params: {
            type_slug: string;
            filterCategory: string[];
            filterCountry: string[];
            filterYear: string;
            filterType: string;
            sortField: string;
            sortType: string;
            pagination: Pagination;
        };
    };
}

export interface MovieDetailResponse {
    status: boolean;
    msg: string;
    movie: MovieDetail;
    episodes: Episode[];
}

export interface SearchResponse {
    status: string;
    msg: string;
    data: {
        seoOnPage: SEOOnPage;
        breadCrumb: BreadCrumb[];
        titlePage: string;
        items: Movie[];
        params: {
            keyword: string;
            pagination: Pagination;
        };
    };
}

export interface SEOOnPage {
    og_type: string;
    titleHead: string;
    descriptionHead: string;
    og_image: string[];
    og_url: string;
}

export interface BreadCrumb {
    name: string;
    slug?: string;
    isCurrent: boolean;
    position: number;
}

export interface Pagination {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
}

// Local Storage Types
export interface WatchProgress {
    [movieSlug: string]: {
        episode: string;
        episodeName: string;
        currentTime: number;
        duration: number;
        updatedAt: number;
    };
}

export interface WatchHistoryItem {
    slug: string;
    name: string;
    thumb: string;
    episode: string;
    episodeName: string;
    watchedAt: number;
}

export interface FavoriteItem {
    slug: string;
    name: string;
    thumb: string;
    year: number;
    quality: string;
    addedAt: number;
}

// Navigation types
export interface NavItem {
    name: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}
