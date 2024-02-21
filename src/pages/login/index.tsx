import { AxiosError } from "axios";
import { getCookies } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, FormEvent, useEffect } from "react";

import { ButtonClassic } from "~/components/Button";
import ImageCus from "~/components/Image/ImageCus";
import { InputText, InputPassword } from "~/components/InputField";
import Loading from "~/components/Loading";
import { loginReducer, logoutReducer } from "~/store/slice";
import { AxiosResponseCus } from "~/interface";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { axiosPost } from "~/ultils/configAxios";
import { getUser } from "~/api-client";

interface IDataSend {
  email: string | null;
  password: string | null;
}

const initData: IDataSend = {
  email: null,
  password: null,
};

const LoginPage = () => {
  const router = useRouter();
  const { logout } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [data, setData] = useState<IDataSend>(initData);

  const [loading, setLoading] = useState<boolean>(false);
  const [checkLogin, setCheckLogin] = useState<boolean>(true);

  const [message, setMessage] = useState<string | null>(null);

  const onChangeData = (name: string, value: string) => {
    if (message) {
      setMessage(null);
    }

    setData({ ...data, [name]: value });
  };

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      setMessage("Please input field");
    }

    setLoading(true);

    try {
      const res = await axiosPost("/oauth/access-token", data);

      const dataRes = {
        name: res.name,
        email: res.email,
      };
      dispatch(loginReducer(dataRes));
      dispatch(logoutReducer(false));
      router.push("/");
    } catch (err) {
      const error = err as AxiosError;
      if (error?.response) {
        const { status, data: responseErr } =
          error.response as unknown as AxiosResponseCus;

        if (status === 400) {
          setMessage("Something wrong");
        }

        if (status === 401 || status === 404) {
          setMessage("Email or Password incorrect");
          setData({ ...data, password: null });
        }
      }
    }

    setLoading(false);
  };

  const handleCheckLogin = async () => {
    try {
      const res = await getUser();
      const dataRes = {
        name: res.fullName,
        email: res.email,
      };

      router.push("/");
      dispatch(loginReducer(dataRes));
    } catch (error) {
      setCheckLogin(false);
    }
  };

  useEffect(() => {
    if (!logout) {
      handleCheckLogin();
      return;
    }

    setCheckLogin(false);
  }, []);

  if (checkLogin) {
    return <Loading />;
  }

  return (
    <div className="bg_login flex items-center justify-center h-screen">
      <div className="lg:min-w-[1000px] md:w-4/6 sm:w-5/6 w-full flex items-start bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="lg:block hidden">
          <ImageCus
            src="/login_bg.svg"
            title="Login"
            alt="Login"
            className="w-[500px] h-[600px]"
          />
        </div>
        <div className="lg:w-6/12 w-full md:px-10 px-5 pt-10 pb-20">
          <h1 className="lg:text-3xl text-2xl w-fit font-medium mx-auto">
            Login
          </h1>

          <form onSubmit={onLogin} method="POST" className="flex flex-col">
            <div className="flex flex-col items-start mt-5 gap-5">
              <InputText
                title="Email"
                width="w-full"
                value={data.email || ""}
                name="email"
                required={true}
                size="M"
                placeholder="Your Email..."
                getValue={onChangeData}
              />
              <InputPassword
                title="Email"
                width="w-full"
                value={data.password || ""}
                placeholder={"Password..."}
                name="password"
                required={true}
                size="M"
                getValue={onChangeData}
              />

              {message && <p className="text-base text-error">{message}</p>}
            </div>

            <div className="mt-5">
              <ButtonClassic
                loading={loading}
                title="Login"
                size="L"
                className="w-full flex items-center justify-center h-[52px] bg-primary"
              />

              <div className="flex items-center justify-center">
                <Link
                  className="block hover:underline hover:text-primary my-5"
                  href="/"
                >
                  Quên mật khẩu
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
