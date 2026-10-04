import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/routing/Link";
import { ROUTES } from "@/routing/router";
import { hero, site } from "../content";
import { navItems, type LandingPageName } from "../navigation";
import { NavLink } from "./NavLink";

export function Bar({ page }: { page: LandingPageName }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const brand = (
    <>
      <span className="brand-mark" aria-hidden="true" />
      {site.brand}
    </>
  );

  return (
    <header className="bar">
      {page === "home" ? (
        <a className="brand" href="#top">
          {brand}
        </a>
      ) : (
        <Link className="brand" to={ROUTES.landing}>
          {brand}
        </Link>
      )}

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>

      <nav
        className={open ? "nav is-open" : "nav"}
        id="site-nav"
        aria-label="Main"
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setOpen(false);
        }}
      >
        <ul className="nav-links">
          {navItems(page).map((item) => (
            <li key={item.label}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>
        <Link className="bar-cta" to={ROUTES.signUp}>
          {hero.primary}
          <ArrowRight className="ic" size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
