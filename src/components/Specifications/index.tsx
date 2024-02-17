import { Fragment, memo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiOutlineCloseCircle, AiOutlinePlus } from "react-icons/ai";

import { InputText } from "../InputField";
import {
  ISelectItem,
  ISpecificationAttributes,
  ISpecificationsProduct,
} from "~/interface";

import PopupForm from "../Popup/PopupForm";
import Popup from "../Popup";

import { handleCheckFields, handleRemoveCheck } from "~/helper/checkFields";

interface Props {
  className?: string;
  specifications: ISpecificationsProduct[];
  onUpdate: (newSpecifications: ISpecificationsProduct[]) => void;
}

interface ISelectAttribute extends ISelectItem {
  index: number;
}

const initNewSpecification = {
  name: "",
};

const Specifications = (props: Props) => {
  const { className, specifications, onUpdate } = props;

  const [selectSpecification, setSelectSpecification] =
    useState<ISelectItem | null>(null);
  const [showPopupSpecification, setPopupSpecification] =
    useState<boolean>(false);

  const [selectAttribute, setSelectAttribute] =
    useState<ISelectAttribute | null>(null);
  const [showPopupAttribute, setPopupAttribute] = useState<boolean>(false);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [fieldsCheck, setFieldsCheck] = useState<string[]>([]);

  const [newSpecification, setNewSpecification] =
    useState(initNewSpecification);

  const onShowPopupSpecification = (
    specification: ISelectItem | null = null
  ) => {
    if (specification) {
      setSelectSpecification({
        id: specification.id as string,
        name: specification.name,
      });
    } else {
      setSelectSpecification(null);
    }

    setPopupSpecification(!showPopupSpecification);
  };

  const onShowPopupAttribute = (attribute: ISelectAttribute | null = null) => {
    if (attribute) {
      setSelectAttribute({
        id: attribute.id as string,
        name: attribute.name,
        index: attribute.index,
      });
    } else {
      setSelectAttribute(null);
    }

    setPopupAttribute(!showPopupAttribute);
  };

  const handleShowPopup = () => {
    setShowPopup(!showPopup);
  };

  const onChangeValue = (name: string, value: string) => {
    if (fieldsCheck.includes(name)) {
      const newFieldsCheck = handleRemoveCheck(fieldsCheck, name);
      setFieldsCheck(newFieldsCheck);
    }

    setNewSpecification({ ...newSpecification, [name]: value });
  };

  const checkData = (data: any) => {
    let fields = handleCheckFields(data);
    setFieldsCheck(fields);
    return fields;
  };

  const onAddSpecification = () => {
    const fields = checkData([
      {
        name: "name",
        value: newSpecification.name,
      },
    ]);

    if (fields.length > 0) return;

    const newItem: ISpecificationsProduct = {
      id: uuidv4(),
      name: newSpecification.name,
      attributes: [],
    };

    onUpdate([...specifications, newItem]);
    handleShowPopup();
    setNewSpecification(initNewSpecification);
  };

  const onAddAtribute = (index: number) => {
    const newAttribute = {
      id: uuidv4(),
      name: "",
      value: "",
    };

    const newSpecifications = specifications;
    newSpecifications[index].attributes.push(newAttribute);

    onUpdate([...newSpecifications]);
  };

  const onChangeAtribute = (
    name: string,
    value: string,
    specificationIndex: number,
    attributeIndex: number
  ) => {
    const newSpecifications = specifications;
    newSpecifications[specificationIndex].attributes[attributeIndex][name] =
      value;

    onUpdate([...newSpecifications]);
  };

  const onRemoveSpecification = (specificationId: string) => {
    let newSpecifications = specifications;

    newSpecifications = newSpecifications.filter(
      (specification: ISpecificationsProduct) =>
        specification.id !== specificationId
    );

    onUpdate([...newSpecifications]);
    setPopupSpecification(false);
  };

  const onRemoveAttribute = (
    attributeId: string,
    specificationIndex: number
  ) => {
    let newSpecifications = specifications;

    newSpecifications[specificationIndex].attributes = newSpecifications[
      specificationIndex
    ].attributes.filter(
      (attribute: ISpecificationAttributes) => attribute.id !== attributeId
    );

    onUpdate([...newSpecifications]);
    setPopupAttribute(false);
  };

  return (
    <div className={`${className ? className : "w-full"}`}>
      <div className="flex items-center justify-between mb-5 gap-5">
        <span className="block text-base text-[#1E1E1E] font-medium">
          Specifications
        </span>
        <button
          onClick={handleShowPopup}
          className="flex items-center justify-center rounded-full overflow-hidden"
        >
          <AiOutlinePlus className="w-10 h-10 bg-success p-2 text-white " />
        </button>
      </div>

      {specifications.map(
        (specification: ISpecificationsProduct, specificationIndex: number) => (
          <div
            key={specification.id}
            className="py-4 mt-5 bg-[#f5f5fa] rounded-lg"
          >
            <div className="flex items-center justify-between px-4 pb-2 mb-5 border-b-2 gap-5">
              <p className="text-base font-medium">{specification.name}</p>
              <button
                onClick={() =>
                  onShowPopupSpecification({
                    id: specification.id,
                    name: specification.name,
                  })
                }
                className="flex items-center justify-end text-base text-right font-medium text-error gap-2"
              >
                Remove
              </button>
            </div>
            <ul className="flex flex-col px-5 gap-5">
              {specification.attributes.map(
                (
                  attribute: ISpecificationAttributes,
                  attributeIndex: number
                ) => (
                  <li
                    key={attribute.id}
                    className="flex items-start justify-between gap-5"
                  >
                    <InputText
                      title="Name"
                      width="w-1/2"
                      value={attribute.name}
                      name="name"
                      getValue={(name, value) =>
                        onChangeAtribute(
                          name,
                          value,
                          specificationIndex,
                          attributeIndex
                        )
                      }
                    />
                    <InputText
                      title="Value"
                      width="w-1/2"
                      value={attribute.name}
                      name="value"
                      getValue={(name, value) =>
                        onChangeAtribute(
                          name,
                          value,
                          specificationIndex,
                          attributeIndex
                        )
                      }
                    />

                    <button
                      onClick={() =>
                        onShowPopupAttribute({
                          id: attribute.id,
                          name: attribute.name,
                          index: specificationIndex,
                        })
                      }
                      className="flex items-center justify-center text-sm rounded-full"
                    >
                      <AiOutlineCloseCircle className="text-xl min-w-[20px] text-error cursor-pointe" />
                    </button>
                  </li>
                )
              )}

              <div className="flex items-center justify-end ">
                <button
                  onClick={() => onAddAtribute(specificationIndex)}
                  className="flex items-center text-base text-right font-medium text-primary gap-2"
                >
                  <AiOutlinePlus />
                  Attribute
                </button>
              </div>
            </ul>
          </div>
        )
      )}

      <PopupForm
        title="Add Specification Value"
        description="Add your Specification values from here"
        show={showPopup}
        onClose={handleShowPopup}
      >
        <Fragment>
          <div className="flex flex-col justify-between h-full">
            <div className="w-full flex flex-col px-5 gap-5">
              <InputText
                title="Specification Title"
                width="w-full"
                enableEnter={true}
                onEnter={onAddSpecification}
                name="name"
                value={newSpecification.name}
                getValue={onChangeValue}
                error={fieldsCheck.includes("name")}
                placeholder="Color or Size or Material"
              />
            </div>

            <div className="flex items-center justify-between p-5 mt-5 border-t gap-5">
              <button
                onClick={handleShowPopup}
                className="w-fit text-lg text-white font-medium bg-error px-5 py-1 rounded-md"
              >
                Cancle
              </button>
              <button
                onClick={onAddSpecification}
                className="w-fit text-lg text-white font-medium bg-primary px-5 py-1 rounded-md"
              >
                Add
              </button>
            </div>
          </div>
        </Fragment>
      </PopupForm>

      {showPopupSpecification && selectSpecification && (
        <Popup
          title="Specification"
          show={showPopupSpecification}
          onClose={() => onShowPopupSpecification(null)}
        >
          <div>
            <p className="text-lg">
              Do you want delete specification
              <strong>{" " + selectSpecification.name}</strong>
            </p>
            <div className="flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-2">
              <button
                onClick={() => onShowPopupSpecification(null)}
                className="lg:w-fit w-full text-lg hover:text-white font-medium bg-[#e5e5e5] hover:bg-primary px-5 py-1 rounded-md transition-cus"
              >
                Cancle
              </button>
              <button
                onClick={() =>
                  onRemoveSpecification(selectSpecification.id as string)
                }
                className="lg:w-fit w-full text-lg text-white font-medium bg-error px-5 py-1 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Popup>
      )}

      {showPopupAttribute && selectAttribute && (
        <Popup
          title="Attribute"
          show={showPopupAttribute}
          onClose={() => onShowPopupAttribute(null)}
        >
          <div>
            <p className="text-lg">
              Do you want delete attribute
              <strong>{" " + selectAttribute.name}</strong>
            </p>
            <div className="flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-2">
              <button
                onClick={() => onShowPopupAttribute(null)}
                className="lg:w-fit w-full text-lg hover:text-white font-medium bg-[#e5e5e5] hover:bg-primary px-5 py-1 rounded-md transition-cus"
              >
                Cancle
              </button>
              <button
                onClick={() =>
                  onRemoveAttribute(
                    selectAttribute.id as string,
                    selectAttribute.index
                  )
                }
                className="lg:w-fit w-full text-lg text-white font-medium bg-error px-5 py-1 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default memo(Specifications);
