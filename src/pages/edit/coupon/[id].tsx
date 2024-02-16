import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import ButtonCheck from "~/components/Button/ButtonCheck";
import { InputText, InputNumber } from "~/components/InputField";
import { EDicount_type, EDiscount_applies } from "~/enums";
import FormLayout from "~/layouts/FormLayout";

import { ICoupon } from "~/interface";
import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";
import { axiosGet, axiosPatch } from "~/ultils/configAxios";
import Thumbnail from "~/components/Image/Thumbnail";
import { uploadImageOnServer } from "~/helper/handleImage";
import { SelectDate, SelectTag } from "~/components/Select";
import Loading from "~/components/Loading";

interface Props {
  query: ParsedUrlQuery;
}

const initData: ICoupon = {
  _id: "",
  discount_code: "",
  discount_name: "",
  discount_value: 0,
  discount_applies: EDiscount_applies.ALL,
  discount_type: EDicount_type.PERCENTAGE,
  discount_product_ids: [],
  discount_start_date: "",
  discount_end_date: "",
  discount_per_user: 0,
  discount_min_value: 0,
  discount_max_uses: 0,
  discount_thumbnail: null,
  discount_active: true,
  discount_public: true,
  discount_used_count: 0,
  discount_user_used: [],
};

const EditCouponPage = (props: Props) => {
  const { query } = props;
  const { id } = query;

  const router = useRouter();

  const [data, setData] = useState<ICoupon>(initData);
  const [fieldsCheck, setFieldsCheck] = useState<string[]>([]);

  const [discountType, setDiscountType] = useState<EDicount_type>(
    EDicount_type.PERCENTAGE
  );

  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);

  const changePublic = useCallback(
    (name: string, value: boolean) => {
      setData({ ...data, [name]: value });
    },
    [data]
  );

  const changeNumber = useCallback(
    (name: string, value: number) => {
      if (fieldsCheck.includes(name)) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
        setFieldsCheck(newFieldsCheck);
      }
      setData({ ...data, [name]: value });
    },
    [data]
  );

  const changeValue = useCallback(
    (name: string, value: string) => {
      if (fieldsCheck.includes(name)) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
        setFieldsCheck(newFieldsCheck);
      }
      setData({ ...data, [name]: value });
    },
    [data, fieldsCheck]
  );

  const onSelectDate = (value: string, name: string) => {
    if (name === "discount_start_date" && new Date(value) < new Date()) {
      toast.info("Start date must be greater than the current time!!!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    if (
      name === "discount_end_date" &&
      (new Date(value) < new Date() ||
        new Date(data.discount_start_date) >= new Date(value))
    ) {
      toast.info("End date must be greater than the Start date!!!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    if (fieldsCheck.includes(name)) {
      const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
      setFieldsCheck(newFieldsCheck);
    }

    setData({ ...data, [name]: value });
  };

  const onChangeDiscountValue = (
    type: EDicount_type,
    name: string,
    value: number
  ) => {
    if (fieldsCheck.includes(name)) {
      const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
      setFieldsCheck(newFieldsCheck);
    }

    if (type === EDicount_type.PERCENTAGE) {
      if (value > 100) {
        toast.info("Discount value must less than 100%", {
          position: toast.POSITION.TOP_RIGHT,
        });

        return;
      }
    }

    setData({ ...data, [name]: value });
  };

  const onSelectDiscountType = (value: string) => {
    setDiscountType(value as EDicount_type);
    setData({ ...data, discount_value: 0 });
  };

  const checkData = (data: any) => {
    let fields = handleCheckFields(data);

    if (fields.length > 0) {
      setFieldsCheck(fields);
      router.push(`#${fields[0]}`);
    }

    return fields;
  };

  const uploadThumbnail = async (source: File) => {
    if (source) {
      if (fieldsCheck.includes("thumbnail")) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, "thumbnail");
        setFieldsCheck(newFieldsCheck);
        ("thumbnail");
      }

      const formData: FormData = new FormData();
      formData.append("thumbnail", source);
      setLoadingThumbnail(true);

      try {
        const { status, payload } = await uploadImageOnServer(
          `${process.env.NEXT_PUBLIC_ENDPOINT_API}/discounts/uploadThumbnail`,
          formData
        );

        if (status === 201) {
          setThumbnail(payload);
          setLoadingThumbnail(false);
        }
      } catch (error) {
        toast.error("Upload thumbnail failed", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setLoadingThumbnail(false);
        console.log(error);
      }
    }
  };

  const covertDate = (timestamps: string) => {
    const value = new Date(timestamps);
    const year = value.getFullYear();
    const month =
      value.getMonth() + 1 < 10
        ? `0${value.getMonth() + 1}`
        : value.getMonth() + 1;
    const date = value.getDate() < 10 ? `0${value.getDate()}` : value.getDate();
    const hours =
      value.getHours() < 10 ? `0${value.getHours()}` : value.getHours();
    const minutes =
      value.getMinutes() < 10 ? `0${value.getMinutes()}` : value.getMinutes();
    console.log(`${year}-${month}-${date}T${hours}:${minutes}`);
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  const handleGetData = async () => {
    setLoading(true);

    try {
      const data = await axiosGet(`/discounts/id/${id}`);
      if (data.status === 200) {
        const {
          _id,
          discount_active,
          discount_applies,
          discount_code,
          discount_name,
          discount_max_uses,
          discount_value,
          discount_min_value,
          discount_per_user,
          discount_public,
          discount_start_date,
          discount_end_date,
          discount_thumbnail,
          discount_type,
          discount_used_count,
          discount_user_used,
          discount_product_ids,
        } = data.payload;

        setData({
          _id,
          discount_active,
          discount_applies,
          discount_code,
          discount_name,
          discount_max_uses,
          discount_value,
          discount_min_value,
          discount_per_user,
          discount_public,
          discount_start_date: covertDate(discount_start_date),
          discount_end_date: covertDate(discount_end_date),
          discount_thumbnail,
          discount_type,
          discount_used_count,
          discount_user_used,
          discount_product_ids,
        });
        setThumbnail(discount_thumbnail);
        setDiscountType(discount_type);
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error server, please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setLoading(false);
    }
  };

  const handleOnSubmit = async () => {
    setLoading(true);

    const fields = checkData([
      {
        name: "discount_name",
        value: data.discount_name,
      },
      {
        name: "discount_code",
        value: data.discount_code,
      },
      {
        name: "discount_value",
        value: data.discount_value,
      },
      {
        name: "discount_max_uses",
        value: data.discount_max_uses,
      },
      {
        name: "discount_per_user",
        value: data.discount_per_user,
      },
      {
        name: "discount_start_date",
        value: data.discount_start_date,
      },
      {
        name: "discount_end_date",
        value: data.discount_end_date,
      },
      {
        name: "thumbnail",
        value: thumbnail,
      },
    ]);

    if (fields.length > 0) {
      toast.error("Please input fields", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setLoading(false);
      return;
    }

    try {
      const payload = await axiosPatch(`/discounts/${id}`, {
        ...data,
        discount_code: data.discount_code.toUpperCase(),
        discount_thumbnail: thumbnail,
        discount_type: discountType,
      });

      if (payload.status === 201) {
        toast.success("Success update coupon", {
          position: toast.POSITION.TOP_RIGHT,
        });
        router.push("/coupons");
      }
    } catch (error) {
      toast.error("Error in update coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <FormLayout
      title="Edit coupon"
      backLink="/coupons"
      onSubmit={handleOnSubmit}
    >
      <div>
        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <InputText
            title="Coupon name"
            width="lg:w-2/4 w-full"
            value={data.discount_name}
            error={fieldsCheck.includes("discount_name")}
            name="discount_name"
            placeholder="Coupon name"
            getValue={changeValue}
          />

          <InputText
            title="Coupon Code"
            width="lg:w-2/4 w-full"
            value={data.discount_code.toUpperCase()}
            name="discount_code"
            error={fieldsCheck.includes("discount_code")}
            placeholder="Coupon Code"
            getValue={changeValue}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <SelectDate
            title="Start date"
            className="lg:w-1/2 w-full"
            name="discount_start_date"
            type="datetime-local"
            value={data.discount_start_date}
            error={fieldsCheck.includes("discount_start_date")}
            onSelect={onSelectDate}
          />
          <SelectDate
            title="End date"
            type="datetime-local"
            className={`lg:w-1/2 w-full ${
              data.discount_start_date.length > 0
                ? "pointer-events-auto"
                : "opacity-60 pointer-events-none"
            }`}
            name="discount_end_date"
            value={data.discount_end_date}
            error={fieldsCheck.includes("discount_end_date")}
            onSelect={onSelectDate}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <div>
            <p className="text-base text-[#1E1E1E] font-medium mb-2">
              Coupon type
            </p>
            <div className="flex items-center gap-2">
              <SelectTag
                title="Percentage"
                size="M"
                onSelect={onSelectDiscountType}
                value={EDicount_type.PERCENTAGE}
                currentSelect={discountType}
              />

              <SelectTag
                title="Fixed Amount"
                size="M"
                onSelect={onSelectDiscountType}
                value={EDicount_type.FIXED_AMOUNT}
                currentSelect={discountType}
              />
            </div>
          </div>

          <div>
            <p className="text-base text-[#1E1E1E] font-medium mb-2">
              Discount
            </p>
            <div className="flex items-center gap-2">
              <p className="min-w-[40px] text-base text-[#1E1E1E] text-center font-medium">
                {discountType === EDicount_type.PERCENTAGE ? "%" : "VND"}
              </p>
              <InputNumber
                width="lg:w-2/4 w-full"
                value={data.discount_value.toString()}
                error={fieldsCheck.includes("discount_value")}
                name="discount_value"
                placeholder="Coupon value"
                getValue={(name: string, value: number) =>
                  onChangeDiscountValue(discountType, name, value)
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <InputNumber
            title="Minimum Amount"
            width="lg:w-2/4 w-full"
            value={data.discount_min_value.toString()}
            name="discount_min_value"
            error={fieldsCheck.includes("discount_min_value")}
            placeholder="Minimum Amount"
            getValue={changeNumber}
          />

          <InputNumber
            title="Coupon quantity"
            width="lg:w-2/4 w-full"
            value={data.discount_max_uses.toString()}
            name="discount_max_uses"
            error={fieldsCheck.includes("discount_max_uses")}
            placeholder="Coupon quantity"
            getValue={changeNumber}
          />

          <InputNumber
            title="Coupon per user"
            width="lg:w-2/4 w-full"
            value={data.discount_per_user.toString()}
            name="discount_per_user"
            error={fieldsCheck.includes("discount_per_user")}
            placeholder="Coupon per user"
            getValue={changeNumber}
          />
        </div>

        <div className="w-full flex lg:flex-nowrap flex-wrap items-start justify-between mt-5 lg:gap-5 gap-3">
          <Thumbnail
            className="w-[400px] h-[300px]"
            error={fieldsCheck.includes("thumbnail")}
            url={thumbnail}
            loading={loadingThumbnail}
            onChange={uploadThumbnail}
          />
        </div>

        <div className="w-full flex lg:flex-nowrap flex-wrap items-start justify-between mt-5 lg:gap-5 gap-3">
          <ButtonCheck
            title="Public"
            name="discount_public"
            width="w-fit"
            isChecked={data.discount_public}
            onChange={changePublic}
          />
        </div>

        {loading && <Loading />}
      </div>
    </FormLayout>
  );
};

export default EditCouponPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      query,
    },
  };
};
