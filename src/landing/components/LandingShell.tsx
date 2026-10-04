import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import type { LandingPageName } from "../navigation";
import { Bar } from "./Bar";
import { Footer } from "./Footer";
import "../landing.css";

/**
 * The frame both landing pages share. Its root element carries the `lp` class that every landing
 * style is scoped under, so nothing here depends on, or changes, the chat app's theme.
 */
export function LandingShell({
  page,
  title,
  children,
}: {
  page: LandingPageName;
  title: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useDocumentTitle(title);
  useRevealOnScroll(rootRef);

  // Arriving with a section in the address (a link from the other page, or a shared link).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  // Section links scroll smoothly, unless the visitor has asked for less motion.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element).closest('a[href^="#"]');
    const id = anchor?.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    window.history.pushState(null, "", `#${id}`);
    if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
  };

  return (
    <div className="lp" ref={rootRef} onClick={handleClick}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="sheet">
        <Bar page={page} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer page={page} />
      </div>
    </div>
  );
}
