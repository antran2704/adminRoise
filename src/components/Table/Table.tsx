import { FC, Fragment, memo, SetStateAction } from "react";
import NoResult from "../NoResult";

interface Props {
  children: JSX.Element;
  colHeadTabel: string[];
  items?: any[];
  selects?: string[];
  setSelects?: (value: SetStateAction<string[]>) => void
  isSelected?: boolean;
  selectAll?: boolean;
  message?: string | null;
  loading: boolean;
}

const Table: FC<Props> = (props: Props) => {
  const {
    children,
    colHeadTabel,
    items = [],
    selects = [],
    message,
    loading,
    isSelected = false,
    selectAll = false,
    setSelects,
  } = props;

  const onSelectCheckBoxAll = () => {
    if(!setSelects) return;
    if (selects.length === items.length) {
      setSelects([]);
    } else {
      const newItems = items.map((item: any) => item.id);
      setSelects(newItems as string[]);
    }
  };

  return (
    <Fragment>
      <div className="scrollHidden overflow-x-auto">
        <div className="align-middle inline-block min-w-full shadow overflow-hidden bg-white shadow-dashboard rounded-lg border">
          <table className="min-w-full">
            <thead className="bg-[#f4f5f7]">
              <tr>
                {selectAll && items.length > 0 && (
                  <th className="px-6 py-3 border-b border-gray-300 leading-4 tracking-wider">
                    <input
                      onChange={onSelectCheckBoxAll}
                      checked={isSelected}
                      type="checkbox"
                    />
                  </th>
                )}
                {colHeadTabel.map((item: string, index: number) => (
                  <th
                    key={index}
                    className="border-b border-gray-300 leading-4 tracking-wider"
                  >
                    <p className="text-sm text-[#707275] font-medium px-6 py-3">
                      {item}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {!loading && <Fragment>{children}</Fragment>}
              {loading &&
                [...new Array(6)].map((item: undefined, index: number) => (
                  <tr key={index}>
                    {colHeadTabel.map((item: string, index: number) => (
                      <td
                        key={index}
                        className="px-6 py-4 whitespace-no-wrap border-b"
                      >
                        <div className="skelaton w-[100px] h-5 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && message && (
                <tr>
                  <td
                    colSpan={colHeadTabel.length}
                    className="px-6 py-4 whitespace-no-wrap"
                  >
                    <NoResult title={message as string} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Fragment>
  );
};

export default memo(Table);
