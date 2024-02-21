import { useState, useEffect, useRef, Fragment } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import {
  MdOutlineKeyboardDoubleArrowDown,
  MdOutlineKeyboardDoubleArrowUp,
} from "react-icons/md";
import {
  BiCircleThreeQuarter,
  BiDollarCircle,
  BiPackage,
  BiMinusCircle,
} from "react-icons/bi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { colHeadOrder as colHeadTable } from "~/components/Table/colHeadTable";
import { Table, CelTable } from "~/components/Table";

import { typeCel } from "~/enums";
import Link from "next/link";
import SpringCount from "~/components/SpringCount";
import { axiosGet } from "~/ultils/configAxios";
import { getFirstDayInWeek } from "~/helper/datetime";
import { IGrowDate } from "~/interface";
import Statistic from "~/components/Statistic";
import { IOrder } from "~/interface/order";
import { getOrders } from "~/api-client";
import { formatBigNumber } from "~/helper/number/fomatterCurrency";
import { orderStatus } from "~/components/Table/statusCel";
import { ButtonEdit } from "~/components/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Overview in week",
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

interface IOverview {
  gross: number;
  total_orders: string[];
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancle_orders: number;
}

const initOveviews: IOverview = {
  gross: 0,
  total_orders: [],
  processing_orders: 0,
  cancle_orders: 0,
  delivered_orders: 0,
  pending_orders: 0,
};

export default function Home() {
  const data = {
    labels: [],
    datasets: [
      {
        label: "Sub Gross",
        data: [],
        backgroundColor: "rgb(255, 99, 132)",
        borderRadius: 10,
        borderWidth: 0,
      },
      {
        label: "Gross",
        data: [],
        backgroundColor: "rgb(75, 192, 192)",
        borderRadius: 10,
        borderWidth: 0,
      },
    ],
  };

  const chartWeekRef = useRef<any>();

  const [overviews, setOverviews] = useState<IOverview>(initOveviews);
  const [dataBarWeek, setDataBarWeek] = useState<any>(data);
  const [totalWeek, setTotalWeek] = useState<number>(0);

  const [orders, setOrders] = useState<IOrder[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGetOverviews = async () => {
    try {
      const date = new Date().toLocaleDateString("en-GB");
      const { status, payload } = await axiosGet(
        `/overviews/home?date=${date}`
      );

      if (status === 200) {
        setOverviews(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetGrossInWeek = async (startDate: Date) => {
    try {
      const { status, payload } = await axiosGet(
        `/gross-date/week?start_date=${startDate.toDateString()}`
      );

      const startDay = startDate.getDate();
      const newData: any = data;
      let total: number = 0;

      for (let i = 0; i <= 6; i++) {
        const nextDay = new Date();
        nextDay.setDate(startDay + i);
        newData.labels.push(nextDay.getDate());
        newData.datasets[0].data[i] = 0;
        newData.datasets[1].data[i] = 0;
      }

      if (payload.length === 0) {
        setDataBarWeek(newData);
        setTotalWeek(0);
        chartWeekRef.current.update();
      }

      if (status === 200 && payload.length > 0) {
        payload.map((item: IGrowDate) => {
          const day = Number(item.day);
          const index = newData.labels.findIndex(
            (label: number) => label === day
          );
          newData.datasets[0].data[index] = item.sub_gross;
          newData.datasets[1].data[index] = item.gross;
          total += item.gross;
        });

        setTotalWeek(total);
        setDataBarWeek(newData);
        chartWeekRef.current.update();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleGetData = async () => {
    setLoading(true);
    try {
      const response = await getOrders(1);
      if (response.status === 200) {
        if (response.payload.length === 0) {
          setOrders([]);
          setMessage(`No Data`);
        } else {
          setMessage(null);
          setOrders(response.payload);
        }
      }

      setLoading(false);
    } catch (error) {
      setOrders([]);
      setMessage(`No Data`);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const firstDay = getFirstDayInWeek(new Date().toDateString());
  //   handleGetGrossInWeek(firstDay);
  //   handleGetOverviews();
  //   handleGetData();
  // }, []);

  return (
    <section className="scrollHidden relative flex flex-col items-start w-full h-full px-5 pb-5 pt-5 overflow-auto gap-5">
      <div className="w-full h-[10%] mb-5">
        <h1 className="md:text-3xl text-2xl font-bold mb-1">
          Welcome Admin Dashboard
        </h1>
        <p className="text-lg font-medium">
          Manager your maketing's performence
        </p>
      </div>
      <div className="w-full lg:mb-10 mb-5">
        <h2 className="text-title mb-4">Dashboard Overview</h2>
        <div className="h-full gap-10">
          <div className="relative w-full mb-10">
            <div
              className={`grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 w-full h-full md:max-h-max ${
                show ? "max-h-[2000px]" : "max-h-[600px]"
              } gap-2 overflow-hidden transition-all ease-in-out duration-300`}
            >
              <Statistic
                title="Thu nhập hôm nay"
                IconElement={<BiDollarCircle className="text-4xl" />}
                to={overviews.gross}
                backgroundColor="bg-[#5032fd]"
                duration={0.5}
                specialCharacter="VND"
              />

              <Statistic
                title="Đơn hàng hôm nay"
                IconElement={<AiOutlineShoppingCart className="text-4xl" />}
                to={overviews.total_orders.length}
                backgroundColor="bg-[#0891b2]"
                duration={0.5}
              />

              <Statistic
                title="Tổng đơn hàng thành công"
                IconElement={<BiPackage className="text-4xl" />}
                to={overviews.delivered_orders}
                backgroundColor="bg-[#0891b2]"
                duration={0.5}
              />

              <Statistic
                title="Chờ xác nhận"
                IconElement={<BiPackage className="text-4xl" />}
                to={overviews.pending_orders}
                backgroundColor="bg-warn"
                duration={0.5}
              />

              <Statistic
                title="Đang chuẩn bị hàng"
                IconElement={<BiCircleThreeQuarter className="text-4xl" />}
                to={overviews.processing_orders}
                backgroundColor="bg-primary"
                duration={0.5}
              />

              <Statistic
                title="Tổng đơn hủy"
                IconElement={<BiMinusCircle className="text-4xl" />}
                to={overviews.cancle_orders}
                backgroundColor="bg-cancle"
                duration={0.5}
              />
            </div>

            <button
              onClick={() => setShow(!show)}
              className="md:hidden block absolute -bottom-10 left-1/2 -translate-x-1/2 select-none"
            >
              {!show && (
                <MdOutlineKeyboardDoubleArrowDown className="text-3xl text-primary" />
              )}
              {show && (
                <MdOutlineKeyboardDoubleArrowUp className="text-3xl text-primary" />
              )}
            </button>
          </div>
          <div className="lg:w-3/4 w-full h-full bg-[#f4f7ff] rounded-xl p-5 mx-auto">
            <div>
              <SpringCount
                className="text-lg font-bold"
                from={0}
                to={totalWeek}
                specialCharacter="VND"
                duration={0.5}
              />
            </div>
            <Bar ref={chartWeekRef} options={options} data={dataBarWeek} />
          </div>
        </div>
      </div>
      <div className="w-full pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title">Recent Order</h2>
          <Link
            href={"/orders"}
            className="text-base font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div>
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
        </div>
      </div>
    </section>
  );
}
