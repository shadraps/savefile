export type User = {
  user_id: number;
  username: string;
  display_name: string;
  created_at: string;
};

export type Review = {
  review_id: number;
  user_id: number;
  game_name: string;
  score: number;
  review: string;
  created_at: string;
};

export type Like = {
  user_id: number;
  review_id: number;
  created_at: string;
};

export type Follow = {
  follower_id: number;
  following_id: number;
  created_at: string;
};

export type Profile = {
  user: User
  reviews: Review[]
  followingCount: number
  followerCount: number
}

export type GamePlatform = {
    id?: number
    slug?: string
    name?: string
}

export type GameRating = {
    id?: number
    title?: string
    count?: number
    percent?: number
}

export type Game = {
    id?: number
    slug?: string
    name?: string
    released?: string | null
    tba?: boolean
    background_image?: string | null
    rating: number
    rating_top?: number
    ratings?: GameRating[]
    ratings_count?: number
    reviews_text_count?: number | string
    added?: number
    added_by_status?: Record<string, number> | null
    metacritic?: number | null
    playtime?: number
    suggestions_count?: number
    updated?: string
    esrb_rating?: {
        id?: number
        slug?: string
        name?: string
    } | null
    platforms?: {
        platform?: GamePlatform
        released_at?: string | null
        requirements?: {
            minimum?: string
            recommended?: string
        } | null
    }[] | null
}