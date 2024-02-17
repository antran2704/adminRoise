interface IThumbnailUrl {
  source: FileList | {};
  url: string;
}

interface IOption {
  title: string;
}

interface IBreadcrumbCategory {
  label: string;
  url_path: string;
}

interface IParentCategory {
  _id: string | null;
  title: string;
}

interface IDataCategory {
  _id?: string | null;
  parent_id: IParentCategory | string | null;
  childrens?: string[];
  title: string;
  description: string;
  slug?: string | null;
  meta_title?: string;
  meta_description?: string;
  public: boolean;
  thumbnail: string | null;
  breadcrumbs?: IBreadcrumbCategory[] | string[];
  createdAt?: string;
}

interface IObjectCategory {
  [key: string]: {
    _id: string;
    parent_id: string | null;
    childrens: string[];
    slug: string;
    title: string;
  };
}

interface ICategorySelect {
  title: string | null;
  node_id: string | null;
}

interface ICategory {
  id: string;
  name: string;
  order?: number;
}

export type {
  IThumbnailUrl,
  ICategory,
  IOption,
  IDataCategory,
  IParentCategory,
  ICategorySelect,
  IObjectCategory,
  IBreadcrumbCategory,
};
