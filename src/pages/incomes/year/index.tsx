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
import { IGrow } from "~/interface";
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
  maintainAspectRatio: false,
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

interface ISelectGrowYear {
  year: string;
}

const initSelectGrowYear: ISelectGrowYear = {
  year: new Date().getFullYear().toString(),
};

const initYears: ISelectItem[] = [
  {
    id: new Date().getFullYear().toString(),
    name: new Date().getFullYear().toString(),
  },
];

const IncomeYearPage = () => {
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

  const chartYearRef = useRef<any>();
  const [dataBarYear, setDataBarYear] = useState<any>(data);

  const [years, setYears] = useState<ISelectItem[]>(initYears);
  const [growYear, setGrowYear] = useState<IGrow>(initOverview);
  const [selectGrowYear, setSelectGrowYear] =
    useState<ISelectGrowYear>(initSelectGrowYear);

  const onChangeGrowYear = (value: ISelectItem, name: string) => {
    handleGetGrossYear(value.name);
    handleGetGrossInYear(value.name);
    setSelectGrowYear({ ...selectGrowYear, [name]: value.name });
  };

  const handleGetGrossInYear = async (year: string) => {
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
    handleGetGrossYear(selectGrowYear.year);
    handleGetGrossInYear(selectGrowYear.year);
    handleGetYear();
  }, []);

  return (
    <section className="scrollHidden relative flex flex-col items-start w-full h-full px-5 pb-5 pt-5 overflow-auto gap-5">
      <div className="w-full">
        <h1 className="md:text-3xl text-2xl font-bold">
          {" "}
          Dashboard Overview Income Year
        </h1>
      </div>

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
            <p className="text-lg font-medium text-center">Chưa có dữ liệu</p>
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
              ref={chartYearRef}
              className="w-full min-h-[400px]"
              options={options}
              data={dataBarYear}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default IncomeYearPage;
