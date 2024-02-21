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

import { axiosGet } from "~/ultils/configAxios";
import { SelectDate, SelectItem, SelectTag } from "~/components/Select";
import { ISelectItem } from "~/interface";
import Statistic from "~/components/Statistic";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

enum TYPE_TAG {
  DATE = "date",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

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

interface IGrow {
  gross: number;
  sub_gross: number;
  orders: number;
  delivered_orders: number;
  cancle_orders: number;
  updatedAt?: string | null;
}

interface IGrowDate extends IGrow {
  day?: string;
  month?: string;
  year?: string;
  date: string;
}

interface ISelectGrowWeek {
  startDay: string;
  endDay: string;
  year: string;
  month: string;
}

interface ISelectGrowMonth {
  month: string;
  year: string;
}

interface ISelectGrowYear {
  year: string;
}

const initOverview: IGrow = {
  gross: 0,
  sub_gross: 0,
  orders: 0,
  cancle_orders: 0,
  delivered_orders: 0,
  updatedAt: null,
};

const initOverviewDate: IGrowDate = {
  ...initOverview,
  date: new Date().toLocaleDateString(),
};

const initSelectGrowWeek: ISelectGrowWeek = {
  startDay: "",
  endDay: "",
  year: "",
  month: "",
};

const initSelectGrowMonth: ISelectGrowMonth = {
  month: (new Date().getMonth() + 1).toString(),
  year: new Date().getFullYear().toString(),
};

const initSelectGrowYear: ISelectGrowYear = {
  year: new Date().getFullYear().toString(),
};

const initYears: ISelectItem[] = [
  {
    id: new Date().getFullYear().toString(),
    name: new Date().getFullYear().toString(),
  },
];

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

const getFirstDayInWeek = (value: string) => {
  const firstDay = new Date(value);
  firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1);
  return firstDay;
};

const getEndDayInWeek = (value: string) => {
  const endDay = new Date(value);
  endDay.setDate(endDay.getDate() - endDay.getDay() + 7);
  return endDay;
};

export default function IncomePage() {
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
  const chartMonthRef = useRef<any>();
  const chartYearRef = useRef<any>();

  const [tag, setTag] = useState<TYPE_TAG>(TYPE_TAG.DATE);

  const [years, setYears] = useState<ISelectItem[]>(initYears);

  const [dataBarWeek, setDataBarWeek] = useState<any>(data);
  const [dataBarMonth, setDataBarMonth] = useState<any>(data);
  const [dataBarYear, setDataBarYear] = useState<any>(data);

  const [growDate, setGrowDate] = useState<IGrowDate>(initOverviewDate);
  const [growWeek, setGrowWeek] = useState<IGrowDate>(initOverviewDate);
  const [growMonth, setGrowMonth] = useState<IGrow>(initOverview);
  const [growYear, setGrowYear] = useState<IGrow>(initOverview);

  const [selectDate, setSelectDate] = useState<string>(
    `${new Date().getFullYear()}-${
      new Date().getMonth() + 1
    }-${new Date().getDate()}`
  );

  const [selectGrowWeek, setSelectGrowWeek] =
    useState<ISelectGrowWeek>(initSelectGrowWeek);

  const [selectGrowMonth, setSelectGrowMonth] =
    useState<ISelectGrowMonth>(initSelectGrowMonth);

  const [selectGrowYear, setSelectGrowYear] =
    useState<ISelectGrowYear>(initSelectGrowYear);

  const onSelecTag = (value: string) => {
    if (value === TYPE_TAG.MONTH && !growMonth.updatedAt) {
      handleGetGrossMonth(selectGrowMonth.month, selectGrowMonth.year);
      handleGetGrossInMonth(selectGrowMonth.month, selectGrowMonth.year);
    }

    if (value === TYPE_TAG.YEAR && !growYear.updatedAt) {
      handleGetGrossYear(selectGrowYear.year);
      handleGetGrossInYear(selectGrowYear.year);
    }

    if (value === TYPE_TAG.WEEK && !growWeek.updatedAt) {
      const firstDay = getFirstDayInWeek(new Date().toDateString());
      handleGetGrossInWeek(firstDay);
    }

    setTag(value as TYPE_TAG);
  };

  const onSelectWeek = (value: Date) => {
    if (!value) return;

    handleGetGrossInWeek(value);
  };

  const onSelectDate = (value: string) => {
    if (!value) return;

    handleGetGrossDate(value);
    setSelectDate(value);
  };

  const onChangeGrowYear = (value: ISelectItem, name: string) => {
    handleGetGrossYear(value.name);
    handleGetGrossInYear(value.name);

    setSelectGrowYear({ ...selectGrowYear, [name]: value.name });
  };

  const onChangeGrowMonth = (value: ISelectItem, name: string) => {
    if (name === "year") {
      handleGetGrossMonth(selectGrowMonth.month, value.name);
      handleGetGrossInMonth(selectGrowMonth.month, value.name);
    }

    if (name === "month") {
      handleGetGrossMonth(value.name, selectGrowMonth.year);
      handleGetGrossInMonth(value.name, selectGrowMonth.year);
    }

    setSelectGrowMonth({ ...selectGrowMonth, [name]: value });
  };

  const handleGetGrossDate = async (date: string) => {
    const convertDate = new Date(date).toLocaleDateString("en-GB");

    try {
      const { status, payload } = await axiosGet(
        `/gross-date?gross_date=${convertDate}`
      );

      if (status === 200) {
        setGrowDate({
          date: convertDate,
          gross: payload.gross,
          orders: payload.orders.length,
          sub_gross: payload.sub_gross || 0,
          cancle_orders: payload.cancle_orders || 0,
          delivered_orders: payload.delivered_orders || 0,
          updatedAt: payload.updatedAt,
        });
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        setGrowDate({
          ...initOverviewDate,
          date: convertDate,
          updatedAt: null,
        });
      }
      console.log(error);
    }
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
      console.log(error);
    }
  };

  const handleGetGrossInMonth = async (month: string, year: string) => {
    try {
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
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleGetGrossInWeek = async (startDate: Date) => {
    const endDay = getEndDayInWeek(startDate.toDateString())
      .getDate()
      .toString();
    const month = (startDate.getMonth() + 1).toString();
    const year = startDate.getFullYear().toString();

    try {
      const { status, payload } = await axiosGet(
        `/gross-date/week?start_date=${startDate.toDateString()}`
      );

      const startDay = startDate.getDate();
      const newData: any = data;

      for (let i = 0; i <= 6; i++) {
        const nextDay = new Date();
        nextDay.setDate(startDay + i);
        newData.labels.push(nextDay.getDate());
        newData.datasets[0].data[i] = 0;
        newData.datasets[1].data[i] = 0;
      }

      if (payload.length === 0) {
        setGrowWeek(initOverviewDate);
        setDataBarWeek(newData);
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
        });

        const dataOverview: IGrowDate = payload.reduce(
          (accumulator: IGrow, item: any) => {
            accumulator = {
              gross: accumulator.gross + (item.gross || 0),
              sub_gross: accumulator.sub_gross + (item.sub_gross || 0),
              orders: accumulator.orders + (item.orders.length || 0),
              cancle_orders:
                accumulator.cancle_orders + (item.cancle_orders || 0),
              delivered_orders:
                accumulator.delivered_orders + (item.delivered_orders || 0),
              updatedAt: null,
            };

            return accumulator;
          },
          initOverview
        );

        dataOverview.updatedAt = payload[payload.length - 1].updatedAt;
        dataOverview.date = payload[payload.length - 1].date;

        setGrowWeek(dataOverview);
        setDataBarWeek(newData);
        chartWeekRef.current.update();
      }

      setSelectGrowWeek({ startDay: startDay.toString(), endDay, year, month });
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleGetGrossInYear = async (year: string) => {
    try {
      const { status, payload } = await axiosGet(
        `/gross-month/year?gross_year=${year}`
      );

      if (status === 200) {
        const newData: any = data;

        for (let i = 1; i <= MONTHS.length; i++) {
          newData.labels.push(i);
          newData.datasets[0].data.push(0);
          newData.datasets[1].data.push(0);
        }

        payload.map((item: any) => {
          const month = Number(item.month);
          newData.datasets[0].data[month - 1] = item.sub_gross;
          newData.datasets[1].data[month - 1] = item.gross;
        });
        chartYearRef.current.update();
        setDataBarYear(newData);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleGetGrossYear = async (year: string) => {
    try {
      const { status, payload } = await axiosGet(
        `/gross-year/year?gross_year=${year}`
      );

      if (status === 200) {
        setGrowYear({
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
        setGrowYear({
          ...initOverview,
          updatedAt: null,
        });
      }
      console.log(error);
    }
  };

  const handleGetYear = async () => {
    try {
      const { status, payload } = await axiosGet("/gross-year?year=1");
      if (status === 200 && payload.length > 0) {
        const items: ISelectItem[] = payload.map((item: any) => ({
          id: item.year,
          name: item.year,
        }));

        setYears(items);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetGrossDate(new Date().toString());
    handleGetYear();
  }, []);

  return (
    <section className="scrollHidden relative flex flex-col items-start w-full h-full px-5 pb-5 pt-5 overflow-auto gap-5">
      <div className="w-full">
        <h1 className="md:text-3xl text-2xl font-bold">Income</h1>
      </div>
      <div className="w-full">
        <h2 className="text-title mb-4">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <SelectTag
            size="L"
            value={TYPE_TAG.DATE}
            title="Date"
            onSelect={onSelecTag}
            currentSelect={tag}
          />
          <SelectTag
            size="L"
            value={TYPE_TAG.WEEK}
            title="Week"
            onSelect={onSelecTag}
            currentSelect={tag}
          />
          <SelectTag
            size="L"
            value={TYPE_TAG.MONTH}
            title="Month"
            onSelect={onSelecTag}
            currentSelect={tag}
          />
          <SelectTag
            size="L"
            value="year"
            title="Year"
            onSelect={onSelecTag}
            currentSelect={tag}
          />
        </div>
      </div>

      <div className="w-full gap-10">
        <div
          className={`${
            tag === TYPE_TAG.DATE ? "block" : "hidden"
          } w-full rounded-xl py-5`}
        >
          <SelectDate
            type="date"
            title="Select Date"
            name="date"
            className="lg:w-2/12 md:w-3/12 w-5/12 mb-5"
            value={selectDate || ""}
            onSelect={onSelectDate}
          />

          <div>
            <h3 className="text-lg font-medium text-center">
              Thu nhập ngày: {growDate.date}
            </h3>
            {growDate.updatedAt && (
              <p className="text-lg font-medium text-center">
                (Dữ liệu cập nhật lúc{" "}
                {new Date(growDate.updatedAt).toLocaleTimeString()} ngày{" "}
                {new Date(growDate.updatedAt).toLocaleDateString("en-GB")})
              </p>
            )}
            {!growDate.updatedAt && (
              <p className="text-lg font-medium text-center">Chưa có dữ liệu</p>
            )}
          </div>
          <div
            className={`grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 w-full h-full md:max-h-max gap-2 overflow-hidden transition-all ease-in-out duration-300 mt-5`}
          >
            <Statistic
              title="Thu nhập tạm tính"
              IconElement={<BiDollarCircle className="text-4xl" />}
              to={growDate.sub_gross}
              backgroundColor="bg-[#5032fd]"
              duration={0}
              specialCharacter="VND"
            />
            <Statistic
              title="Tổng thu nhập"
              IconElement={<BiDollarCircle className="text-4xl" />}
              to={growDate.gross}
              backgroundColor="bg-[#5032fd]"
              duration={0}
              specialCharacter="VND"
            />

            <Statistic
              title="Tổng đơn hàng"
              IconElement={<AiOutlineShoppingCart className="text-4xl" />}
              to={growDate.orders}
              backgroundColor="bg-[#0891b2]"
              duration={0}
            />

            <Statistic
              title="Đơn hàng thành công"
              IconElement={<BiPackage className="text-4xl" />}
              to={growDate.delivered_orders}
              backgroundColor="bg-success"
              duration={0}
            />

            <Statistic
              title="Đơn hàng thành công"
              IconElement={<BiMinusCircle className="text-4xl" />}
              to={growDate.cancle_orders}
              backgroundColor="bg-cancle"
              duration={0}
            />
          </div>
        </div>

        {tag === TYPE_TAG.WEEK && (
          <div className="w-full rounded-xl py-5">
            <div className="lg:w-2/12 md:w-3/12 w-5/12 mb-5">
              <input
                type="week"
                onChange={(e) => onSelectWeek(e.target.valueAsDate as Date)}
                className="w-full min-h-[40px] rounded-md px-2 py-1 border-2 focus:border-[#4f46e5]"
              />
            </div>

            <div className="my-10">
              <p className="text-lg font-medium text-center">
                Thu nhập từ ngày {selectGrowWeek.startDay} đến ngày{" "}
                {selectGrowWeek.endDay} tháng {selectGrowWeek.month} năm{" "}
                {selectGrowWeek.year}
              </p>
              {growWeek.updatedAt && (
                <p className="text-lg font-medium text-center">
                  (Dữ liệu cập nhật lúc{" "}
                  {new Date(growWeek.updatedAt).toLocaleTimeString()} ngày{" "}
                  {new Date(growWeek.updatedAt).toLocaleDateString("en-GB")})
                </p>
              )}
              {!growWeek.updatedAt && (
                <p className="text-lg font-medium text-center">
                  Chưa có dữ liệu
                </p>
              )}
            </div>

            <div className="flex lg:flex-row flex-col items-start my-5 gap-10">
              <div
                className={`grid md:grid-cols-2 grid-cols-1 lg:w-6/12 w-full h-full md:max-h-max gap-2 overflow-hidden transition-all ease-in-out duration-300`}
              >
                <Statistic
                  title="Thu nhập tạm tính"
                  IconElement={<BiDollarCircle className="text-4xl" />}
                  to={growWeek.sub_gross}
                  backgroundColor="bg-[#5032fd]"
                  duration={0}
                  specialCharacter="VND"
                />
                <Statistic
                  title="Tổng thu nhập"
                  IconElement={<BiDollarCircle className="text-4xl" />}
                  to={growWeek.gross}
                  backgroundColor="bg-[#5032fd]"
                  duration={0}
                  specialCharacter="VND"
                />

                <Statistic
                  title="Tổng đơn hàng"
                  IconElement={<AiOutlineShoppingCart className="text-4xl" />}
                  to={growWeek.orders}
                  backgroundColor="bg-[#0891b2]"
                  duration={0}
                />

                <Statistic
                  title="Đơn hàng thành công"
                  IconElement={<BiPackage className="text-4xl" />}
                  to={growWeek.delivered_orders}
                  backgroundColor="bg-success"
                  duration={0}
                />

                <Statistic
                  title="Đơn hàng thành công"
                  IconElement={<BiMinusCircle className="text-4xl" />}
                  to={growWeek.cancle_orders}
                  backgroundColor="bg-cancle"
                  duration={0}
                />
              </div>

              <div className="lg:w-6/12 w-full">
                <Bar
                  className="w-full"
                  ref={chartWeekRef}
                  options={options}
                  data={dataBarWeek}
                />
              </div>
            </div>
          </div>
        )}

        {tag === TYPE_TAG.MONTH && (
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
                Thu nhập tháng {selectGrowMonth.month} năm{" "}
                {selectGrowMonth.year}
              </p>
              {growMonth.updatedAt && (
                <p className="text-lg font-medium text-center">
                  (Dữ liệu cập nhật lúc{" "}
                  {new Date(growMonth.updatedAt).toLocaleTimeString()} ngày{" "}
                  {new Date(growMonth.updatedAt).toLocaleDateString("en-GB")})
                </p>
              )}
              {!growMonth.updatedAt && (
                <p className="text-lg font-medium text-center">
                  Chưa có dữ liệu
                </p>
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
        )}

        {tag === TYPE_TAG.YEAR && (
          <div className="w-full rounded-xl py-5">
            <div className="flex items-center gap-5">
              <SelectItem
                width="lg:w-2/12 md:w-3/12 w-5/12"
                title="Select year"
                name="year"
                value={selectGrowYear.year}
                data={years}
                onSelect={onChangeGrowYear}
              />
            </div>

            <div className="mt-5">
              <p className="text-lg font-medium text-center">
                Thu nhập năm {selectGrowYear.year}
              </p>
              {growYear.updatedAt && (
                <p className="text-lg font-medium text-center">
                  (Dữ liệu cập nhật lúc{" "}
                  {new Date(growYear.updatedAt).toLocaleTimeString()} ngày{" "}
                  {new Date(growYear.updatedAt).toLocaleDateString("en-GB")})
                </p>
              )}
              {!growYear.updatedAt && (
                <p className="text-lg font-medium text-center">
                  Chưa có dữ liệu
                </p>
              )}
            </div>
            <div className="flex lg:flex-row flex-col items-start my-5 gap-10">
              <div
                className={`grid md:grid-cols-2 grid-cols-1 lg:w-6/12 w-full h-full md:max-h-max gap-2 overflow-hidden transition-all ease-in-out duration-300`}
              >
                <Statistic
                  title="Thu nhập tạm tính"
                  IconElement={<BiDollarCircle className="text-4xl" />}
                  to={growYear.sub_gross}
                  backgroundColor="bg-[#5032fd]"
                  duration={0}
                  specialCharacter="VND"
                />
                <Statistic
                  title="Tổng thu nhập"
                  IconElement={<BiDollarCircle className="text-4xl" />}
                  to={growYear.gross}
                  backgroundColor="bg-[#5032fd]"
                  duration={0}
                  specialCharacter="VND"
                />

                <Statistic
                  title="Tổng đơn hàng"
                  IconElement={<AiOutlineShoppingCart className="text-4xl" />}
                  to={growYear.orders}
                  backgroundColor="bg-[#0891b2]"
                  duration={0}
                />

                <Statistic
                  title="Đơn hàng thành công"
                  IconElement={<BiPackage className="text-4xl" />}
                  to={growYear.delivered_orders}
                  backgroundColor="bg-success"
                  duration={0}
                />

                <Statistic
                  title="Đơn hàng thành công"
                  IconElement={<BiMinusCircle className="text-4xl" />}
                  to={growYear.cancle_orders}
                  backgroundColor="bg-cancle"
                  duration={0}
                />
              </div>

              <div className="lg:w-6/12 w-full">
                <Bar
                  className="w-full"
                  ref={chartYearRef}
                  options={options}
                  data={dataBarYear}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
