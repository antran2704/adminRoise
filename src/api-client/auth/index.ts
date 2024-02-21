import { axiosGet, axiosPost } from "~/ultils/configAxios";

const getUser = async () => {
  return await axiosGet("/oauth/user-profile");
};

const logout = async () => {
  return await axiosPost("/oauth/logout", {});
}

const getRefreshToken = async () => {
  return await axiosGet("/admin/refreshToken");
};

export { getRefreshToken, getUser, logout };
