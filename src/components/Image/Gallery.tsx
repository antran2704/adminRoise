import { FC, ChangeEvent, memo, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import ImageCus from "./ImageCus";

interface Props {
  gallery: string[];
  limited?: number;
  loading: boolean;
  error?: boolean;
  className?: string;
  onChange: (source: File) => void;
  onDelete: (url: string) => void;
}

const Gallery: FC<Props> = (props: Props) => {
  const {
    gallery,
    limited = 1,
    className = "w-[120px] h-[120px]",
    loading,
    error,
    onChange,
    onDelete,
  } = props;

  const [selectImage, setSelect] = useState<string | null>(null);

  const hanldeChangeGallery = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file && /^image\//.test(file.type)) {
        if (file.size > 500000) {
          toast.error("File size is larger than 500000 bytes", {
            position: toast.POSITION.TOP_RIGHT,
          });

          return;
        }

        const source: File = file;
        onChange(source);
      } else {
        toast.error("Only upload file type image", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };

  return (
    <div className="lg:w-1/2 w-full">
      <span className="block text-base text-[#1E1E1E] font-medium mb-1">
        Gallery
      </span>

      <ul className="flex flex-wrap mt-4 gap-3">
        {gallery.map((url: string, index: number) => (
          <li
            key={index}
            className={`relative ${className ? className : ""} ${
              selectImage === url
                ? "opacity-90 pointer-events-none"
                : "pointer-events-auto"
            } rounded-md overflow-hidden`}
          >
            <div
              onClick={() => {
                setSelect(url);
                onDelete(url);
              }}
              className=" opacity-0 hover:opacity-100 cursor-pointer transition-all ease-linear duration-100"
            >
              <div className="absolute w-full h-full bg-black opacity-40 z-[1]"></div>
              <div className="absolute flex items-center justify-center w-full h-full text-2xl font-bold text-white z-[2]">
                <AiFillCloseCircle />
              </div>
            </div>

            <ImageCus title="gallery" src={url} className="w-full h-full" />
          </li>
        ))}

        {gallery.length < limited && (
          <label
            htmlFor="gallery"
            className={`flex flex-col items-center justify-center ${
              error ? "border-error" : ""
            } ${
              className ? className : ""
            } rounded-md border-2 border-dashed cursor-pointer overflow-hidden`}
          >
            {!loading && (
              <p className="text-sm font-medium text-center">
                {gallery.length} / {limited}
              </p>
            )}

            {loading && (
              <p className="text-sm font-medium text-center">Loading...</p>
            )}
            <input
              onChange={hanldeChangeGallery}
              disabled={loading}
              type="file"
              id="gallery"
              className="hidden"
              multiple
              name="gallery"
            />
          </label>
        )}
      </ul>
    </div>
  );
};

export default memo(Gallery);
