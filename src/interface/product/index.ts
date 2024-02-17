interface IValueOption {
  label: string;
  _id?: string;
}

interface IOptionProduct {
  code: string;
  name: string;
  values: IValueOption[];
}

interface ISpecificationAttributes {
  id: string;
  name: string;
}

interface ISpecificationsProduct {
  id: string;
  name: string;
  attributes: ISpecificationAttributes[];
}

interface IImageProduct {
  imageUrl: string;
  order: number;
}

interface IAttributeProduct {
  id: string;
  name: string;
  // order: number;
}

interface ICategoryProduct {
  id: string;
  name: string;
}

interface IProduct {
  id: string;
  name: string;
  seoName: string;
  picture: string | null;
  overview: string;
  description: string;
  category: ICategoryProduct | null;
  material: string | null;
  slug: string;
  sku: string | null;
  brand: string | null;
  isHot: boolean;
  images: IImageProduct[];
  tags: string[];
  sizes:  IAttributeProduct[];
  colours:  IAttributeProduct[];
  isNew: boolean;
  isShow: boolean;
  isDeleted: boolean;
  wholesalePrice: number;
  specialPrice: number;
  price: number;
  createdDate: string;
}

type ICreateProduct = Omit<IProduct, "id" | "slug" | "createdDate" | "isDeleted">;

interface IVariantProduct extends IProduct {
  product_id: string;
  available: boolean;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  options: string[];
  url: string | null;
}

export type {
  IProduct,
  IImageProduct,
  IVariantProduct,
  IOptionProduct,
  ISpecificationsProduct,
  ICategoryProduct,
  ICreateProduct,
  ISpecificationAttributes,
  IAttributeProduct,
  IValueOption,
};
