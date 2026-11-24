export type User = {
  id: number;
  username: string;
  displayName: string;
  createdAt: string;
};

export type Review = {
  reviewId: number;
  userId: number;
  score: number;
  review: string;
  createdAt: string;
};

export type Like = {
  userId: number;
  reviewId: number;
  createdAt: string;
};

export type Follow = {
  followerId: number;
  followingId: number;
  createdAt: string;
};
