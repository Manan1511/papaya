"use client";

import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import { CarouselArrow } from "../ui/carousel-arrow";

// The homepage stacks in one row: one card and a peek of the next on a phone, two on a tablet, three on
// a desktop. The browser's own scroll snapping does the swiping and the arrows step one card. A row too
// short to scroll sits in the middle with no arrows.
export function StackCarousel({ children }: { children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: true });

  function measure() {
    const element = row.current;
    if (!element) return;
    const { scrollLeft, clientWidth, scrollWidth } = element;
    // Widths can be fractions of a pixel, so "at the end" allows a little slack.
    setEnds({ start: scrollLeft <= 2, end: scrollLeft + clientWidth >= scrollWidth - 2 });
  }

  // Measured on arrival and again whenever the row changes width.
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const watcher = new ResizeObserver(measure);
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  function step(cards: number) {
    const element = row.current;
    const card = element?.firstElementChild as HTMLElement | null | undefined;
    if (element && card) element.scrollBy({ left: cards * (card.offsetWidth + parseFloat(getComputedStyle(element).columnGap)) });
  }

  return (
    <div className="relative">
      <ul
        ref={row}
        aria-label="Stacks"
        onScroll={measure}
        // The padding leaves room for each card's shadow and its lift on hover.
        className="flex snap-x snap-mandatory scroll-px-1 items-start gap-gutter overflow-x-auto overscroll-x-contain px-1 pb-3 pt-1 [justify-content:safe_center] [scrollbar-width:none] motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="w-[80%] shrink-0 snap-start md:w-[calc((100%-theme(spacing.gutter))/2)] lg:w-[calc((100%-2*theme(spacing.gutter))/3)]">
            {child}
          </li>
        ))}
      </ul>
      <CarouselArrow direction="previous" label="Previous stack" off={ends.start} onClick={() => step(-1)} />
      <CarouselArrow direction="next" label="Next stack" off={ends.end} onClick={() => step(1)} />
    </div>
  );
}
