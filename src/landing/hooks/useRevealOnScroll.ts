import { useEffect, type RefObject } from "react";

/**
 * Fades in every [data-reveal] element under the root as it enters the viewport.
 * The shown state is a data attribute set on the node, which React never overwrites on re-render.
 */
export function useRevealOnScroll(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const show = (element: Element) => element.setAttribute("data-shown", "");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [rootRef]);
}
