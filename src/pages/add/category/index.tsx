import { useRouter } from "next/router";
import axios from "axios";
import { useState, ChangeEvent } from "react";

import FieldAdd from "~/components/FieldAdd";
import Thumbnail from "~/components/Image/Thumbnail";

import { uploadImage } from "~/helper/handleImage";
import AddLayout from "~/layouts/AddLayout";

interface IThumbnailUrl {
  source: FileList | {};
  url: string;
}

interface IDataCategory {
  title: string;
  description: string;
  thumbnail: string;
  filters: string[];
}

const initData: IDataCategory = {
  title: "",
  description: "",
  thumbnail: "",
  filters: [],
};

const AddCategoryPage = () => {
  const router = useRouter();

  const [data, setData] = useState<IDataCategory>(initData);
  const [thumbnailUrl, setThumbnailUrl] = useState<IThumbnailUrl>({
    source: {},
    url: "",
  });

  const handleChangeValue = (
    name: string,
    value: string | number | boolean
  ) => {
    // console.log(name, value);
    setData({ ...data, [name]: value });
  };

  const handleUploadThumbnail = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (/^image\//.test(file.type)) {
        const name = e.target.name;
        const source: object = file;
        const url: string = uploadImage(e.target);

        setThumbnailUrl({ source, url });
        setData({ ...data, [name]: { url, source } });
      }
    }
  };

  const handleOnSubmit = async () => {
    // const path =
    //   "http://localhost:3001/uploads\\category\\1686243662008.png".replace(
    //     "http://localhost:3001/",
    //     "./"
    //   );
    const formData = new FormData();
    const source: any = thumbnailUrl.source;
    formData.append("thumbnail", source);

    try {
      // const payload = await axios
      //   .post(`${process.env.NEXT_PUBLIC_ENDPOINT_API}/delete`, { path })
      //   .then((res) => res.data);
      // console.log(payload);
      const uploadPayload = await axios
        .post(
          `${process.env.NEXT_PUBLIC_ENDPOINT_API}/category/uploadThumbnail`,
          formData
        )
        .then((res) => res.data);

      const payload = await axios
        .post(`${process.env.NEXT_PUBLIC_ENDPOINT_API}/category`, {
          ...data,
          thumbnail: uploadPayload.payload.thumbnail,
        })
        .then((res) => res.data);

      if (payload.status === 200) {
        console.log("upload successfully");
        router.back();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AddLayout onSubmit={handleOnSubmit}>
      <div>
        <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between lg:gap-5 gap-3">
          <FieldAdd
            title="Title"
            widthFull={false}
            name="title"
            type="input"
            onGetValue={handleChangeValue}
          />
        </div>

        <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-3">
          <FieldAdd
            title="Description"
            widthFull={true}
            name="description"
            type="textarea"
            onGetValue={handleChangeValue}
          />
        </div>

        <div className="w-full flex lg:flex-nowrap flex-wrap items-center justify-between mt-5 lg:gap-5 gap-3">
          <Thumbnail
            thumbnailUrl={thumbnailUrl.url}
            onChange={handleUploadThumbnail}
          />
        </div>
      </div>
    </AddLayout>
  );
};

export default AddCategoryPage;
