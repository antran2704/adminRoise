import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import {
  ICreateProduct,
  ISelectItem,
  ISpecificationsProduct,
  ICategoryProduct,
  IAttributeProduct,
} from "~/interface";
import { deleteImageInSever } from "~/helper/handleImage";
import FormLayout from "~/layouts/FormLayout";
import { InputText, InputNumber, InputTextarea } from "~/components/InputField";
import Thumbnail from "~/components/Image/Thumbnail";
import ButtonCheck from "~/components/Button/ButtonCheck";
import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";
import Gallery from "~/components/Image/Gallery";
import MultipleValue from "~/components/InputField/MultipleValue";
import { SelectItem } from "~/components/Select";
import Loading from "~/components/Loading";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import { createProduct, uploadThumbnailProduct } from "~/api-client";
import SelectMultipleItem from "~/components/Select/SelectMutiple/SelectMultipleItem";

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
  isDeleted: false,
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

const initCategories: ICategoryProduct[] = [
  { id: "1", name: "elctron" },
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

const CreateProductPage = () => {
  const router = useRouter();

  const [product, setProduct] = useState<ICreateProduct>(initData);
  const [categories, setCategories] =
    useState<ICategoryProduct[]>(initCategories);
  const [selectCategory, setSelectCategory] = useState<ISelectItem | null>(
    null
  );

  const [sizes, setSizes] = useState<IAttributeProduct[]>(initSizes);
  const [selectSizes, setSelectSizes] = useState<IAttributeProduct[]>([]);
  const [colours, setColours] = useState<IAttributeProduct[]>(initColours);
  const [selectColours, setSelectColours] = useState<IAttributeProduct[]>([]);

  const [showSelect, setShowSelect] = useState<string | null>(null);

  const [fieldsCheck, setFieldsCheck] = useState<string[]>([]);

  const [tags, setTags] = useState<ISelectItem[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [gallery, setGallery] = useState<string[]>([]);

  const [specifications, setSpecifications] = useState<
    ISpecificationsProduct[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(false);

  const changeTags = (name: string, values: ISelectItem[]) => {
    setTags(values);
  };

  const onSelectShow = (name: string) => {
    if (showSelect === name) {
      setShowSelect(null);
      return;
    }

    setShowSelect(name);
  };

  const selectAll = (items: ISelectItem[], key: string) => {
    switch (key) {
      case "colours":
        setSelectColours(items as IAttributeProduct[]);
        break;
      default:
        setSelectSizes(items as IAttributeProduct[]);
    }
  };

  const selectItem = (items: ISelectItem, name: string) => {
    switch (name) {
      case "colours":
        setSelectColours([...selectColours, items as IAttributeProduct]);
        break;
      default:
        setSelectSizes([...selectSizes, items as IAttributeProduct]);
    }
  };

  const removeItem = (items: ISelectItem[], id: string, key: string) => {
    switch (key) {
      case "colours":
        setSelectColours(items as IAttributeProduct[]);
        break;
      default:
        setSelectSizes(items as IAttributeProduct[]);
    }
  };

  const onSelectCategory = useCallback(
    (item: ISelectItem) => {
      setSelectCategory(item as ICategoryProduct);
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

  const uploadThumbnail = useCallback(
    async (source: File) => {
      if (source) {
        if (fieldsCheck.includes("thumbnail")) {
          const newFieldsCheck = handleRemoveCheck(fieldsCheck, "thumbnail");
          setFieldsCheck(newFieldsCheck);
          ("thumbnail");
        }

        const formData: FormData = new FormData();
        formData.append("image", source);
        setLoadingThumbnail(true);

        try {
          const { status, payload } = await uploadThumbnailProduct(formData);

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
    },
    [thumbnail, loadingThumbnail]
  );

  const onUploadGallery = useCallback(
    async (source: File) => {
      if (source) {
        const formData: FormData = new FormData();
        formData.append("image", source);
        setLoadingGallery(true);

        try {
          const { status, payload } = await uploadThumbnailProduct(formData);

          if (status === 201) {
            setGallery([...gallery, payload]);
            setLoadingGallery(false);
          }
        } catch (error) {
          toast.error("Upload image failed", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setLoadingGallery(false);
          console.log(error);
        }
      }
    },
    [gallery, loadingGallery]
  );

  const onRemoveGallary = useCallback(
    async (url: string) => {
      try {
        const payload = await deleteImageInSever(url);

        if (payload.status === 201) {
          const newGallery = gallery.filter((image) => image !== url);
          setGallery(newGallery);
        }
      } catch (error) {
        toast.error("Remove image failed", {
          position: toast.POSITION.TOP_RIGHT,
        });

        console.log(error);
      }
    },
    [gallery, loadingGallery]
  );

  const checkData = (data: any) => {
    let fields = handleCheckFields(data);
    setFieldsCheck(fields);

    if (fields.length > 0) {
      router.push(`#${fields[0]}`);
    }
    return fields;
  };

  const handleOnSubmit = async () => {
    const fields = checkData([
      {
        name: "name",
        value: product.name,
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
        name: "thumbnail",
        value: thumbnail,
      },
    ]);

    if (fields.length > 0) {
      toast.error("Please input fields", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    const sendTags: string[] = tags.map((tag: ISelectItem) => tag.name);

    setLoading(true);

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
        tags: sendTags,
        sizes: selectSizes,
        isHot: product.isHot,
        isNew: product.isNew,
        isShow: product.isShow,
        images: [],
        picture: "",
        price: product.price,
        specialPrice: product.specialPrice,
        wholesalePrice: product.wholesalePrice,
      };

      const payload = await createProduct(sendData);

      if (payload.status === 201) {
        toast.success("Success create product", {
          position: toast.POSITION.TOP_RIGHT,
        });
        router.push("/products");
      }

      setLoading(false);
    } catch (error) {
      toast.error("Error in create product", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setLoading(false);
    }
  };

  const handleGetCategories = async () => {};

  return (
    <FormLayout
      title="Tạo sản phẩm"
      backLink="/products"
      onSubmit={handleOnSubmit}
    >
      <div>
        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <InputText
            title="Tên sản phẩm"
            width="lg:w-2/4 w-full"
            value={product.name}
            error={fieldsCheck.includes("name")}
            name="name"
            placeholder="Tên sản phẩm..."
            getValue={changeValue}
          />

          <InputText
            title="Seo Name"
            width="lg:w-2/4 w-full"
            value={product.seoName}
            error={fieldsCheck.includes("seoName")}
            name="seoName"
            placeholder="Seo Name..."
            getValue={changeValue}
          />

          <InputTextarea
            title="Tổng quan"
            width="lg:w-2/4 w-full"
            error={fieldsCheck.includes("overview")}
            value={product.overview}
            name="overview"
            placeholder="Tổng quan sản phẩm..."
            rows={2}
            getValue={changeValue}
          />

          <InputTextarea
            title="Mô tả sản phẩm"
            width="lg:w-2/4 w-full"
            error={fieldsCheck.includes("description")}
            value={product.description}
            name="description"
            placeholder="Mô tả sản phẩm..."
            getValue={changeValue}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <SelectItem
            width="lg:w-2/4 w-full"
            title="Thư mục sản phẩm"
            name="category"
            value={selectCategory ? (selectCategory.id as string) : ""}
            onSelect={onSelectCategory}
            data={categories}
          />

          <SelectMultipleItem
            data={colours}
            name="colours"
            className="lg:w-2/4 w-full"
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
            className="lg:w-2/4 w-full"
            title="Sizes"
            selects={selectSizes}
            selectItem={selectItem}
            removeItem={removeItem}
            selectAll={selectAll}
            onSetSelectShow={onSelectShow}
            show={showSelect === "sizes" ? true : false}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <Thumbnail
            error={fieldsCheck.includes("thumbnail")}
            url={thumbnail}
            loading={loadingThumbnail}
            onChange={uploadThumbnail}
          />

          <Gallery
            gallery={gallery}
            loading={loadingGallery}
            limited={6}
            onChange={onUploadGallery}
            onDelete={onRemoveGallary}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <MultipleValue
            title="Tags"
            width="lg:w-2/4 w-full"
            items={tags}
            name="tags"
            placeholder="Please enter tag..."
            error={fieldsCheck.includes("tags")}
            getAttributes={changeTags}
          />
        </div>

        <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
          <InputNumber
            title="Giá lẻ"
            width="lg:w-2/4 w-full"
            error={fieldsCheck.includes("price")}
            value={formatBigNumber(product.price)}
            name="price"
            getValue={changePrice}
          />

          <InputNumber
            title="Giá sỉ"
            width="lg:w-2/4 w-full"
            value={formatBigNumber(product.wholesalePrice)}
            error={fieldsCheck.includes("promotion_price")}
            name="promotion_price"
            getValue={changePrice}
          />

          <InputText
            title="SKU"
            width="lg:w-2/4 w-full"
            value={product.sku || ""}
            error={fieldsCheck.includes("sku")}
            placeholder="SKU..."
            name="sku"
            getValue={changeValue}
            infor="Mã SKU giúp quản lí sản phẩm tốt hơn"
          />

          <InputText
            title="Hãng"
            width="lg:w-2/4 w-full"
            value={product.brand || ""}
            error={fieldsCheck.includes("brand")}
            name="brand"
            placeholder="Hãng..."
            getValue={changeValue}
          />

          <InputText
            title="Chất liệu"
            width="lg:w-2/4 w-full"
            value={product.material || ""}
            error={fieldsCheck.includes("material")}
            name="material"
            placeholder="Chất liệu..."
            getValue={changeValue}
          />
        </div>

        <div className="lg:w-2/4 w-full flex flex-col mt-5 lg:gap-5 gap-3">
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
