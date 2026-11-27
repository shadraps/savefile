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
