import { useEffect, useState } from 'react';
import type { Review } from '../types';
import { getFollowingReviews } from '../api';

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect( () => {
    getFollowingReviews()
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, []);

  if (loading) return <>Loading...</>;
  if (error) return <>{error}</>;

  return (
    <>
      <h1>Following Reviews</h1>
      <ul>
        {reviews.map((review) => (
          <li key={review.reviewId}>{review.review}</li>
        ))}
      </ul>
    </>
  );
};
