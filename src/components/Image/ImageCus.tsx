import { useRef, useEffect, Fragment, memo, useState } from "react";

interface Props {
  title?: string;
  alt?: string;
  src: string;
  className?: string;
}

const NO_IMAGE = "/no_image.jpg";

const ImageCus = (props: Props) => {
  const { title, alt, src = null, className } = props;

  const ImageRef = useRef<HTMLImageElement>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function loadImage(src: string) {
    var image = new Image();
    image.src = src;

    image.onload = () => {
      if (ImageRef.current && image.complete) {
        ImageRef.current.src = src;
      }

      setLoading(false);
    };

    image.onerror = () => {
      if (ImageRef.current) {
        ImageRef.current.src = NO_IMAGE;
      }
      setLoading(false);
    };
  }

  useEffect(() => {
    loadImage(src as string);
  }, [src]);

  return (
    <Fragment>
      {loading && <div className={`skelaton ${className}`}></div>}

      <img
        ref={ImageRef}
        alt={alt}
        title={title}
        className={`${className} ${loading ? "hidden" : "block"}`}
        width="auto"
        height="auto"
        loading="lazy"
      />
    </Fragment>
  );
};

export default memo(ImageCus);
