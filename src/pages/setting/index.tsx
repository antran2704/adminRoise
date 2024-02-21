import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Thumbnail from "~/components/Image/Thumbnail";
import { InputText, InputPassword } from "~/components/InputField";
import Loading from "~/components/Loading";
import Popup from "~/components/Popup";
import { uploadImageOnServer } from "~/helper/handleImage";
import { IUserInfor } from "~/interface";
import FormLayout from "~/layouts/FormLayout";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { loginReducer } from "~/store/slice";
import { axiosPatch, axiosPost } from "~/ultils/configAxios";

interface IPassword {
  password: string | null;
  newPassword: string | null;
  reNewPassword: string | null;
}

const initPassword: IPassword = {
  password: null,
  newPassword: null,
  reNewPassword: null,
};

const SettingPage = () => {
  const dispatch = useAppDispatch();
  const { infor } = useAppSelector((state) => state.user);
  const [user, setUser] = useState<IUserInfor>(infor);
  const [passwordData, setPasswordData] = useState<IPassword>(initPassword);
  // const [avartar, setAvartar] = useState<string | null>(infor.avartar);

  const [loadingAvartar, setLoadingAvartar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const onShowPopup = () => {
    setShowPopup(!showPopup);
  };

  const changePassword = useCallback(
    (name: string, value: string) => {
      setPasswordData({ ...passwordData, [name]: value });
    },
    [passwordData]
  );

  const changeValue = useCallback(
    (name: string, value: string) => {
      setUser({ ...user, [name]: value });
    },
    [user]
  );

  // const uploadAvartar = useCallback(
  //   async (source: File) => {
  //     if (source) {
  //       const formData: FormData = new FormData();
  //       formData.append("image", source);
  //       setLoadingAvartar(true);

  //       try {
  //         const { status, payload } = await uploadImageOnServer(
  //           `${process.env.NEXT_PUBLIC_ENDPOINT_API}/admin/avartar`,
  //           formData
  //         );

  //         if (status === 201) {
  //           setAvartar(payload);
  //         }
  //       } catch (error) {
  //         toast.error("Upload avartar failed", {
  //           position: toast.POSITION.TOP_RIGHT,
  //         });
  //         console.log(error);
  //       }

  //       setLoadingAvartar(false);
  //     }
  //   },
  //   [avartar, loadingAvartar]
  // );

  // const handleChangePassword = async () => {
  //   const { password, newPassword, reNewPassword } = passwordData;
  //   if (!password || !newPassword || !reNewPassword) {
  //     toast.error("Vui lòng nhập đầy đủ  thông tin", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });

  //     return;
  //   }

  //   if (newPassword !== reNewPassword) {
  //     setPasswordData({ ...passwordData, reNewPassword: null });
  //     toast.error("Vui lòng nhập lại mật khâủ mới", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });

  //     return;
  //   }

  //   try {
  //     const sendData = {
  //       email: user.email,
  //       password,
  //       newPassword,
  //     };

  //     const { status } = await axiosPost("/admin/changePassword", sendData);

  //     if (status === 201) {
  //       onShowPopup();
  //       toast.success("Thay đổi thành công", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });
  //       setPasswordData(initPassword);
  //     }
  //   } catch (err) {
  //     const error = err as AxiosError;

  //     if (!error.response) {
  //       toast.error("Server is busy, please try again", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });

  //       return;
  //     }
  //     const { status } = error.response;

  //     if (status === 500) {
  //       toast.error("Server is busy, please try again", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });

  //       return;
  //     }

  //     if (status === 401) {
  //       toast.error("Mật khẩu không đúng", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });
  //       setPasswordData(initPassword);
  //       return;
  //     }

  //     if (status === 400) {
  //       toast.error("Thay đổi không thành công", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });

  //       return;
  //     }

  //     console.log(error);
  //   }
  // };

  // const handleOnSubmit = async () => {
  //   setLoading(true);

  //   try {
  //     const { status, payload } = await axiosPatch(`/admin/${user._id}`, {
  //       name: user.name ? user.name : infor.name,
  //       email: user.email ? user.email : infor.email,
  //       avartar,
  //     });

  //     if (status !== 201) {
  //       toast.error("Upload setting failed", {
  //         position: toast.POSITION.TOP_RIGHT,
  //       });

  //       return;
  //     }

  //     toast.success("Upload setting success", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });

  //     dispatch(loginReducer(payload));
  //   } catch (error) {
  //     toast.error("Upload setting failed", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });
  //     console.log(error);
  //   }

  //   setLoading(false);
  // };

  return (
    <FormLayout
      title="Quản lý tài khoản"
      backLink="/"
      onSubmit={() => {}}
    >
      <div>
        <div className="my-5">
          <h3 className="md:text-lg text-base font-medium">
            Tài khoản của bạn
          </h3>
        </div>

        <InputText
          title="Email"
          width="lg:w-2/4 w-full my-5"
          value={user.email}
          name="email"
          placeholder="Your Email..."
          getValue={changeValue}
        />

        <InputText
          title="Name"
          width="lg:w-2/4 w-full my-5"
          value={user.name || ""}
          name="name"
          placeholder="Your Name..."
          getValue={changeValue}
        />

        {/* <div className="my-5">
          <span className="block text-base text-[#1E1E1E] font-medium">
            Password
          </span>

          <button
            onClick={onShowPopup}
            className="bg-primary text-white text-base px-5 py-2 mt-2 rounded-lg"
          >
            Thay đổi mật khẩu
          </button>
        </div>

        <div>
          <Thumbnail
            url={avartar}
            loading={loadingAvartar}
            onChange={uploadAvartar}
          />
        </div> */}

        {loading && <Loading />}

        {/* {showPopup && (
          <Popup
            title="Thay đổi mật khẩu"
            show={showPopup}
            onClose={onShowPopup}
          >
            <div>
              <div className="mb-10">
                <InputPassword
                  title="Mật khẩu cũ"
                  width="w-full my-5"
                  value={passwordData.password || ""}
                  name="password"
                  getValue={changePassword}
                />

                <InputPassword
                  title="Mật khẩu mới"
                  width="w-full my-5"
                  value={passwordData.newPassword || ""}
                  name="newPassword"
                  getValue={changePassword}
                />

                <InputPassword
                  title="Nhập lại mật khẩu mới"
                  width="w-full my-5"
                  value={passwordData.reNewPassword || ""}
                  name="reNewPassword"
                  enableEnter={true}
                  onEnter={handleChangePassword}
                  getValue={changePassword}
                />
              </div>

              <div className="flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-2">
                <button
                  onClick={onShowPopup}
                  className="lg:w-fit w-full text-lg font-medium bg-[#e2e2e2] px-5 py-1 rounded-md transition-cus"
                >
                  Cancle
                </button>
                <button
                  onClick={handleChangePassword}
                  className="lg:w-fit w-full text-lg text-white font-medium bg-primary px-5 py-1 rounded-md"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </Popup>
        )} */}
      </div>
    </FormLayout>
  );
};

export default SettingPage;
