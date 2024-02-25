import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, Fragment } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

import {
  ISelectItem,
  IImageProduct,
  IAttributeProduct,
  ICategory,
  ICreateProduct,
  IProduct,
} from "~/interface";

import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";

import FormLayout from "~/layouts/FormLayout";
import {
  InputNumber,
  InputText,
  InputTextDebouce,
  InputTextarea,
} from "~/components/InputField";
import ButtonCheck from "~/components/Button/ButtonCheck";
import MultipleValue from "~/components/InputField/MultipleValue";
import { SelectItem } from "~/components/Select";
import Loading from "~/components/Loading";
import Popup from "~/components/Popup";
import {
  deleteProduct,
  getCategories,
  getColours,
  getProduct,
  getSizes,
  updateProduct,
} from "~/api-client";
import SelectMultipleItem from "~/components/Select/SelectMutiple/SelectMultipleItem";
import ImageCus from "~/components/Image/ImageCus";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";

const initData: IProduct = {
  id: null,
  name: "",
  seoName: "",
  description: "",
  overview: "",
  category: null,
  picture: null,
  colours: [],
  sizes: [],
  images: [],
  tags: [],
  isHot: true,
  isNew: true,
  isShow: true,
  material: null,
  brand: null,
  sku: null,
  price: 0,
  specialPrice: 0,
  wholesalePrice: 0,
  slug: "",
};

interface Props {
  query: ParsedUrlQuery;
}

const ProductEditPage = (props: Props) => {
  const { query } = props;
  const { id } = query;
  const router = useRouter();

  const [product, setProduct] = useState<IProduct>(initData);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectCategory, setSelectCategory] = useState<ISelectItem | null>(
    null
  );

  const [sizes, setSizes] = useState<IAttributeProduct[]>([]);
  const [selectSizes, setSelectSizes] = useState<IAttributeProduct[]>([]);
  const [colours, setColours] = useState<IAttributeProduct[]>([]);
  const [selectColours, setSelectColours] = useState<IAttributeProduct[]>([]);

  const [showSelect, setShowSelect] = useState<string | null>(null);
  const [fieldsCheck, setFieldsCheck] = useState<string[]>([]);

  const [tags, setTags] = useState<ISelectItem[]>([]);

  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handlePopup = () => {
    setShowPopup(!showPopup);
  };

  const changeTags = (name: string, values: ISelectItem[]) => {
    setTags(values);
  };

  const onSelectShow = useCallback(
    (name: string) => {
      if (showSelect === name) {
        setShowSelect(null);
        return;
      }

      setShowSelect(name);
    },
    [showSelect]
  );

  const selectAll = useCallback(
    (items: ISelectItem[], key: string) => {
      switch (key) {
        case "colours":
          setSelectColours(items as IAttributeProduct[]);
          break;
        default:
          setSelectSizes(items as IAttributeProduct[]);
      }
    },
    [selectColours, selectSizes]
  );

  const selectItem = useCallback(
    (items: ISelectItem, name: string) => {
      switch (name) {
        case "colours":
          setSelectColours([...selectColours, items as IAttributeProduct]);
          break;
        default:
          setSelectSizes([...selectSizes, items as IAttributeProduct]);
      }
    },
    [selectColours, selectSizes]
  );

  const removeItem = useCallback(
    (items: ISelectItem[], id: string, key: string) => {
      switch (key) {
        case "colours":
          setSelectColours(items as IAttributeProduct[]);
          break;
        default:
          setSelectSizes(items as IAttributeProduct[]);
      }
    },
    [selectColours, selectSizes]
  );

  const onSelectCategory = useCallback(
    (item: ISelectItem) => {
      if (fieldsCheck.includes("category")) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, "category");
        setFieldsCheck(newFieldsCheck);
      }

      setSelectCategory(item as ICategory);
    },
    [categories, selectCategory, fieldsCheck]
  );

  const changeValue = useCallback(
    (name: string, value: string) => {
      if (fieldsCheck.includes(name)) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
        setFieldsCheck(newFieldsCheck);
      }
      setProduct({ ...product, [name]: value });
    },
    [product]
  );

  const changePrice = useCallback(
    (name: string, value: number) => {
      if (fieldsCheck.includes(name)) {
        const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
        setFieldsCheck(newFieldsCheck);
      }
      setProduct({ ...product, [name]: value });
    },
    [product]
  );

  const changePublic = (name: string, value: boolean) => {
    setProduct({ ...product, [name]: value });
  };

  const changeImage = (index: number, value: string) => {
    gallery[index] = value;
    const newGallery = [...gallery];

    setGallery(newGallery);
  };

  const addFieldImage = () => {
    setGallery([...gallery, ""]);
  };

  const checkData = (data: any) => {
    let fields = handleCheckFields(data);
    setFieldsCheck(fields);

    if (fields.length > 0) {
      router.push(`#${fields[0]}`);
    }
    return fields;
  };

  const handleDeleteProduct = async () => {
    if (!id || !product) return;

    try {
      await deleteProduct(product.id as string);
      router.push("/products");
      toast.success("Xóa sản phẩm thành công", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error("Error delete product", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }

    setShowPopup(false);
  };

  const removeFieldImage = (index: number) => {
    gallery.splice(index, 1);
    setGallery([...gallery]);
  };

  const getImagesSend = (images: string[]) => {
    const sendImages: IImageProduct[] = [];

    for (let i = 0; i < images.length; i++) {
      if (images[i]) {
        sendImages.push({
          imageUrl: images[i],
          order: i + 1,
        });
      }
    }

    return sendImages;
  };

  const handleOnSubmit = async () => {
    if (!id) return;

    const fields = checkData([
      {
        name: "name",
        value: product.name,
      },
      {
        name: "seoName",
        value: product.seoName,
      },
      {
        name: "overview",
        value: product.overview,
      },
      {
        name: "description",
        value: product.description,
      },
      {
        name: "category",
        value: selectCategory,
      },
      {
        name: "brand",
        value: product.brand,
      },
      {
        name: "material",
        value: product.material,
      },
    ]);

    if (fields.length > 0) {
      toast.error("Please input fields", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    setLoading(true);

    const sendTags: string[] = tags.map((tag: ISelectItem) => tag.name);
    const sendImages: IImageProduct[] = getImagesSend(gallery);
    try {
      const sendData: ICreateProduct = {
        name: product.name,
        description: product.description,
        overview: product.overview,
        seoName: product.seoName,
        brand: product.brand,
        sku: product.sku,
        material: product.material,
        category: selectCategory,
        colours: selectColours,
        sizes: selectSizes,
        tags: sendTags,
        isHot: product.isHot,
        isNew: product.isNew,
        isShow: product.isShow,
        images: sendImages,
        picture: product.picture,
        price: product.price,
        specialPrice: product.specialPrice,
        wholesalePrice: product.wholesalePrice,
      };

      await updateProduct(id as string, sendData);
      toast.success("Cập nhật sản phẩm thành công", {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      router.push("/products");
    } catch (error) {
      toast.error("Error in create product", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    setLoading(false);
  };

  const handleGetSizes = async () => {
    try {
      const res = await getSizes();
      setSizes(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetColours = async () => {
    try {
      const res = await getColours();
      setColours(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetProduct = async () => {
    setLoading(true);

    try {
      const res = await getProduct(id as string);
      if (res) {
        const images: string[] = res.images.map(
          (image: IImageProduct) => image.imageUrl
        );
        const tagsRes: ISelectItem[] = res.tags.map(
          (tag: string, index: number) => ({ id: index + 1, name: tag })
        );
        setProduct(res);
        setSelectCategory(res.category);
        setGallery(images);
        setSelectColours(res.colours);
        setSelectSizes(res.sizes);
        setTags(tagsRes);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    handleGetCategories();
    handleGetColours();
    handleGetSizes();
  }, []);

  useEffect(() => {
    if (id) {
      handleGetProduct();
    }
  }, [router.isReady]);

  return (
    <FormLayout
      title="Chỉnh sửa sản phẩm"
      backLink="/products"
      onSubmit={handleOnSubmit}
    >
      <div className="flex flex-col items-center">
        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <InputText
            title="Tên sản phẩm"
            width="w-full"
            error={fieldsCheck.includes("name")}
            value={product.name}
            name="name"
            placeholder="Tên sản phẩm..."
            getValue={changeValue}
          />

          <InputText
            title="Seo Name"
            value={product.seoName}
            width="w-full"
            error={fieldsCheck.includes("seoName")}
            name="seoName"
            placeholder="Seo Name..."
            getValue={changeValue}
          />

          <InputTextarea
            title="Tổng quan"
            value={product.overview}
            width="w-full"
            error={fieldsCheck.includes("overview")}
            name="overview"
            placeholder="Tổng quan sản phẩm..."
            rows={2}
            getValue={changeValue}
          />

          <InputTextarea
            title="Mô tả sản phẩm"
            value={product.description}
            width="w-full"
            error={fieldsCheck.includes("description")}
            name="description"
            placeholder="Mô tả sản phẩm..."
            getValue={changeValue}
          />
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <SelectItem
            width="w-full"
            title="Thư mục sản phẩm"
            name="category"
            placeholder="Vui lòng lựa chọn thư mục"
            value={selectCategory ? (selectCategory.id as string) : ""}
            error={fieldsCheck.includes("category")}
            onSelect={onSelectCategory}
            data={categories}
          />

          <SelectMultipleItem
            data={colours}
            name="colours"
            className="w-full"
            title="Colours"
            selects={selectColours}
            selectItem={selectItem}
            removeItem={removeItem}
            selectAll={selectAll}
            onSetSelectShow={onSelectShow}
            show={showSelect === "colours" ? true : false}
          />

          <SelectMultipleItem
            data={sizes}
            name="sizes"
            className="w-full"
            title="Sizes"
            selects={selectSizes}
            selectItem={selectItem}
            removeItem={removeItem}
            selectAll={selectAll}
            onSetSelectShow={onSelectShow}
            show={showSelect === "sizes" ? true : false}
          />
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <div className="w-full">
            <InputTextDebouce
              title="Picture"
              width="w-full"
              debouce={600}
              defaultValue={product.picture as string}
              name="picture"
              placeholder="Url picture..."
              getValue={changeValue}
            />

            {product.picture && (
              <ImageCus
                alt="picture"
                src={product.picture}
                className="w-[200px] h-[200px] mt-5"
                title="picture"
              />
            )}
          </div>

          <div className="w-full">
            <p className="block text-base text-[#1E1E1E] font-medium mb-1">
              Images
            </p>

            <div className="w-full grid grid-cols-3 gap-4">
              {gallery.map((image: string, index: number) => (
                <div key={index}>
                  <div className="flex items-center gap-2">
                    <button>
                      <IoIosCloseCircleOutline
                        onClick={() => removeFieldImage(index)}
                        className="text-sm min-w-8 w-8 h-8 min-h-8 cursor-pointer text-error"
                      />
                    </button>
                    <InputTextDebouce
                      width="w-full"
                      name="picture"
                      debouce={600}
                      defaultValue={image}
                      placeholder="Url picture..."
                      getValue={(name: string, value: string) =>
                        changeImage(index, value)
                      }
                    />
                  </div>
                  {image && (
                    <ImageCus
                      alt="picture"
                      src={image}
                      className="w-[140px] h-[140px] mt-5"
                      title="picture"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={addFieldImage}
                className="flex items-center justify-center rounded-full mt-5 overflow-hidden"
              >
                <AiOutlinePlus className="w-10 h-10 bg-success p-2 text-white " />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <MultipleValue
            title="Tags"
            width="w-full"
            items={tags}
            name="tags"
            placeholder="Please enter tag..."
            error={fieldsCheck.includes("tags")}
            getAttributes={changeTags}
          />
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <InputNumber
            title="Giá"
            width="w-full"
            value={formatBigNumber(product.price)}
            error={fieldsCheck.includes("price")}
            name="price"
            getValue={changePrice}
          />

          <InputNumber
            title="Giá sỉ"
            width="w-full"
            value={formatBigNumber(product.wholesalePrice)}
            error={fieldsCheck.includes("wholesalePrice")}
            name="wholesalePrice"
            getValue={changePrice}
          />

          <InputNumber
            title="Giá lẻ"
            width="w-full"
            error={fieldsCheck.includes("specialPrice")}
            value={formatBigNumber(product.specialPrice)}
            name="specialPrice"
            getValue={changePrice}
          />
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
          <InputText
            title="SKU"
            width="w-full"
            error={fieldsCheck.includes("sku")}
            value={product.sku || ""}
            placeholder="SKU..."
            name="sku"
            getValue={changeValue}
            infor="Mã SKU giúp quản lí sản phẩm tốt hơn"
          />

          <InputText
            title="Hãng"
            width="w-full"
            error={fieldsCheck.includes("brand")}
            value={product.brand || ""}
            name="brand"
            placeholder="Hãng..."
            getValue={changeValue}
          />

          <InputText
            title="Chất liệu"
            width="w-full"
            error={fieldsCheck.includes("material")}
            value={product.material || ""}
            name="material"
            placeholder="Chất liệu..."
            getValue={changeValue}
          />
        </div>

        {product.id && (
          <div className="lg:w-2/4 w-full grid grid-cols-1 mt-5 p-5 rounded-md border-2 lg:gap-5 gap-3">
            <ButtonCheck
              title="Show"
              name="isShow"
              width="w-fit"
              isChecked={product.isShow}
              onChange={changePublic}
            />

            <ButtonCheck
              title="New"
              name="isNew"
              width="w-fit"
              isChecked={product.isNew}
              onChange={changePublic}
            />

            <ButtonCheck
              title="Hot"
              name="isHot"
              width="w-fit"
              isChecked={product.isHot}
              onChange={changePublic}
            />
          </div>
        )}

        <div className="lg:w-2/4 w-full grid grid-cols-1 mt-5 lg:gap-5 gap-3">
          <button onClick={handlePopup} className="w-fit text-lg text-white font-medium bg-error px-5 py-1 rounded-md">
            Delete
          </button>
        </div>

        {loading && <Loading />}

        {showPopup && (
          <Popup title="Xác nhận xóa sản phẩm" show={showPopup} onClose={handlePopup}>
            <div>
              <div className="flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-2">
                <button
                  onClick={handlePopup}
                  className="lg:w-fit w-full text-lg font-medium bg-[#e2e2e2] px-5 py-1 opacity-90 hover:opacity-100 rounded-md transition-cus"
                >
                  Cancle
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="lg:w-fit w-full text-lg text-white font-medium bg-error px-5 py-1 opacity-90 hover:opacity-100 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </FormLayout>
  );
};

export default ProductEditPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      query,
    },
  };
};
