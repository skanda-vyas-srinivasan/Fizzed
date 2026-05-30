import type { Profile, Rating, Soda } from "@/lib/types";

export const mockSodas: Soda[] = [
  {
    id: "coca-cola-original",
    name: "Coca-Cola Original",
    brand: "The Coca-Cola Company",
    country: "United States",
    category: "Cola",
    flavor_tags: ["Cola", "Classic", "Caramel"],
    image_url: null,
    avg_rating: 4.2,
    total_ratings: 48291
  },
  {
    id: "jarritos-mandarin",
    name: "Jarritos Mandarin",
    brand: "Jarritos",
    country: "Mexico",
    category: "Citrus",
    flavor_tags: ["Orange", "Cane Sugar", "Imported"],
    image_url: null,
    avg_rating: 4.6,
    total_ratings: 12902
  },
  {
    id: "jones-cream-soda",
    name: "Jones Cream Soda",
    brand: "Jones Soda Co.",
    country: "Canada",
    category: "Cream",
    flavor_tags: ["Vanilla", "Cream", "Cane Sugar"],
    image_url: null,
    avg_rating: 3.8,
    total_ratings: 8120
  },
  {
    id: "bundaberg-ginger-beer",
    name: "Bundaberg Ginger Beer",
    brand: "Bundaberg",
    country: "Australia",
    category: "Ginger",
    flavor_tags: ["Ginger", "Spiced", "Craft"],
    image_url: null,
    avg_rating: 4.4,
    total_ratings: 15991
  }
];

export const mockProfile: Profile = {
  id: "demo-profile",
  username: "skanda_rates",
  bio: "Trying every cold soda I can find.",
  location: "California",
  avatar_url: null
};

export const mockRatings: Rating[] = [
  {
    id: "demo-rating-1",
    user_id: mockProfile.id,
    soda_id: mockSodas[0].id,
    score: 4,
    review_text: "Still the gold standard. That caramel sweetness hits different ice cold from a glass bottle.",
    created_at: new Date().toISOString(),
    profiles: mockProfile,
    sodas: mockSodas[0]
  },
  {
    id: "demo-rating-2",
    user_id: mockProfile.id,
    soda_id: mockSodas[1].id,
    score: 5,
    review_text: "Punchy, bright, and not syrupy. This is what orange soda should taste like.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    profiles: mockProfile,
    sodas: mockSodas[1]
  }
];
