import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState, useEffect, Fragment, useCallback } from "react";
import { toast } from "react-toastify";

import { typeCel } from "~/enums";

import { IFilter, IPagination, IProduct, ICategory } from "~/interface";
import { ISelectItem } from "~/interface";

import Search from "~/components/Search";
import { Table, CelTable } from "~/components/Table";
import { colHeaderProduct as colHeadTable } from "~/components/Table/colHeadTable";
import ShowItemsLayout from "~/layouts/ShowItemsLayout";
import SelectItem from "~/components/Select/SelectItem";
import ImageCus from "~/components/Image/ImageCus";
import { ButtonDelete, ButtonEdit } from "~/components/Button";
import Link from "next/link";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import { initPagination } from "~/components/Pagination/initData";
import {
  deleteProduct,
  getCategories,
  getProducts,
  searchProduct,
} from "~/api-client";

interface ISelectProduct {
  id: string | null;
  title: string;
}

const initSelectProduct: ISelectProduct = {
  id: null,
  title: "",
};

interface Props {
  query: ParsedUrlQuery;
}

const PAGE_SIZE = 16;

const ProductPage = (props: Props) => {
  const { query } = props;
  const { page, searchText } = query;
  const currentPage = page ? Number(page) : 1;

  const [categories, setCategories] = useState<ISelectItem[]>([]);
  const [selectCategory, setSelectCategory] = useState<ISelectItem | null>(
    null
  );
  const [products, setProducts] = useState<IProduct[]>([]);
  const [showProducts, setShowProducts] = useState<IProduct[]>([]);
  const [selectProduct, setSelectProduct] =
    useState<ISelectProduct>(initSelectProduct);

  const [selectProducts, setSelectProducts] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(initPagination);
  const [filter, setFilter] = useState<IFilter | null>(
    searchText ? { searchText: searchText as string } : null
  );

  const onSelectCategory = useCallback(
    (item: ISelectItem) => {
      setSelectCategory(item as ICategory);
    },
    [categories, selectCategory]
  );

  const onSelectCheckBox = useCallback(
    (id: string) => {
      const isExit = selectProducts.find((select: string) => select === id);
      if (isExit) {
        const newSelects = selectProducts.filter(
          (select: string) => select !== id
        );
        setSelectProducts(newSelects);
      } else {
        setSelectProducts([...selectProducts, id]);
      }
    },
    [selectProducts]
  );

  const onChangeSearch = useCallback(
    (name: string, value: string) => {
      setFilter({ ...filter, [name]: value });
    },
    [filter]
  );

  const handleGetDataByFilter = useCallback(async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await searchProduct(filter as IFilter);

      if (response) {
        setProducts(response);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error in server");
      toast.error("Error in server, please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    setLoading(false);
  }, [filter]);

  const onReset = useCallback(() => {
    setFilter(null);
    handleGetData();
  }, [filter]);

  const handleGetData = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await getProducts();
      if (response) {
        setProducts(response);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error in server");
      toast.error("Error in server, please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    setLoading(false);
  };

  const handleGetCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res);
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectProduct = (id: string, title: string) => {
    setSelectProduct({ id, title });
  };

  const handlePopup = () => {
    if (showPopup) {
      setSelectProduct(initSelectProduct);
    }

    setShowPopup(!showPopup);
  };

  const handleDeleteProduct = async () => {
    if (!selectProduct || !selectProduct.id) {
      setShowPopup(false);
      toast.error("False delete product", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {
      const response = await deleteProduct(selectProduct.id);
      setShowPopup(false);

      if (filter) {
        handleGetDataByFilter();
      } else {
        handleGetData();
      }
      toast.success("Success delete product", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error("Error delete product", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  };

  useEffect(() => {
    if (searchText) {
      handleGetDataByFilter();
    } else {
      handleGetData();
    }
  }, []);

  useEffect(() => {
    if (message) {
      setMessage(null);
    }

    setPagination({
      currentPage,
      pageSize: PAGE_SIZE,
      totalItems: products.length,
    });
    setShowProducts(
      products.slice((currentPage - 1) * PAGE_SIZE, PAGE_SIZE * currentPage)
    );

    if (currentPage > Math.ceil(products.length / PAGE_SIZE)) {
      setMessage("No Product");
    }
  }, [currentPage, products]);

  useEffect(() => {
    if (selectProducts.length > 0) {
      setSelectProducts([]);
    }
  }, [products, currentPage]);

  return (
    <ShowItemsLayout
      title="Products"
      titleCreate="Tạo sản phẩm"
      link="/create/product"
      selectItem={selectProduct}
      pagination={pagination}
      handleDelete={handleDeleteProduct}
      showPopup={showPopup}
      handlePopup={handlePopup}
    >
      <Fragment>
        <Search
          search={filter?.searchText ? filter.searchText : ""}
          onReset={onReset}
          onSearch={onChangeSearch}
          onFilter={handleGetDataByFilter}
          placeholder="Search by product name..."
        />
          {/* <SelectItem
            width="md:w-2/12 w-full"
            title="Thư mục sản phẩm"
            name="category"
            placeholder="Vui lòng lựa chọn thư mục"
            value={selectCategory ? (selectCategory.id as string) : ""}
            onSelect={onSelectCategory}
            data={categories}
          /> */}

        <Table
          items={products}
          selects={selectProducts}
          setSelects={setSelectProducts}
          selectAll={false}
          isSelected={selectProducts.length === products.length ? true : false}
          colHeadTabel={colHeadTable}
          message={message}
          loading={loading}
        >
          <Fragment>
            {showProducts.map((product: IProduct) => (
              <tr
                key={product.id}
                className="hover:bg-slate-100 border-b border-gray-300"
              >
                {/* <CelTable
                  type={typeCel.SELECT}
                  isSelected={
                    selectProducts.includes(product.id as string) ? true : false
                  }
                  onSelectCheckBox={() =>
                    onSelectCheckBox(product.id as string)
                  }
                /> */}
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center gap-2">
                    <ImageCus
                      title="product image"
                      alt="product image"
                      src={product.picture as string}
                      className="min-w-[32px] w-8 h-8 rounded-full"
                    />
                    <Link
                      href={`/edit/product/${product.id}`}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {product.name}
                    </Link>
                  </div>
                </CelTable>
                <CelTable
                  type={typeCel.TEXT}
                  center={true}
                  value={product.category ? product.category.name : "Home"}
                />
                <CelTable
                  type={typeCel.TEXT}
                  center={true}
                  value={
                    product.wholesalePrice
                      ? `${formatBigNumber(product.wholesalePrice)} VND`
                      : "0"
                  }
                />
                <CelTable
                  type={typeCel.TEXT}
                  center={true}
                  value={`${formatBigNumber(product.specialPrice)} VND`}
                />
                {/* <CelTable
                  id={product.id as string}
                  type={typeCel.PUBLIC}
                  checked={product.isShow}
                  onGetChecked={onChangePublic}
                /> */}
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center justify-center gap-2">
                    <ButtonEdit link={`/edit/product/${product.id}`} />

                    <ButtonDelete
                      onClick={() => {
                        if (!showPopup) {
                          onSelectProduct(product.id as string, product.name);
                        }

                        handlePopup();
                      }}
                    />
                  </div>
                </CelTable>
              </tr>
            ))}
          </Fragment>
        </Table>
      </Fragment>
    </ShowItemsLayout>
  );
};

export default ProductPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      query,
    },
  };
};
