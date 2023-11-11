interface IVariant {
  _id: string;
  name: string;
  public: boolean;
}

interface IAttribute {
  _id?: string;
  code: string;
  name: string;
  variants?: IVariant[] | string[];
  public: boolean;
  createdAt?: string;
  updateAt?: string;
}

export type { IVariant, IAttribute };
