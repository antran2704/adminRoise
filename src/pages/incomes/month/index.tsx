import { useState, useEffect, useRef } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BiDollarCircle, BiPackage, BiMinusCircle } from "react-icons/bi";
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

import Statistic from "~/components/Statistic";
import { axiosGet } from "~/ultils/configAxios";
import { IGrow, IGrowDate } from "~/interface";
import { SelectItem } from "~/components/Select";
import { ISelectItem } from "~/interface";

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

const MONTHS: ISelectItem[] = [
  {
    id: "1",
    name: "1",
  },
  {
    id: "2",
    name: "2",
  },
  {
    id: "3",
    name: "3",
  },
  {
    id: "4",
    name: "4",
  },
  {
    id: "5",
    name: "5",
  },
  {
    id: "6",
    name: "6",
  },
  {
    id: "7",
    name: "7",
  },
  {
    id: "8",
    name: "8",
  },
  {
    id: "9",
    name: "9",
  },
  {
    id: "10",
    name: "10",
  },
  {
    id: "11",
    name: "11",
  },
  {
    id: "12",
    name: "12",
  },
];

const initOverview: IGrow = {
  gross: 0,
  sub_gross: 0,
  orders: 0,
  cancle_orders: 0,
  delivered_orders: 0,
  updatedAt: null,
};

interface ISelectGrowMonth {
  month: string;
  year: string;
}

const initSelectGrowMonth: ISelectGrowMonth = {
  month: (new Date().getMonth() + 1).toString(),
  year: new Date().getFullYear().toString(),
};

const initYears: ISelectItem[] = [
  {
    id: new Date().getFullYear().toString(),
    name: new Date().getFullYear().toString(),
  },
];

const IncomeMonthPage = () => {
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

  const chartMonthRef = useRef<any>();
  const [dataBarMonth, setDataBarMonth] = useState<any>(data);

  const [years, setYears] = useState<ISelectItem[]>(initYears);
  const [growMonth, setGrowMonth] = useState<IGrow>(initOverview);
  const [selectGrowMonth, setSelectGrowMonth] =
    useState<ISelectGrowMonth>(initSelectGrowMonth);

  const onChangeGrowMonth = (value: ISelectItem, name: string) => {
    if (name === "year") {
      handleGetGrossMonth(selectGrowMonth.month, value.name);
      handleGetGrossInMonth(selectGrowMonth.month, value.name);
    }

    if (name === "month") {
      handleGetGrossMonth(value.name, selectGrowMonth.year);
      handleGetGrossInMonth(value.name, selectGrowMonth.year);
    }

    setSelectGrowMonth({ ...selectGrowMonth, [name]: value.name });
  };

  const handleGetGrossMonth = async (month: string, year: string) => {
    try {
      const { status, payload } = await axiosGet(
        `/gross-month?gross_month=${month}&gross_year=${year}`
      );

      if (status === 200) {
        setGrowMonth({
          gross: payload.gross,
          orders: payload.orders,
          sub_gross: payload.sub_gross || 0,
          cancle_orders: payload.cancle_orders || 0,
          delivered_orders: payload.delivered_orders || 0,
          updatedAt: payload.updatedAt,
        });
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        setGrowMonth({
          ...initOverview,
          updatedAt: null,
        });
      }
    }
  };

  const handleGetGrossInMonth = async (month: string, year: string) => {
    const { status, payload } = await axiosGet(
      `/gross-date/month?gross_month=${month}&gross_year=${year}`
    );
    if (status === 200) {
      const days = new Date(2023, Number(month), 0).getDate();
      const newData: any = data;
      for (let i = 1; i <= days; i++) {
        newData.labels.push(`${i}/${month}`);
        newData.datasets[0].data.push(0);
        newData.datasets[1].data.push(0);
      }

      payload.map((item: IGrowDate) => {
        const day = Number(item.day);
        newData.datasets[0].data[day - 1] = item.sub_gross;
        newData.datasets[1].data[day - 1] = item.gross;
      });
      chartMonthRef.current.update();
      setDataBarMonth(newData);
    }
  };

  const handleGetYear = async () => {
    const { status, payload } = await axiosGet("/gross-year?year=1");
    if (status === 200 && payload.length > 0) {
      const items: ISelectItem[] = payload.map((item: any) => ({
        id: item.year,
        name: item.year,
      }));

      setYears(items);
    }
  };

  useEffect(() => {
    handleGetGrossMonth(selectGrowMonth.month, selectGrowMonth.year);
    handleGetGrossInMonth(selectGrowMonth.month, selectGrowMonth.year);
    handleGetYear();
  }, []);

  return (
    <section className="scrollHidden relative flex flex-col items-start w-full h-full px-5 pb-5 pt-5 overflow-auto gap-5">
      <div className="w-full">
        <h1 className="md:text-3xl text-2xl font-bold">
          {" "}
          Dashboard Overview Income Month
        </h1>
      </div>

      <div className="w-full rounded-xl py-5">
        <div className="flex items-center gap-5">
          <SelectItem
            width="lg:w-2/12 md:w-3/12 w-5/12"
            title="Select month"
            name="month"
            value={selectGrowMonth.month}
            data={MONTHS}
            onSelect={onChangeGrowMonth}
          />

          <SelectItem
            width="lg:w-2/12 md:w-3/12 w-5/12"
            title="Select year"
            name="year"
            value={selectGrowMonth.year}
            data={years}
            onSelect={onChangeGrowMonth}
          />
        </div>

        <div className="mt-5">
          <p className="text-lg font-medium text-center">
            Thu nhập tháng {selectGrowMonth.month} năm {selectGrowMonth.year}
          </p>
          {growMonth.updatedAt && (
            <p className="text-lg font-medium text-center">
              (Dữ liệu cập nhật lúc{" "}
              {new Date(growMonth.updatedAt).toLocaleTimeString()} ngày{" "}
              {new Date(growMonth.updatedAt).toLocaleDateString("en-GB")})
            </p>
          )}
          {!growMonth.updatedAt && (
            <p className="text-lg font-medium text-center">Chưa có dữ liệu</p>
          )}
        </div>

        <div
          className={`grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full h-full md:max-h-max gap-2 overflow-hidden transition-all ease-in-out duration-300 my-5`}
        >
          <Statistic
            title="Thu nhập tạm tính"
            IconElement={<BiDollarCircle className="text-4xl" />}
            to={growMonth.sub_gross}
            backgroundColor="bg-[#5032fd]"
            duration={0}
            specialCharacter="VND"
          />
          <Statistic
            title="Tổng thu nhập"
            IconElement={<BiDollarCircle className="text-4xl" />}
            to={growMonth.gross}
            backgroundColor="bg-[#5032fd]"
            duration={0}
            specialCharacter="VND"
          />

          <Statistic
            title="Tổng đơn hàng"
            IconElement={<AiOutlineShoppingCart className="text-4xl" />}
            to={growMonth.orders}
            backgroundColor="bg-[#0891b2]"
            duration={0}
          />

          <Statistic
            title="Đơn hàng thành công"
            IconElement={<BiPackage className="text-4xl" />}
            to={growMonth.delivered_orders}
            backgroundColor="bg-success"
            duration={0}
          />

          <Statistic
            title="Đơn hàng thành công"
            IconElement={<BiMinusCircle className="text-4xl" />}
            to={growMonth.cancle_orders}
            backgroundColor="bg-cancle"
            duration={0}
          />
        </div>

        <Bar ref={chartMonthRef} options={options} data={dataBarMonth} />
      </div>
    </section>
  );
};

export default IncomeMonthPage;
