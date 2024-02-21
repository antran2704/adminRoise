import { AiOutlineSetting, AiOutlineShoppingCart } from "react-icons/ai";
import { BiCategoryAlt, BiDollarCircle } from "react-icons/bi";
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
    name: "Dashboard",
    path: "/",
    icon: <RxDashboard />,
  },
  {
    name: "Catalog",
    path: "/",
    icon: <BiCategoryAlt />,
    children: [
      {
        name: "Categories",
        path: "/categories",
      },
      {
        name: "Products",
        path: "/products",
      },
      {
        name: "Attributes",
        path: "/attributes",
      },
      {
        name: "Coupons",
        path: "/coupons",
      },
    ],
  },
  {
    name: "Orders",
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
    name: "Customers",
    path: "/customer",
    icon: <HiOutlineUsers />,
  },
];

const listSetting: itemNav[] = [
  {
    name: "Setting",
    path: "/setting",
    icon: <AiOutlineSetting />,
  }
];

export { listBody, listSetting };
