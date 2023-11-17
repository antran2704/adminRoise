import { IParentCategory } from "../category";

interface IOptionProduct {
  code: string;
  name: string;
  values: [
    {
      label: string;
      _id: string;
    }
  ];
}

interface ISpecificationsProduct {
  name: String;
  attributes: [
    {
      name: String;
      value: String;
    }
  ];
}

interface IVariantProduct {
  id: string | null;
  product_id: string;
  title: string;
  barcode: string;
  available: boolean;
  price: number;
  promotion_price: number;
  sku: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  options: [{ type: String }];
  thumbnail_url: string | null;
  url: string | null;
  inventory_quantity: number;
  sold: number;
  public: boolean;
}

interface IProductData {
  _id: string | null;
  title: string;
  category: IParentCategory;
  slug: string;
  type: [];
  shortDescription: string;
  description: string;
  price: number;
  promotionPrice: number | null;
  options: IOptionProduct;
  inventory: number;
  thumbnail: string;
  gallery: string[];
  brand: string | null;
  hotProduct: boolean | false;
  public: boolean | true;
  specifications: ISpecificationsProduct;
  viewer: number;
  rate: number;
  variants: IVariantProduct[];
  createdAt: string;
}

type IProductHome = Pick<
  IProductData,
  | "_id"
  | "title"
  | "public"
  | "price"
  | "promotionPrice"
  | "inventory"
  | "category"
  | "thumbnail"
>;

export type { IProductData, IProductHome, IVariantProduct, IOptionProduct };
