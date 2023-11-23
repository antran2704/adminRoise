import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, Fragment } from "react";
import { toast } from "react-toastify";
import { ParsedUrlQuery } from "querystring";

import { axiosGet, axiosPatch } from "~/ultils/configAxios";

import {
  ICategorySelect,
  IObjectCategory,
  ISelectItem,
  ISpecificationsProduct,
  IProductData,
  IParentCategory,
  IAttribute,
  IVariant,
} from "~/interface";
import { typeInput } from "~/enums";
import { deleteImageInSever, uploadImageOnServer } from "~/helper/handleImage";
import FormLayout from "~/layouts/FormLayout";
import Input from "~/components/Input";
import Tree from "~/components/Tree";
import Thumbnail from "~/components/Image/Thumbnail";
import ButtonCheck from "~/components/Button/ButtonCheck";
import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";
import Gallery from "~/components/Image/Gallery";
import MultipleValue from "~/components/Input/MultipleValue";
import { SelectItem, SelectMutipleItem } from "~/components/Select";
import generalBreadcrumbs from "~/helper/generateBreadcrumb";
import Specifications from "~/components/Specifications";
import Loading from "~/components/Loading";

enum TYPE_TAG {
  BASIC_INFOR = "basic_infor",
  COMPINATION = "compination",
}

const initData: IProductData = {
  _id: null,
  title: "",
  description: "",
  shortDescription: "",
  category: { _id: null, title: "" },
  categories: [],
  type: [],
  price: 0,
  promotionPrice: 0,
  inventory: 0,
  public: true,
  thumbnail: null,
  gallery: [],
  brand: null,
  hotProduct: false,
  options: [],
  breadcrumbs: [],
  specifications: [],
  variants: [],
  viewer: 0,
  rate: 0,
};

interface IObjAttibute {
  [key: string]: IAttribute;
}

interface IObjectSelectAttribute {
  [key: string]: ISelectItem[];
}

interface ICompination {
  [key: string]: string[];
}

const test: ICompination = {
  color: ["xanh", "vang", "do"],
  size: ["S", "M"],
};

interface Props {
  query: ParsedUrlQuery;
}

const ProductEditPage = (props: Props) => {
  const { query } = props;
  const { id } = query;
  const router = useRouter();

  const [tag, setTag] = useState<string>(TYPE_TAG.COMPINATION);

  const [product, setProduct] = useState<IProductData>(initData);
  const [title, setTitle] = useState<string | null>(null);
  const [categories, setCategories] = useState<IObjectCategory>({});
  const [fieldsCheck, setFieldsCheck] = useState<string[]>([]);
  const [categoriesParent, setCategoriesParent] = useState([]);
  const [categorySelect, setCategorySelect] = useState<ICategorySelect>({
    title: null,
    node_id: null,
  });

  const [mutipleCategories, setMultipleCategories] = useState<ISelectItem[]>(
    []
  );
  const [defaultCategory, setDefaultCategory] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [gallery, setGallery] = useState<string[]>([]);

  const [specifications, setSpecifications] = useState<
    ISpecificationsProduct[]
  >([]);

  const [compination, setCompination] = useState<ICompination>({});
  const [attributes, setAtrributes] = useState<IObjAttibute>({});
  const [showAttributes, setShowAttributes] = useState<IObjectSelectAttribute>(
    {}
  );
  const [selectAttributes, setSelectAttributes] =
    useState<IObjectSelectAttribute>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingThumbnail, setLoadingThumbnail] = useState<boolean>(false);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(false);

  const onSelectTag = (value: TYPE_TAG) => {
    // if (value === TYPE_TAG.COMPINATION && Object.keys(attributes).length === 0) {
    //   handleGetAttributes();
    // }

    setTag(value);
  };

  const selectAll = (items: ISelectItem[], key: string) => {
    const select = selectAttributes;

    if (key === "default") {
      const currentShowAttributes = showAttributes;
      Object.keys(attributes).forEach((key: string) => {
        const attribute: IAttribute = attributes[key];
        if (items.length > 0) {
          currentShowAttributes[attribute.code] = [];

          attribute.variants.forEach((item: IVariant) => {
            currentShowAttributes[attribute.code].push({
              _id: item._id,
              title: item.name,
            });
          });
        } else {
          delete currentShowAttributes[attribute.code];
        }
      });
    }
    select[key] = items;
    setSelectAttributes({ ...select });
  };

  const removeSelect = (items: ISelectItem[], id: string, key: string) => {
    const select = selectAttributes;

    if (key === "default") {
      const currentShowAttributes = showAttributes;
      const item: IAttribute = attributes[id];

      select[item.code] = [];
      delete currentShowAttributes[item.code];
    }

    select[key] = items;
    setSelectAttributes({ ...select });
  };

  const selectAttribute = (item: ISelectItem, key: string) => {
    const select = selectAttributes;
    const currentShowAttributes = showAttributes;

    if (key === "default") {
      if (Object.keys(showAttributes).length >= 4) {
        toast.error("Maximum select attribute", {
          position: toast.POSITION.TOP_RIGHT,
        });

        return;
      }

      const { variants, code } = attributes[item._id as string];
      currentShowAttributes[code] = [];

      for (const variant of variants) {
        const { _id, name } = variant as IVariant;
        currentShowAttributes[code].push({ _id, title: name });
      }
    }
    select[key].push(item);
    setShowAttributes(currentShowAttributes);
    setSelectAttributes({ ...select });
  };

  const getCompination = () => {
    const selects = selectAttributes;
    const result: ICompination = {};

    for (const key of Object.keys(selects)) {
      if (key !== "default" && selects[key].length > 0) {
        result[key] = [];
        const items = selects[key];

        for (const item of items) {
          result[key].push(item.title);
        }
      }
    }

    return result;
  };

  const onSelectCategory = (title: string | null, node_id: string | null) => {
    if (!node_id) {
      toast.info("Choose another Home category ", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    const isExit = mutipleCategories.some(
      (category) => category.title === title
    );

    if (isExit) {
      toast.info("Oh, category is exited", {
        position: toast.POSITION.TOP_RIGHT,
      });

      return;
    }

    if (!defaultCategory) {
      setDefaultCategory(node_id);
    }

    if (fieldsCheck.includes("categories")) {
      const newFieldsCheck = handleRemoveCheck(fieldsCheck, "categories");
      setFieldsCheck(newFieldsCheck);
    }

    const newItem: ISelectItem = { _id: node_id, title: title as string };

    setCategorySelect({ title, node_id });
    setMultipleCategories([...mutipleCategories, newItem]);
  };

  const changeMultipleCategories = (name: string, values: ISelectItem[]) => {
    setMultipleCategories(values);
  };

  const onSelectDefaultCategory = useCallback(
    (value: string) => {
      setDefaultCategory(value);
    },
    [mutipleCategories, defaultCategory]
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
      if (name === "promotionPrice" && product.price <= value) {
        setFieldsCheck([...fieldsCheck, "promotionPrice"]);
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
          const { status, payload } = await uploadImageOnServer(
            `${process.env.NEXT_PUBLIC_ENDPOINT_API}/products/uploadImage`,
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
          const { status, payload } = await uploadImageOnServer(
            `${process.env.NEXT_PUBLIC_ENDPOINT_API}/products/uploadImage`,
            formData
          );

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

  const onUpdateSpecifications = (
    newSpecifications: ISpecificationsProduct[]
  ) => {
    setSpecifications(newSpecifications);
  };

  const checkData = (data: any) => {
    let fields = handleCheckFields(data);
    setFieldsCheck(fields);
    router.push(`#${fields[0]}`);
    return fields;
  };

  const handleOnSubmit = async () => {
    const fields = checkData([
      {
        name: "title",
        value: product.title,
      },
      {
        name: "shortDescription",
        value: product.shortDescription,
      },
      {
        name: "description",
        value: product.description,
      },
      {
        name: "categories",
        value: mutipleCategories,
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

    try {
      let breadcrumbs: string[] = [];
      if (defaultCategory) {
        breadcrumbs = generalBreadcrumbs(defaultCategory, categories);
      } else {
        breadcrumbs = generalBreadcrumbs(mutipleCategories[0]._id, categories);
      }

      const categoriesProduct = mutipleCategories.map(
        (category: ISelectItem) => {
          return category._id;
        }
      );

      const payload = await axiosPatch(`/products/${id}`, {
        title: product.title,
        description: product.description,
        shortDescription: product.shortDescription,
        meta_title: product.title,
        meta_description: product.description,
        thumbnail,
        gallery,
        category: defaultCategory,
        categories: categoriesProduct,
        breadcrumbs,
        specifications,
        price: product.price,
        promotionPrice: product.promotionPrice,
        inventory: product.inventory,
        public: product.public,
      });

      if (payload.status === 201) {
        toast.success("Success updated product", {
          position: toast.POSITION.TOP_RIGHT,
        });
        router.push("/products");
      }
    } catch (error) {
      toast.error("Error in updated product", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  };

  const handleGetData = async () => {
    setLoading(true);

    try {
      const { payload, status } = await axiosGet(`/products/id/${id}`);

      const {
        title,
        description,
        shortDescription,
        categories,
        category,
        thumbnail,
        gallery,
        price,
        promotionPrice,
        hotProduct,
        inventory,
        brand,
        public: publicProduct,
        rate,
        viewer,
        specifications,
        variations,
        options,
        breadcrumbs,
      } = payload;

      if (status === 200) {
        const defaultCategoryPayload: IParentCategory = {
          _id: category._id,
          title: category.title,
        };

        const multipleCategoriesPayload: ISelectItem[] = categories.map(
          (category: IParentCategory) => ({
            _id: category._id,
            title: category.title,
          })
        );

        const productData: IProductData = {
          _id: id as string,
          title,
          description,
          shortDescription,
          category: defaultCategoryPayload,
          categories: multipleCategoriesPayload,
          thumbnail,
          gallery,
          price,
          promotionPrice,
          inventory,
          public: publicProduct,
          hotProduct,
          options,
          breadcrumbs,
          specifications,
          type: [],
          rate,
          viewer,
          brand,
          variants: variations,
        };

        setProduct(productData);
        setTitle(title);
        setDefaultCategory(defaultCategoryPayload._id);
        setMultipleCategories(multipleCategoriesPayload);
        setThumbnail(thumbnail);
        setGallery(gallery);
        setSpecifications(specifications);
      }

      setLoading(false);
    } catch (error) {
      toast.error("Error server, please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setLoading(false);
    }
  };

  const handleGetAttributes = async () => {
    setLoading(true);

    try {
      const { status, payload } = await axiosGet(`/variants`);

      if (status === 200) {
        let attributesPayload: IObjAttibute = {};
        let showAttributesDefault: IObjectSelectAttribute = { default: [] };
        let selectAttributesDefault: IObjectSelectAttribute = { default: [] };

        for (const item of payload) {
          const {
            _id,
            name,
            variants,
            code,
            public: status,
          } = item as IAttribute;

          attributesPayload[`${_id}`] = {
            _id,
            name,
            variants,
            code,
            public: status,
          };

          showAttributesDefault["default"].push({ _id, title: name });
          selectAttributesDefault[code] = [];
        }

        setSelectAttributes(selectAttributesDefault);
        setShowAttributes(showAttributesDefault);
        setAtrributes(attributesPayload);

        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleGetCategories = async () => {
    let data: IObjectCategory = {};
    try {
      const response = await axiosGet("categories");

      for (const item of response.payload) {
        const { _id, parent_id, title, childrens, slug } = item;
        data[_id] = { _id, parent_id, title, childrens, slug };
      }

      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetCategoriesParent = async () => {
    try {
      const response = await axiosGet("categories/parent");
      const data = response.payload.map((item: any) => item._id);

      setCategoriesParent(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetData();
    handleGetCategories();
    handleGetCategoriesParent();
    handleGetAttributes();

    const result:any = [];

    const generateVariants = (keys: string[], variant: any, index: number) => {
      if (index > keys.length - 1) {
        console.log(variant)
        result.push(variant);
        return;
      }

      const key = keys[index];
      const items = test[key];

      items.forEach((item) => {
        variant[`option${index + 1}`] = item;
        const a = variant
        generateVariants(keys, a, index + 1);
      });
    };

    generateVariants(
      ["color", "size"],
      { options: [], option1: "", option2: "", option3: "" },
      0
    );

    console.log("result:::", result);
  }, []);

  return (
    <FormLayout
      title={`Update Product ${title}`}
      backLink="/products"
      onSubmit={handleOnSubmit}
    >
      <Fragment>
        <div className="flex items-center mb-5 gap-2">
          <button
            onClick={() => onSelectTag(TYPE_TAG.BASIC_INFOR)}
            className={`text-lg ${
              tag === TYPE_TAG.BASIC_INFOR ? "text-success border-success" : ""
            }  font-medium px-2 pb-2 border-b-2 `}
          >
            Basic info
          </button>
          <button
            onClick={() => onSelectTag(TYPE_TAG.COMPINATION)}
            className={`text-lg ${
              tag === TYPE_TAG.COMPINATION ? "text-success border-success" : ""
            }  font-medium px-2 pb-2 border-b-2 `}
          >
            Compination
          </button>
        </div>

        {tag === TYPE_TAG.BASIC_INFOR && (
          <div>
            <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between lg:gap-5 gap-3">
              <Input
                title="Title"
                width="lg:w-2/4 w-full"
                value={product.title || ""}
                error={fieldsCheck.includes("title")}
                name="title"
                placeholder="Input product name..."
                type={typeInput.input}
                getValue={changeValue}
              />
            </div>

            <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-3">
              <Input
                title="Short description"
                width="lg:w-2/4 w-full"
                error={fieldsCheck.includes("shortDescription")}
                value={product.shortDescription || ""}
                name="shortDescription"
                placeholder="Input short description about product"
                type={typeInput.textarea}
                rows={2}
                getValue={changeValue}
              />
            </div>

            <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-3">
              <Input
                title="Description"
                width="lg:w-2/4 w-full"
                error={fieldsCheck.includes("description")}
                value={product.description || ""}
                name="description"
                placeholder="Input description about product"
                type={typeInput.textarea}
                getValue={changeValue}
              />
            </div>

            <div className="w-full mt-5">
              <MultipleValue
                title="Categories"
                width="lg:w-2/4 w-full"
                items={mutipleCategories}
                name="categories"
                placeholder="Please select a category or categories"
                readonly={true}
                error={fieldsCheck.includes("categories")}
                getAttributes={changeMultipleCategories}
              />

              <div>
                {categoriesParent.length > 0 &&
                  Object.keys(categories).length > 0 && (
                    <Tree
                      categories={categories}
                      categoriesParent={categoriesParent}
                      node_id="Home"
                      parent_id={null}
                      categorySelect={categorySelect}
                      onSelect={onSelectCategory}
                    />
                  )}
              </div>
            </div>

            <div className="w-full flex flex-col mt-5 lg:gap-5 gap-3">
              <SelectItem
                width="lg:w-2/4 w-full"
                title="Default category"
                name="category"
                value={defaultCategory ? defaultCategory : ""}
                onSelect={onSelectDefaultCategory}
                data={mutipleCategories}
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
              <Input
                title="Price"
                width="lg:w-2/4 w-full"
                error={fieldsCheck.includes("price")}
                value={product.price.toString()}
                name="price"
                type={typeInput.number}
                getNumber={changePrice}
              />

              <Input
                title="Promotion Price"
                width="lg:w-2/4 w-full"
                value={product.promotionPrice.toString()}
                error={fieldsCheck.includes("promotionPrice")}
                name="promotionPrice"
                type={typeInput.number}
                getNumber={changePrice}
              />

              <Input
                title="Inventory"
                width="lg:w-2/4 w-full"
                value={product.inventory.toString()}
                error={fieldsCheck.includes("inventory")}
                name="inventory"
                type={typeInput.number}
                getNumber={changePrice}
              />
            </div>

            <div className="lg:w-2/4 w-full flex flex-col mt-5 lg:gap-5 gap-3">
              <Specifications
                specifications={specifications}
                onUpdate={onUpdateSpecifications}
              />
            </div>

            <div className="w-full flex lg:flex-nowrap flex-wrap items-start justify-between mt-5 lg:gap-5 gap-3">
              {product._id && (
                <ButtonCheck
                  title="Public"
                  name="public"
                  width="w-fit"
                  isChecked={product.public}
                  onChange={changePublic}
                />
              )}
            </div>

            {loading && <Loading />}
          </div>
        )}

        {tag === TYPE_TAG.COMPINATION && (
          <div>
            <div className="grid grid-cols-4 gap-5">
              {Object.keys(showAttributes || {}).map((key: any) => (
                <SelectMutipleItem
                  key={key}
                  title={`Select ${key === "default" ? "Atrribute" : key}`}
                  data={showAttributes[key]}
                  name={key}
                  selectItem={selectAttribute}
                  removeItem={removeSelect}
                  selectAll={selectAll}
                  selects={selectAttributes[key] || []}
                />
              ))}
            </div>

            <div className="flex items-center justify-end mt-5 gap-5">
              {Object.keys(showAttributes).length > 1 && (
                <button
                  onClick={getCompination}
                  className="text-sm bg-success text-white px-5 py-2 rounded-md"
                >
                  Generate Variants
                </button>
              )}
              <button className="text-sm bg-success text-white px-5 py-2 rounded-md">
                Clear Variants
              </button>
            </div>
          </div>
        )}
      </Fragment>
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