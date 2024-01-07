import { uploadImageOnServer } from "~/helper/handleImage";
import { IDataCategory, IFilter } from "~/interface";
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "~/ultils/configAxios";

const getCategories = async (page: number = 1) => {
  return await axiosGet(`/categories?page=${page}`);
};

const getCategory = async (category_id: string) => {
  return await axiosGet(`/categories/id/${category_id}`);
};


const getParentCategories = async () => {
  return await axiosGet("categories/parent");
};

const getAllCategories = async () => {
  return await axiosGet(`/categories`);
};

const getCategoriesWithFilter = async (
  filter: IFilter | null,
  page: number = 1
) => {
  return await axiosGet(
    `/categories/search?search=${filter?.search || ""}&page=${page}`
  );
};

const createCategory = async (data: Partial<IDataCategory>) => {
  return await axiosPost("/categories", data);
};

const updateCategory = async (
  category_id: string,
  data: Partial<IDataCategory>
) => {
  return await axiosPatch(`/categories/${category_id}`, data);
};

const uploadThumbnailCategory = async (formData: FormData) => {
  return await uploadImageOnServer(
    `${process.env.NEXT_PUBLIC_ENDPOINT_API}/categories/uploadThumbnail`,
    formData
  );
};

const deleteCategory = async (category_id: string) => {
  return await axiosDelete(`/categories/${category_id}`);
};

export {
  getCategories,
  getAllCategories,
  getParentCategories,
  getCategoriesWithFilter,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
  uploadThumbnailCategory,
};
