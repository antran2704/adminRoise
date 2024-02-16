import { uploadImageOnServer } from "~/helper/handleImage";
import { IFilter, ISendProduct } from "~/interface";
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "~/ultils/configAxios";

const getProducts = async (page: number = 1) => {
  return await axiosGet(`/admin/products?page=${page}`);
};

const getProduct = async (product_id: string) => {
  return await axiosGet(`/admin/products/id/${product_id}`);
};

const getProductsWithFilter = async (
  filter: IFilter | null,
  page: number = 1
) => {
  return await axiosGet(
    `/admin/products/search?search=${filter?.search || ""}&category=${
      filter?.category || ""
    }&page=${page}`
  );
};

const createProduct = async (data: ISendProduct) => {
  return await axiosPost("/admin/products", data);
};

const updateProduct = async (
  product_id: string,
  data: Partial<ISendProduct>
) => {
  return await axiosPatch(`/admin/products/${product_id}`, data);
};

const uploadThumbnailProduct = async (formData: FormData) => {
  return await uploadImageOnServer(
    `${process.env.NEXT_PUBLIC_ENDPOINT_API}/admin/products/uploadImage`,
    formData
  );
};

const deleteProduct = async (product_id: string) => {
  return await axiosDelete(`/admin/products/${product_id}`);
};

export {
  getProducts,
  getProduct,
  getProductsWithFilter,
  createProduct,
  updateProduct,
  uploadThumbnailProduct,
  deleteProduct,
};
