import axios, { AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { getRefreshToken, logout } from "~/api-client";
import { loginReducer, logoutReducer } from "~/store/slice";
import { AppDispatch } from "~/store";
import { NextRouter } from "next/router";

const httpConfig = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT_API,
});

const axiosGet = async (
  path: string,
  config?: AxiosRequestConfig | undefined
) => {
  const payload = await httpConfig.get(path, { ...config });
  return payload.data;
};

const axiosPost = async <T>(
  path: string,
  data: T,
  config?: AxiosRequestConfig | undefined
) => {
  const payload = await httpConfig.post(path, data, { ...config });
  return payload.data;
};

const axiosPatch = async <T>(
  path: string,
  data: T,
  config?: AxiosRequestConfig | undefined
) => {
  const payload = await httpConfig.patch(path, data, { ...config });
  return payload.data;
};

const axiosDelete = async (
  path: string,
  config?: AxiosRequestConfig | undefined
) => {
  const payload = await httpConfig.delete(path, { ...config });
  return payload.data;
};

let isRefresh = false;
let router: NextRouter;
let dispatch: AppDispatch;

export const injectStore = (_dispatch: AppDispatch) => {
  dispatch = _dispatch;
};

export const injectRouter = (_router: NextRouter) => {
  router = _router;
};

const handleLogout = () => {
  const userInfor = {
    _id: null,
    name: "",
    email: "",
    avartar: null,
  };

  logout();
  dispatch(loginReducer(userInfor));
  dispatch(logoutReducer(true));
  router.push("/login");
};

httpConfig.interceptors.response.use((config) => {
  return config;
});

httpConfig.interceptors.response.use(
  function (response) {
    return response;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      toast.error("Please check your network", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return Promise.reject(error);
    }

    if (!error.response.data) return Promise.reject(error);
    
    const response = error.response.data;

    if (response.status === 500) {
      toast.error("Error in server, please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return Promise.reject(error);
    }

    if (response.status === 403) {
      toast.error("Forbidden, please login", {
        position: toast.POSITION.TOP_RIGHT,
      });
      handleLogout();
      return Promise.reject(error);
    }

    if (response.status === 404 && response.message === "Not found key token") {
      handleLogout();
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (response.status === 401) {
      if (originalRequest.method === "post") {
        return Promise.reject(error);
      }

      if (!isRefresh && !originalRequest._retry) {
        isRefresh = true;

        const { status } = await getRefreshToken();
        if (status === 200) {
          isRefresh = false;

          originalRequest._retry = true;
          return Promise.resolve(httpConfig(originalRequest));
        }
      } else {
        if (router.pathname !== "/login") {
          handleLogout();
        }
        isRefresh = false;
      }
    }

    return Promise.reject(error);
  }
);

export { axiosGet, axiosPatch, axiosPost, axiosDelete };
