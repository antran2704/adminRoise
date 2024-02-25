import { AiOutlineSetting, AiOutlineShoppingCart } from "react-icons/ai";
import { BiCategoryAlt, BiCube } from "react-icons/bi";
import { RxDashboard } from "react-icons/rx";
import { ReactNode } from "react";
import { HiOutlineUsers } from "react-icons/hi2";

export interface itemNav {
  name: string;
  path: string;
  icon?: ReactNode;
  children?: itemNav[];
}

const listBody: itemNav[] = [
  {
    name: "Trang chủ",
    path: "/",
    icon: <RxDashboard />,
  },
  {
    name: "Sản phẩm",
    path: "/products",
    icon: <BiCube />,
  },
  {
    name: "Catalog",
    path: "/",
    icon: <BiCategoryAlt />,
    children: [
      {
        name: "Danh mục",
        path: "/categories",
      },
      {
        name: "Attributes",
        path: "/attributes",
      },
      {
        name: "Mã giảm giá",
        path: "/coupons",
      },
    ],
  },
  {
    name: "Đơn hàng",
    path: "/orders",
    icon: <AiOutlineShoppingCart />,
  },
  // {
  //   name: "Income",
  //   path: "/",
  //   icon: <BiDollarCircle />,
  //   children: [
  //     {
  //       name: "Date",
  //       path: "/incomes/date",
  //     },
  //     {
  //       name: "Week",
  //       path: "/incomes/week",
  //     },
  //     {
  //       name: "Month",
  //       path: "/incomes/month",
  //     },
  //     {
  //       name: "Year",
  //       path: "/incomes/year",
  //     },
  //   ],
  // },
  {
    name: "Khách hàng",
    path: "/customer",
    icon: <HiOutlineUsers />,
  },
];

const listSetting: itemNav[] = [
  {
    name: "Chỉnh sửa",
    path: "/setting",
    icon: <AiOutlineSetting />,
  },
];

export { listBody, listSetting };
