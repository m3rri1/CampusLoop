export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'electronics' | 'books' | 'stationery' | 'clothing' | 'other';
  categoryLabel: string;
  condition: 'new' | 'like-new' | 'used';
  imageUrl: string;
  location: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  postedAgo: string;
  createdAt: string;
}