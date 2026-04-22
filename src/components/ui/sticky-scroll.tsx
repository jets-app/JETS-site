"use client";

import { ReactLenis } from "lenis/react";
import { forwardRef } from "react";
// eslint-disable-next-line @next/next/no-img-element
const Img = (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ""} />;

interface StickyScrollProps {
  title?: string;
  subtitle?: string;
  leftColumn?: string[];
  centerColumn?: string[];
  rightColumn?: string[];
  footerWord?: string;
}

const DEFAULT_LEFT = [
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0045_c2-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0044_c3-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0041_c6-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0038_c9-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2020/02/tr1-1024x576.jpg",
];
const DEFAULT_CENTER = [
  "https://www.jetsschool.org/wp-content/uploads/2020/02/tr2-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2019/03/jip2-1.png",
  "https://www.jetsschool.org/wp-content/uploads/2019/03/jip4.png",
];
const DEFAULT_RIGHT = [
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0040_c7-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2020/02/tr3-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2019/01/cl__0037_c10-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2020/02/tr4-1024x576.jpg",
  "https://www.jetsschool.org/wp-content/uploads/2020/02/tr5-1024x576.jpg",
];

export const StickyScroll = forwardRef<HTMLElement, StickyScrollProps>(
  function StickyScroll(
    {
      title = "Life at JETS",
      subtitle = "Mornings of study, afternoons of craft, evenings of brotherhood. Scroll down. ↓",
      leftColumn = DEFAULT_LEFT,
      centerColumn = DEFAULT_CENTER,
      rightColumn = DEFAULT_RIGHT,
      footerWord = "JETS",
    },
    ref,
  ) {
    return (
      <ReactLenis root>
        <main className="bg-[#0f0d0a]" ref={ref}>
          <div className="wrapper">
            <section className="text-white py-20 lg:py-28 w-full bg-[#0f0d0a] grid place-content-center relative">
              <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

              <div className="relative z-10 text-center px-8 max-w-[1100px]">
                <h1 className="font-serif 2xl:text-7xl text-5xl font-semibold tracking-tight leading-[1.1] text-white">
                  {title}
                </h1>
                <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              </div>
            </section>
          </div>

          <section className="text-white w-full bg-[#0f0d0a]">
            <div className="grid grid-cols-12 gap-2">
              <div className="grid gap-2 col-span-12 md:col-span-4">
                {leftColumn.map((src, i) => (
                  <figure key={i} className="w-full">
                    <Img
                      src={src}
                      alt=""
                      className="transition-all duration-300 w-full h-96 align-bottom object-cover rounded-md"
                    />
                  </figure>
                ))}
              </div>

              <div className="hidden md:grid sticky top-0 h-screen w-full col-span-4 gap-2 grid-rows-3">
                {centerColumn.map((src, i) => (
                  <figure key={i} className="w-full h-full">
                    <Img
                      src={src}
                      alt=""
                      className="transition-all duration-300 h-full w-full align-bottom object-cover rounded-md"
                    />
                  </figure>
                ))}
              </div>

              <div className="grid gap-2 col-span-12 md:col-span-4">
                {rightColumn.map((src, i) => (
                  <figure key={i} className="w-full">
                    <Img
                      src={src}
                      alt=""
                      className="transition-all duration-300 w-full h-96 align-bottom object-cover rounded-md"
                    />
                  </figure>
                ))}
              </div>
            </div>
          </section>

          <footer className="group bg-[#0f0d0a] pt-16">
            <h1 className="text-[16vw] leading-[0.9] uppercase font-semibold text-center bg-gradient-to-r from-[#e8c476] to-[#7a3a14] bg-clip-text text-transparent">
              {footerWord}
            </h1>
            <div className="bg-black h-20 relative z-10 grid place-content-center text-2xl rounded-tr-full rounded-tl-full -mt-4" />
          </footer>
        </main>
      </ReactLenis>
    );
  },
);
