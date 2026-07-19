export interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
