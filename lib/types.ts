export type Soda = {
  id: string;
  name: string;
  brand: string;
  country: string;
  category: string;
  flavor_tags: string[];
  image_url: string | null;
  avg_rating: number;
  total_ratings: number;
};

export type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
};

export type Rating = {
  id: string;
  user_id: string;
  soda_id: string;
  score: number;
  review_text: string | null;
  created_at: string;
  profiles?: Profile | null;
  sodas?: Soda | null;
};

export type RatingBreakdown = {
  score: number;
  count: number;
};
