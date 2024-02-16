import { FC, useState, useRef, memo, useEffect } from "react";

import {
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdOutlineClose,
} from "react-icons/md";
import { ISelectItem } from "~/interface";

interface Props {
  title: string;
  className?: string;
  data: ISelectItem[];
  selects: ISelectItem[];
  name: string;
  selectIndex?: number;
  show: boolean;
  onSetSelectShow?: (name: string) => void;
  onSetSelectIndex?: (value: number | null) => void;
  selectItem: (items: ISelectItem, key: string) => void;
  selectAll: (items: ISelectItem[], key: string) => void;
  removeItem: (items: ISelectItem[], id: string, key: string) => void;
}

const SelectMultipleItem: FC<Props> = (props: Props) => {
  const {
    title,
    className,
    data,
    selects,
    name,
    show,
    onSetSelectShow,
    selectIndex,
    onSetSelectIndex,
    selectItem,
    selectAll,
    removeItem,
  } = props;
  const divRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLUListElement>(null);

  const onSelect = (select: ISelectItem) => {
    const isExit = selects.some((item: ISelectItem) => item.id === select.id);
    if (!isExit) {
      selectItem(select, name);
    } else {
      const newSelect = selects.filter(
        (item: ISelectItem) => item.id !== select.id
      );
      removeItem(newSelect, select.id as string, name);
    }
  };

  const onSelectAll = () => {
    if (selects.length !== data.length) {
      selectAll([...data], name);
    } else {
      selectAll([], name);
    }
  };

  const onClearAll = () => {
    selectAll([], name);
  };

  useEffect(() => {
    if (divRef.current && popupRef.current) {
      const height = divRef.current.clientHeight;
      popupRef.current.style.top = `${height + 10}px`;
    }
  }, [show]);
  return (
    <div
      className={`realtive  ${className ? className : ""} ${
        show ? "z-[21]" : "z-20"
      }`}
    >
      <span className="block text-base text-[#1E1E1E] font-medium mb-1">
        {title}
      </span>

      <div
        ref={divRef}
        className={`relative flex items-center w-full min-h-[36px] rounded-md px-2 py-1 ${
          show && "border-[#4f46e5] bg-white"
        } border-2 outline-none cursor-pointer z-10`}
      >
        <div
          onClick={() => {
            if (onSetSelectIndex && selectIndex) {
              onSetSelectIndex(selectIndex);
            }

            if (onSetSelectShow) {
              onSetSelectShow(name);
            }
          }}
          className="flex items-center w-full justify-between gap-5"
        >
          {selects.length > 0 && selects.length < data.length && (
            <p className="w-full line-clamp-1 select-none gap-2">
              {selects.map(
                (item: ISelectItem, index: number) =>
                  `${item.name} ${index + 1 <= selects.length - 1 ? "," : ""}`
              )}
            </p>
          )}

          {selects.length === data.length && (
            <p className="w-full line-clamp-1 select-none gap-2">
              All items selected
            </p>
          )}

          {selects.length === 0 && (
            <p className="w-full text-gray-400 line-clamp-1 select-none gap-2">
              Please select item...
            </p>
          )}
          <div className="flex items-center gap-2">
            {selects.length > 0 && (
              <MdOutlineClose
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAll();
                }}
                className="ml-auto w-5 h-7"
              />
            )}
            {show && <MdKeyboardArrowUp className="ml-auto w-6 h-7" />}
            {!show && <MdKeyboardArrowDown className="ml-auto w-6 h-7" />}
          </div>
        </div>

        <ul
          ref={popupRef}
          className={`absolute ${
            show
              ? "opacity-100 pointer-events-auto z-50"
              : "opacity-0 pointer-events-none"
          } scroll left-0 w-full max-h-[160px] bg-white border-2 rounded-md overflow-y-auto shadow-md transition-all ease-linear duration-100`}
        >
          {name !== "default" && (
            <li
              onClick={onSelectAll}
              className={`w-full text-base ${
                selects.length === data.length ? "bg-gray-200" : ""
              } px-5 py-1 border-b-2 border-gray-300 cursor-pointer transition-all ease-linear duration-100`}
            >
              Select All
            </li>
          )}

          {data.map((item: ISelectItem) => (
            <li
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-base ${
                selects.find((select: ISelectItem) => select.id === item.id) &&
                "bg-gray-200"
              } px-5 py-1 cursor-pointer transition-all ease-linear duration-100`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>

      {show && (
        <div
          onClick={() => {
            if (onSetSelectShow) {
              onSetSelectShow(name);
            }
          }}
          className="fixed top-0 right-0 left-0 bottom-0 bg-transparent z-0"
        ></div>
      )}
    </div>
  );
};

export default memo(SelectMultipleItem);
