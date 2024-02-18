import Link from "next/link";
import { Fragment } from "react";
import { IoIosAdd } from "react-icons/io";

import Popup from "~/components/Popup";
import Pagination from "~/components/Pagination";

import { IPagination } from "~/interface/pagination";

interface Props {
  children: JSX.Element;
  title: string;
  titleCreate?: string;
  link?: string;
  pagination?: IPagination;
  showPopup?: boolean;
  selectItem?: {
    title: string;
    id: string | null;
  };
  onCreate?: () => void;
  handlePopup?: () => void;
  handleDelete?: () => void;
}

const ShowItemsLayout = (props: Props) => {
  const {
    title,
    titleCreate,
    link,
    children,
    pagination = {
      currentPage: 1,
      totalItems: 0,
      pageSize: 0,
    },
    showPopup = false,
    selectItem,
    onCreate,
    handlePopup,
    handleDelete,
  } = props;
  return (
    <section className="py-5 px-5">
      <div className="flex items-center justify-between mb-5 gap-5">
        <h1 className="lg:text-2xl text-xl font-bold">{title}</h1>

        <div className="flex items-center gap-2">
          {link && (
            <Link
              href={link}
              className="flex items-center font-medium md:text-base text-sm text-white bg-success px-3 py-2 rounded-md gap-1"
            >
              <IoIosAdd className="md:text-2xl text-xl" />
              {titleCreate}
            </Link>
          )}

          {!link && (
            <button
              onClick={onCreate}
              className="flex items-center font-medium md:text-base text-sm text-white bg-success px-3 py-2 rounded-md gap-1"
            >
              <IoIosAdd className="md:text-2xl text-xl" />
              {titleCreate}
            </button>
          )}
        </div>
      </div>

      <Fragment>
        {children}

        {pagination.totalItems > pagination.pageSize && (
            <Pagination pagination={pagination} />
          )}
      </Fragment>

      {showPopup && selectItem?.id && handlePopup && (
        <Popup title="Confirm Delete" show={showPopup} onClose={handlePopup}>
          <div>
            <p className="text-lg">
              Do you want delete {title.toLowerCase()}{" "}
              <strong>{selectItem?.title}</strong>
            </p>
            <div className="flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-2">
              <button
                onClick={handlePopup}
                className="lg:w-fit w-full text-lg font-medium bg-[#e2e2e2] px-5 py-1 opacity-70 hover:opacity-100 rounded-md transition-cus"
              >
                Cancle
              </button>
              <button
                onClick={handleDelete}
                className="lg:w-fit w-full text-lg text-white font-medium bg-error px-5 py-1 opacity-70 hover:opacity-100 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Popup>
      )}
    </section>
  );
};

export default ShowItemsLayout;
