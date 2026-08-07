export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'electronics' | 'books' | 'stationery' | 'clothing' | 'other';
  condition: 'new' | 'like-new' | 'used';
  imageUrl: string;
  sellerName: string;
  sellerRating: number;
  createdAt: string;
}