import { uploadImageOnServer } from "~/helper/handleImage";
import { ICreateProduct, IFilter, IProduct } from "~/interface";
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosPut,
} from "~/ultils/configAxios";

const getProducts = async () => {
  return await axiosGet(`/product`);
};

const getProduct = async (product_id: string) => {
  return await axiosGet(`/product/${product_id}`);
};

const searchProduct = async (filter: IFilter) => {
  return axiosPost("/product/search", filter)
}

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

const createProduct = async (data: ICreateProduct) => {
  return await axiosPost("/product", data);
};

const updateProduct = async (
  product_id: string,
  data: Partial<IProduct>
) => {
  return await axiosPut(`/product/${product_id}`, data);
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
  searchProduct,
  createProduct,
  updateProduct,
  uploadThumbnailProduct,
  deleteProduct,
};
