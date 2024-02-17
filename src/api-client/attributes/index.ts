import { IAttribute, IFilter, ISendAttribute } from "~/interface";
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "~/ultils/configAxios";

const getSizes = async () => {
  return await axiosGet("/size");
};

const getColours = async () => {
  return await axiosGet("/colour");
};

const getAttributes = async (page: number = 1) => {
  return await axiosGet(`/attributes?page=${page}`);
};

const getChildAttributes = async (attribute_id: string) => {
  return await axiosGet(`/attributes/${attribute_id}`);
};

const getAttributesAvailable = async () => {
  return await axiosGet(`/attributes/available`);
};

const getAttributesWithFilter = async (
  filter: IFilter | null,
  page: number = 1
) => {
  return await axiosGet(
    `/attributes/search?search=${filter?.search || ""}&page=${page}`
  );
};

const updateAttribute = async (
  attribute_id: string,
  options?: Partial<IAttribute>
) => {
  return await axiosPatch(`/attributes/${attribute_id}`, {
    ...options,
  });
};

const updateChildAttribute = async (
  attribute_id: string,
  children_id: string,
  data: any
) => {
  return await axiosPatch(`/attributes/child/${attribute_id}`, {
    children_id,
    ...data,
  });
};

const createdAttribute = async (data: ISendAttribute) => {
  return await axiosPost("/attributes", data);
};

const createChildAttribute = async (attribute_id: string, data: any) => {
  return await axiosPost(`/attributes/child/${attribute_id}`, data);
};

const deleteAttribute = async (attribute_id: string) => {
  return await axiosDelete(`/attributes/${attribute_id}`);
};

const deleteChildAttribute = async (
  attribute_id: string,
  children_id: string
) => {
  return await axiosPatch(`/attributes/child/delete`, {
    parent_id: attribute_id,
    children_id,
  });
};

export {
  getColours,
  getSizes,
  getAttributes,
  getChildAttributes,
  getAttributesAvailable,
  getAttributesWithFilter,
  updateAttribute,
  updateChildAttribute,
  createdAttribute,
  createChildAttribute,
  deleteAttribute,
  deleteChildAttribute,
};
