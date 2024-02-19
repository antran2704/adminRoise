import { useRouter } from "next/router";
import { forwardRef, ForwardRefRenderFunction, Ref, useState } from "react";

interface props {
  children: JSX.Element;
  title: string;
  backLink?: string;
  onSubmit: () => void;
}

const FormLayout: ForwardRefRenderFunction<HTMLUListElement, props> = (
  props: props,
  ref: Ref<HTMLUListElement> | undefined
) => {
  const { children, title, backLink = "/", onSubmit } = props;

  const router = useRouter();

  return (
    <section className="scrollHidden relative w-full h-screen overflow-auto">
      <div className="flex items-center justify-between px-5 py-5 border-b-2 z-20">
        <h1 className="lg:text-xl text-lg font-semibold">{title}</h1>
        <button
          onClick={onSubmit}
          className="w-fit text-lg text-white font-medium bg-primary px-5 py-1 rounded-md"
        >
          Save
        </button>
      </div>

      <ul
        ref={ref}
        className="scrollHidden h-[80vh] pb-20 px-5 gap-3 overflow-auto"
      >
        {children}
      </ul>

      <div className="absolute bottom-0 left-0 right-0 flex lg:flex-nowrap flex-wrap items-center justify-between bg-[#ffffffbf] backdrop-blur-[4px] py-4 px-5 border-t-2 lg:gap-5 gap-2">
        <button
          onClick={() => router.push(backLink)}
          className="w-fit text-lg text-white font-medium bg-[#111926] px-5 py-1 opacity-90 hover:opacity-100 border-2 rounded-md"
        >
          Back
        </button>
      </div>
    </section>
  );
};

export default forwardRef(FormLayout);
