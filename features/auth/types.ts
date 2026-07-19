export interface Profile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp_number: string;
  address: string | null;
  theme_color: string;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  currency_code: string;
  currency_symbol: string;
  meta_title: string | null;
  meta_description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
