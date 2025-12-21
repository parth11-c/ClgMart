export type Product = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  imageUri: string; // mapped from image_url
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  category: string;
  status: 'active' | 'sold' | 'inactive';
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
};

export type User = {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  email?: string;
};

export type Theme = 'dark' | 'light';

export type StoreState = {
  currentUser: User;
  posts: Product[];
  users: Record<string, User>;
  theme: Theme;
};
