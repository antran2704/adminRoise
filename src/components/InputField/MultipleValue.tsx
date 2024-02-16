import { useState, ChangeEvent, KeyboardEvent, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { AiOutlineClose } from "react-icons/ai";
import { ISelectItem } from "~/interface";
import { TippyInfor } from "../Tippy";

interface Props {
  title: string;
  infor?: string | null;
  width?: string;
  name: string;
  placeholder?: string;
  items: ISelectItem[];
  error?: boolean;
  readonly?: boolean;
  onClick?: () => void;
  getAttributes: (name: string, values: ISelectItem[]) => void;
}

const MultipleValue = (props: Props) => {
  const {
    title,
    width,
    name,
    placeholder,
    items,
    error,
    infor = null,
    readonly = false,
    getAttributes,
  } = props;

  const [text, setText] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  const handleAddValue = (e: KeyboardEvent<HTMLInputElement>) => {
    if (readonly) return;

    const key = e.key;
    if (key === "Enter") {
      const value = e.currentTarget.value;

      if (value.length <= 0) {
        setMessage("Please input value");
        return;
      }

      const isExit = items.some((item) => item.name === value);

      if (isExit) {
        setMessage("Oh, value is exited!");
        return;
      }

      if (message) {
        setMessage(null);
      }

      const newItem = {
        id: uuidv4(),
        name: value,
      };
      const newValues = [...items, newItem];

      setText("");
      getAttributes(name, newValues);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length > 20) {
      setMessage("Value must less than 20 characters");
      return;
    }

    if (message) {
      setMessage(null);
    }

    setText(value);
  };

  const handleDeleteValue = (id: string) => {
    const values = items.filter((value) => value.id !== id);
    getAttributes(name, values);
  };

  return (
    <div className={`${width ? width : "w-full"}`}>
      <div className="flex items-center mb-1 gap-2">
        <span
          id={name}
          className="block text-base text-[#1E1E1E] font-medium"
        >
          {title}
        </span>

        {infor && <TippyInfor content={infor}/>}
      </div>

      <div
        className={`flex items-center flex-wrap w-full rounded-md px-2 py-2 border-2 ${
          error && "border-error"
        } focus:border-[#4f46e5] outline-none gap-2`}
      >
        <ul className="flex flex-wrap items-center gap-2">
          {items.map((value: ISelectItem, index: number) => (
            <li
              key={index}
              className="flex items-center text-sm text-desc px-3 py-1 bg-slate-200 opacity-90 hover:opacity-100 rounded gap-2"
            >
              <span>{value.name}</span>
              <AiOutlineClose
                onClick={() => handleDeleteValue(value.id as string)}
                className="text-sm min-w-[14px] cursor-pointer mt-1"
              />
            </li>
          ))}
        </ul>

        <input
          required
          id={name}
          value={text}
          name={name}
          readOnly={readonly}
          placeholder={placeholder}
          onKeyUp={handleAddValue}
          onChange={onChange}
          type="text"
          className={`flex-1 border-transparent outline-none`}
        />
      </div>

      {message && <p className="text-base text-error font-medium">{message}</p>}
    </div>
  );
};

export default memo(MultipleValue);
