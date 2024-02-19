import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import {
  ICreateProduct,
  ISelectItem,
  ICategory,
  IAttributeProduct,
  IImageProduct,
} from "~/interface";
import FormLayout from "~/layouts/FormLayout";
import {
  InputText,
  InputNumber,
  InputTextarea,
  InputTextDebouce,
} from "~/components/InputField";
import ButtonCheck from "~/components/Button/ButtonCheck";
import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";
import MultipleValue from "~/components/InputField/MultipleValue";
import { SelectItem } from "~/components/Select";
import Loading from "~/components/Loading";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import {
  createProduct,
  getCategories,
  getColours,
  getSizes,
} from "~/api-client";
import SelectMultipleItem from "~/components/Select/SelectMutiple/SelectMultipleItem";
import ImageCus from "~/components/Image/ImageCus";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";
import useDebounce from "~/hooks/useDebounce";

const initData: ICreateProduct = {
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
};

const initCategories: ICategory[] = [
  { id: "65b33961ab0b53b436af7c31", name: "QX2" },
  { id: "2", name: "clothe" },
  { id: "3", name: "furniture" },
];

const initSizes: IAttributeProduct[] = [
  { id: "1", name: "S" },
  { id: "2", name: "M" },
  { id: "3", name: "L" },
];

const initColours: IAttributeProduct[] = [
  { id: "1", name: "Red" },
  { id: "2", name: "Green" },
  { id: "3", name: "Blue" },
];

const initGalery: string[] = [];

const CreateProductPage = () => {
  const router = useRouter();

  const [product, setProduct] = useState<ICreateProduct>(initData);
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

  const [loading, setLoading] = useState<boolean>(false);

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
    [categories, selectCategory]
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
      if (name === "promotion_price" && product.price <= value) {
        setFieldsCheck([...fieldsCheck, "promotion_price"]);
        toast.error("Promotion price must less than default price", {
          position: toast.POSITION.TOP_RIGHT,
        });

        return;
      }

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

      await createProduct(sendData);
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

  useEffect(() => {
    handleGetCategories();
    handleGetColours();
    handleGetSizes();
  }, []);

  return (
    <FormLayout
      title="Tạo sản phẩm"
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
              name="picture"
              placeholder="Url picture..."
              debouce={600}
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
            value={product.sku || ""}
            error={fieldsCheck.includes("sku")}
            placeholder="SKU..."
            name="sku"
            getValue={changeValue}
            infor="Mã SKU giúp quản lí sản phẩm tốt hơn"
          />

          <InputText
            title="Hãng"
            width="w-full"
            value={product.brand || ""}
            error={fieldsCheck.includes("brand")}
            name="brand"
            placeholder="Hãng..."
            getValue={changeValue}
          />

          <InputText
            title="Chất liệu"
            value={product.material || ""}
            width="w-full"
            error={fieldsCheck.includes("material")}
            name="material"
            placeholder="Chất liệu..."
            getValue={changeValue}
          />
        </div>

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

        {loading && <Loading />}
      </div>
    </FormLayout>
  );
};

export default CreateProductPage;
