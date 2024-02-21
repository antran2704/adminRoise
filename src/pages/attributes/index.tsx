import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState, useEffect, Fragment, useCallback } from "react";
import { toast } from "react-toastify";

import { typeCel } from "~/enums";

import { IAttribute, IFilter, IPagination } from "~/interface";

import ShowItemsLayout from "~/layouts/ShowItemsLayout";

import Search from "~/components/Search";
import { Table, CelTable } from "~/components/Table";
import { colHeaderAttribute as colHeadTable } from "~/components/Table/colHeadTable";
import { ButtonDelete, ButtonEdit } from "~/components/Button";
import { initPagination } from "~/components/Pagination/initData";
import {
  deleteAttribute,
  getAttributes,
  getAttributesWithFilter,
  updateAttribute,
} from "~/api-client";

interface ISelectAttribute {
  id: string | null;
  title: string;
}

const initSelect: ISelectAttribute = {
  id: null,
  title: "",
};

interface Props {
  query: ParsedUrlQuery;
}

const AttributesPage = (props: Props) => {
  const { query } = props;
  const currentPage = query.page ? Number(query.page) : 1;

  const [attributes, setAttribute] = useState<IAttribute[]>([]);
  const [selectAttributes, setSelectAttributes] = useState<string[]>([]);

  const [message, setMessage] = useState<string | null>("Feature is locking 😟");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectItem, setSelectItem] = useState<ISelectAttribute>(initSelect);
  const [pagination, setPagination] = useState<IPagination>(initPagination);
  const [filter, setFilter] = useState<IFilter | null>(null);

  const onSelectCheckBox = useCallback(
    (id: string) => {
      const isExit = selectAttributes.find((select: string) => select === id);
      if (isExit) {
        const newSelects = selectAttributes.filter(
          (select: string) => select !== id
        );
        setSelectAttributes(newSelects);
      } else {
        setSelectAttributes([...selectAttributes, id]);
      }
    },
    [selectAttributes]
  );

  const onReset = useCallback(() => {
    setFilter(null);
    handleGetData();
  }, [filter, attributes]);

  const onChangeSearch = useCallback(
    (name: string, value: string) => {
      setFilter({ ...filter, [name]: value });
    },
    [filter]
  );

  const onChangePublic = async (id: string, status: boolean) => {
    if (!id) {
      toast.error("False change public", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    try {
      const payload = await updateAttribute(id, { public: status });

      if (payload.status === 201) {
        toast.success("Success updated attribute", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      toast.error("Please try again", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const onSelectDeleteItem = (item: ISelectAttribute) => {
    setSelectItem(item);
    handlePopup();
  };

  const handlePopup = () => {
    if (showPopup) {
      console.log("close");
      setSelectItem(initSelect);
    }

    setShowPopup(!showPopup);
  };

  const handleGetData = async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await getAttributes(currentPage);
      if (response.status === 200) {
        if (response.payload.length === 0) {
          setAttribute([]);
          setMessage("No attribute");
          setLoading(false);
          return;
        }

        const data: IAttribute[] = response.payload.map((item: IAttribute) => {
          return {
            _id: item._id,
            name: item.name,
            code: item.code,
            public: item.public,
            createdAt: item.createdAt,
          };
        });
        setPagination(response.pagination);
        setAttribute(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error in server");
      setLoading(false);
    }
  };

  const handleGetDataByFilter = useCallback(async () => {
    setMessage(null);
    setLoading(true);

    try {
      const response = await getAttributesWithFilter(filter, currentPage);
      if (response.status === 200) {
        if (response.payload.length === 0) {
          setAttribute([]);
          setMessage("No attribute");
          setLoading(false);
          return;
        }

        const data: IAttribute[] = response.payload.map((item: IAttribute) => {
          return {
            _id: item._id,
            name: item.name,
            code: item.code,
            public: item.public,
            createdAt: item.createdAt,
          };
        });
        setPagination(response.pagination);
        setAttribute(data);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setMessage("Error in server");
      setLoading(false);
    }
  }, [filter]);

  const handleDeleteAttribute = useCallback(async () => {
    if (!selectItem) {
      setShowPopup(false);
      toast.error("False delete attribute", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {
      await deleteAttribute(selectItem.id as string);
      setShowPopup(false);

      if (filter) {
        handleGetDataByFilter();
      } else {
        handleGetData();
      }

      toast.success("Success delete attribute", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      toast.error("Error delete attribute", {
        position: toast.POSITION.TOP_RIGHT,
      });
      console.log(error);
    }
  }, [selectItem]);

  // useEffect(() => {
  //   if (filter) {
  //     handleGetDataByFilter();
  //   } else {
  //     handleGetData();
  //   }
  // }, [currentPage]);

  // useEffect(() => {
  //   if (selectAttributes.length > 0) {
  //     setSelectAttributes([]);
  //   }
  // }, [attributes, currentPage]);

  return (
    <ShowItemsLayout
      title="Attributes"
      titleCreate="Create attribute"
      link="/"
      selectItem={{
        title: selectItem?.title ? selectItem.title : "",
        id: selectItem?.id || null,
      }}
      pagination={pagination}
      handleDelete={handleDeleteAttribute}
      showPopup={showPopup}
      handlePopup={handlePopup}
    >
      <Fragment>
        <Search
          search={filter?.search || ""}
          onReset={onReset}
          onSearch={onChangeSearch}
          onFilter={handleGetDataByFilter}
          placeholder="Search by attribute name..."
        />

        <Table
          items={attributes}
          selects={selectAttributes}
          setSelects={setSelectAttributes}
          selectAll={true}
          isSelected={
            selectAttributes.length === attributes.length ? true : false
          }
          colHeadTabel={colHeadTable}
          message={message}
          loading={loading}
        >
          <Fragment>
            {attributes.map((item: IAttribute) => (
              <tr
                key={item._id}
                className="hover:bg-slate-100 border-b border-gray-300"
              >
                <CelTable
                  type={typeCel.SELECT}
                  isSelected={
                    selectAttributes.includes(item._id as string) ? true : false
                  }
                  onSelectCheckBox={() => onSelectCheckBox(item._id as string)}
                />
                <CelTable type={typeCel.TEXT} center={true} value={item.code} />
                <CelTable
                  type={typeCel.LINK}
                  value={item.name}
                  center={true}
                  href={`/attributes/${item._id}`}
                  className="hover:text-primary"
                />
                <CelTable
                  id={item._id as string}
                  type={typeCel.PUBLIC}
                  checked={item.public}
                  onGetChecked={onChangePublic}
                />
                <CelTable
                  type={typeCel.DATE}
                  center={true}
                  value={item.createdAt}
                />
                <CelTable type={typeCel.GROUP}>
                  <div className="flex items-center justify-end gap-2">
                    <ButtonEdit link={`/attributes/${item._id}`} />

                    <ButtonDelete
                      onClick={() =>
                        onSelectDeleteItem({
                          id: item._id as string,
                          title: item.name,
                        })
                      }
                    />
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

export default AttributesPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      query,
    },
  };
};
