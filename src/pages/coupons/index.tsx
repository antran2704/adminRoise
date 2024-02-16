import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState, useEffect, Fragment, useCallback } from "react";
import { toast } from "react-toastify";

import ShowItemsLayout from "~/layouts/ShowItemsLayout";

import { EDicount_type, typeCel } from "~/enums";

import { IFilter, ICouponHome, IPagination } from "~/interface";

import Search from "~/components/Search";
import { Table, CelTable } from "~/components/Table";
import { colHeaderCoupon as colHeadTable } from "~/components/Table/colHeadTable";
import { ButtonDelete, ButtonEdit } from "~/components/Button";
import ImageCus from "~/components/Image/ImageCus";
import Link from "next/link";
import { SelectDate } from "~/components/Select";
import { AxiosError, AxiosResponse } from "axios";
import { getCookies } from "cookies-next";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import { initPagination } from "~/components/Pagination/initData";
import {
  deleteCoupon,
  getCoupons,
  getCouponsWithFilter,
  updateCoupon,
} from "~/api-client";

interface ISelectCoupon {
  id: string;
  title: string;
}

interface Props {
  query: ParsedUrlQuery;
}

const CouponsPage = (props: Props) => {
  const { query } = props;
  const currentPage = query.page ? Number(query.page) : 1;

  const [coupons, setCoupons] = useState<ICouponHome[]>([]);
  const [selectCoupons, setSelectCoupons] = useState<string[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectItem, setSelectItem] = useState<ISelectCoupon | null>(null);
  const [pagination, setPagination] = useState<IPagination>(initPagination);
  const [filter, setFilter] = useState<IFilter | null>(null);

  const onSelectCheckBox = useCallback(
    (id: string) => {
      const isExit = selectCoupons.find((select: string) => select === id);
      if (isExit) {
        const newSelects = selectCoupons.filter(
          (select: string) => select !== id
        );
        setSelectCoupons(newSelects);
      } else {
        setSelectCoupons([...selectCoupons, id]);
      }
    },
    [selectCoupons]
  );

  const onReset = useCallback(() => {
    setFilter(null);
    handleGetData();
  }, [filter, coupons]);

  const onFilterByDate = useCallback(
    (value: string, name: string) => {
      setFilter({ ...filter, [name]: value });
    },
    [filter]
  );

  const onChangeSearch = useCallback(
    (name: string, value: string) => {
      setFilter({ ...filter, [name]: value });
    },
    [filter]
  );

  const onChangePublish = async (id: string, status: boolean) => {
    if (!id) {
      toast.error("False change publish", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    try {
      const payload = await updateCoupon(id, {
        discount_public: status,
      });

      if (payload.status === 201) {
        toast.success("Success updated discount", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (err) {
      const { code, response: responseErr } = err as AxiosError;

      if (code === "ERR_NETWORK") {
        setMessage("Error in server");
      }

      const payload = responseErr as AxiosResponse;

      if (payload.status === 500) {
        setMessage("Error in server");
      }
    }
  };

  const onSelectDeleteItem = (id: string, title: string) => {
    setSelectItem({ id, title });
    handlePopup();
  };

  const handlePopup = useCallback(() => {
    if (showPopup) {
      setSelectItem(null);
    }

    setShowPopup(!showPopup);
  }, [showPopup, selectItem]);

  const handleGetData = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await getCoupons(currentPage, {
        discount_name: "1",
        discount_public: "1",
        discount_type: "1",
        discount_thumbnail: "1",
        discount_code: "1",
        discount_value: "1",
        discount_active: "1",
        discount_start_date: "1",
        discount_end_date: "1",
      });

      if (response.status === 200) {
        if (response.payload.length === 0) {
          setCoupons([]);
          setMessage("No coupon");
          setLoading(false);
          return;
        }
        setPagination(response.pagination);
        setCoupons(response.payload);
      }
    } catch (err) {
      const { code, response: responseErr } = err as AxiosError;

      if (code === "ERR_NETWORK") {
        setMessage("Error in server");
      }

      const payload = responseErr as AxiosResponse;

      if (payload.status === 500) {
        setMessage("Error in server");
      }
    }

    setLoading(false);
  };

  const handleGetDataByFilter = useCallback(async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await getCouponsWithFilter(filter, currentPage, {
        discount_name: "1",
        discount_public: "1",
        discount_type: "1",
        discount_thumbnail: "1",
        discount_code: "1",
        discount_value: "1",
        discount_active: "1",
        discount_start_date: "1",
        discount_end_date: "1",
      });

      if (response.status === 200) {
        if (response.payload.length === 0) {
          setCoupons([]);
          setMessage("No coupon");
          setLoading(false);
          return;
        }

        setPagination(response.pagination);
        setCoupons(response.payload);
        setLoading(false);
      }
    } catch (err) {
      const { code, response: responseErr } = err as AxiosError;

      if (code === "ERR_NETWORK") {
        setMessage("Error in server");
      }

      const payload = responseErr as AxiosResponse;

      if (payload.status === 500) {
        setMessage("Error in server");
      }
    }

    setLoading(false);
  }, [filter]);

  const handleDeleteCoupon = useCallback(async () => {
    if (!selectItem || !selectItem.id) {
      setShowPopup(false);
      toast.error("False delete Coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {

      await deleteCoupon(selectItem.id);
      setShowPopup(false);

      if (filter) {
        handleGetDataByFilter();
      } else {
        handleGetData();
      }

      toast.success("Success delete coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error("Error delete coupon", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  }, [selectItem]);

  useEffect(() => {
    if (filter) {
      handleGetDataByFilter();
    } else {
      handleGetData();
    }
  }, [currentPage]);

  useEffect(() => {
    if (selectCoupons.length > 0) {
      setSelectCoupons([]);
    }
  }, [coupons, currentPage]);

  return (
    <ShowItemsLayout
      title="Coupons"
      titleCreate="Create Coupons"
      link="/create/coupon"
      selectItem={{
        title: selectItem?.title ? selectItem.title : "",
        id: selectItem?.id || null,
      }}
      pagination={pagination}
      handleDelete={handleDeleteCoupon}
      showPopup={showPopup}
      handlePopup={handlePopup}
    >
      <Fragment>
        <Search
          search={filter?.search || ""}
          onReset={onReset}
          onSearch={onChangeSearch}
          onFilter={handleGetDataByFilter}
          placeholder="Search by coupon code/name..."
        >
          <Fragment>
            <SelectDate
              className="lg:w-3/12 md:w-4/12 w-full"
              title="Start Date"
              name="start_date"
              value={filter?.start_date || ""}
              type="date"
              onSelect={onFilterByDate}
            />
            <SelectDate
              className="lg:w-3/12 md:w-4/12 w-full"
              title="End Date"
              name="end_date"
              value={filter?.end_date || ""}
              type="date"
              onSelect={onFilterByDate}
            />
          </Fragment>
        </Search>

        <Table
          items={coupons}
          selects={selectCoupons}
          setSelects={setSelectCoupons}
          selectAll={true}
          isSelected={selectCoupons.length === coupons.length ? true : false}
          colHeadTabel={colHeadTable}
          message={message}
          loading={loading}
        >
          <Fragment>
            {coupons.map((item: ICouponHome) => (
              <tr
                key={item._id}
                className="hover:bg-slate-100 border-b border-gray-300"
              >
                <CelTable
                  type={typeCel.SELECT}
                  isSelected={
                    selectCoupons.includes(item._id as string) ? true : false
                  }
                  onSelectCheckBox={() => onSelectCheckBox(item._id as string)}
                />
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center gap-2">
                    <ImageCus
                      title="product image"
                      src={item.discount_thumbnail as string}
                      className="min-w-[32px] w-8 h-8 rounded-full"
                    />
                    <Link
                      href={`/edit/coupon/${item._id}`}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.discount_name}
                    </Link>
                  </div>
                </CelTable>
                <CelTable
                  type={typeCel.TEXT}
                  className="whitespace-nowrap"
                  value={item.discount_code}
                  center={true}
                />
                <CelTable
                  type={typeCel.TEXT}
                  value={
                    item.discount_type === EDicount_type.PERCENTAGE
                      ? `${item.discount_value}%`
                      : `${formatBigNumber(item.discount_value)} VND`
                  }
                  center={true}
                />
                <CelTable
                  id={item._id as string}
                  type={typeCel.PUBLIC}
                  checked={item.discount_public}
                  onGetChecked={onChangePublish}
                />
                <CelTable
                  type={typeCel.DATE}
                  center={true}
                  className="whitespace-nowrap"
                  value={item.discount_start_date}
                />
                <CelTable
                  type={typeCel.DATE}
                  center={true}
                  className="whitespace-nowrap"
                  value={item.discount_end_date}
                />
                <CelTable
                  type={typeCel.STATUS}
                  status={
                    new Date() <= new Date(item.discount_end_date)
                      ? "bg-success"
                      : "bg-error"
                  }
                  value={
                    new Date() <= new Date(item.discount_end_date)
                      ? "Active"
                      : "Expried"
                  }
                />
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center justify-center gap-2">
                    <ButtonEdit link={`/edit/coupon/${item._id}`} />

                    <ButtonDelete
                      onClick={() =>
                        onSelectDeleteItem(item._id, item.discount_name)
                      }
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

export default CouponsPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      query,
    },
  };
};
