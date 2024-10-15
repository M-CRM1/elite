type BannerImage = {
  id: number;
  category_id: number;
  name: string;
  image: string;
  sort: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type Category = {
  id: number;
  name: string;
  sort: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  banner_images: BannerImage[];
};