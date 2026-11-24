BEGIN;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL, -- display_name is not unique to allow for common names
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  score SMALLINT NOT NULL,
  review TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  user_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  review_id BIGINT NOT NULL REFERENCES reviews (review_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, review_id)
);

-- follower_id follows following_id; each directed relationship is unique.
CREATE TABLE IF NOT EXISTS follows (
  follower_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Support user feeds and user counts.
CREATE INDEX IF NOT EXISTS reviews_user_created_at_idx
  ON reviews (user_id, created_at DESC, review_id DESC);
-- Support newest-first feeds and review counts.
CREATE INDEX IF NOT EXISTS reviews_created_at_idx
  ON reviews (created_at DESC, review_id DESC);
-- Support review like counts and like feeds.
CREATE INDEX IF NOT EXISTS likes_review_id_idx ON likes (review_id);
-- Support follower feeds and follower counts.
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows (following_id);

-- The backend's service_role bypasses RLS and must enforce user authorization.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE users, reviews, likes, follows
  TO service_role;

COMMIT;
