import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useEffect, useState, useCallback, Fragment } from "react";

import { IOrder } from "~/interface/order";
import { IPagination } from "~/interface/pagination";

import { colHeadOrder as colHeadTable } from "~/components/Table/colHeadTable";
import Search from "~/components/Search";
import ShowItemsLayout from "~/layouts/ShowItemsLayout";
import { CelTable, Table } from "~/components/Table";
import { typeCel } from "~/enums";
import { orderStatus } from "~/components/Table/statusCel";
import { ButtonEdit } from "~/components/Button";
import { IFilter, ISelectItem } from "~/interface";
import { SelectDate, SelectItem } from "~/components/Select";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import { useRouter } from "next/router";
import { initPagination } from "~/components/Pagination/initData";
import { getOrders, getOrdersWithFilter } from "~/api-client";

interface Props {
  query: InferGetServerSidePropsType<typeof getServerSideProps>;
}

const dataFilterStatus: ISelectItem[] = [
  {
    id: "delivered",
    name: "delivered",
  },
  {
    id: "pending",
    name: "pending",
  },
  {
    id: "cancle",
    name: "cancle",
  },
  {
    id: "processing",
    name: "processing",
  },
];

const dataFilterMethod: ISelectItem[] = [
  {
    id: "cash",
    name: "Cash",
  },
  {
    id: "card",
    name: "Card",
  },
];

const OrdersPage = (props: Props) => {
  const { query } = props;
  const currentPage = query.page ? query.page : 1;
  const router = useRouter();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [message, setMessage] = useState<string | null>("Feature is locking 😟");
  const [filter, setFilter] = useState<IFilter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(initPagination);

  const onChangeSearch = useCallback(
    (name: string, value: string) => {
      setFilter({ ...filter, [name]: value });
    },
    [filter]
  );

  const onSelect = useCallback(
    (value: ISelectItem, name: string) => {
      setFilter({ ...filter, [name]: value.name });
      router.replace({
        query: {},
      });
    },
    [filter]
  );

  const onSelectDate = useCallback(
    (value: string, name: string) => {
      setFilter({ ...filter, [name]: value });
      router.replace({
        query: {},
      });
    },
    [filter]
  );

  const onReset = useCallback(() => {
    setFilter(null);
    handleGetData();
  }, [filter, orders]);

  const handleGetDataByFilter = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOrdersWithFilter(filter, currentPage);

      if (response.status === 200) {
        if (response.payload.length === 0) {
          setOrders([]);
          setMessage(`No data`);
        } else {
          setMessage(null);
          setOrders(response.payload);
        }
      }

      setPagination(response.pagination);
      setLoading(false);
    } catch (error) {
      setOrders([]);
      setPagination(initPagination);
      setMessage(`No order`);
      setLoading(false);
    }
  }, [filter, currentPage]);

  const handleGetData = async () => {
    setLoading(true);
    try {
      const response = await getOrders(currentPage);
      if (response.status === 200) {
        if (response.payload.length === 0) {
          setOrders([]);
          setMessage(`No Data`);
        } else {
          setMessage(null);
          setOrders(response.payload);
        }
      }

      setPagination(response.pagination);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setOrders([]);
      setMessage(`No Data`);
      setPagination(initPagination);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (filter) {
  //     handleGetDataByFilter();
  //   } else {
  //     handleGetData();
  //   }
  // }, [currentPage]);

  return (
    <ShowItemsLayout
      title="Orders"
      titleCreate="Create order"
      pagination={pagination}
    >
      <Fragment>
        <Search
          search={filter?.search || ""}
          onReset={onReset}
          onSearch={onChangeSearch}
          onFilter={handleGetDataByFilter}
          placeholder="Search by customer name/order ID..."
        >
          <Fragment>
            <SelectItem
              width="lg:w-2/12 md:w-4/12 w-full"
              placeholder="Status"
              name="status"
              value={filter?.status || ""}
              data={dataFilterStatus}
              onSelect={onSelect}
            />
            <SelectItem
              width="lg:w-2/12 md:w-4/12 w-full"
              placeholder="Payment Method"
              name="payment_method"
              value={filter?.payment_method || ""}
              data={dataFilterMethod}
              onSelect={onSelect}
            />

            <SelectDate
              className="lg:w-2/12 md:w-4/12 w-full"
              title="Start Date"
              name="start_date"
              value={filter?.start_date || ""}
              type="date"
              onSelect={onSelectDate}
            />
            <SelectDate
              className="lg:w-2/12 md:w-4/12 w-full"
              title="End Date"
              name="end_date"
              value={filter?.end_date || ""}
              type="date"
              onSelect={onSelectDate}
            />
          </Fragment>
        </Search>

        <Table
          colHeadTabel={colHeadTable}
          items={orders}
          loading={loading}
          message={message}
        >
          <Fragment>
            {orders.map((order: IOrder) => (
              <tr
                key={order._id}
                className="hover:bg-slate-100 border-b border-gray-300"
              >
                <CelTable
                  type={typeCel.TEXT}
                  className="whitespace-nowrap"
                  value={order.order_id}
                  center={true}
                />
                <CelTable
                  type={typeCel.TEXT}
                  className="whitespace-nowrap"
                  value={order.user_infor.name}
                />
                <CelTable
                  center={true}
                  type={typeCel.TEXT}
                  className="capitalize"
                  value={order.payment_method}
                />
                <CelTable
                  center={true}
                  type={typeCel.TEXT}
                  value={`${formatBigNumber(order.total)} VND`}
                />
                <CelTable
                  type={typeCel.STATUS}
                  value={order.status}
                  status={orderStatus[order.status]}
                />
                <CelTable
                  center={true}
                  type={typeCel.DATE}
                  value={order.createdAt}
                />
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center justify-center">
                    <ButtonEdit link={`/orders/${order._id}`} />
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

export default OrdersPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return { props: { query } };
};
