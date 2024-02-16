import { ISelectItem } from "../Select";

interface IVariant {
  _id: string;
  name: string;
  public: boolean;
}

type INewVariant = Omit<IVariant, "_id">

interface IAttribute {
  _id: string;
  code: string;
  name: string;
  variants: IVariant[] | ISelectItem[];
  public: boolean;
  createdAt?: string;
  updateAt?: string;
}

interface ISendAttribute {
  code: string;
  name: string;
  variants: Omit<IVariant, "_id">[];
  public: boolean;
}

export type { IVariant, IAttribute, INewVariant, ISendAttribute };
