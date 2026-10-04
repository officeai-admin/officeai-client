import { site } from "../content";
import { navItems, type LandingPageName } from "../navigation";
import { NavLink } from "./NavLink";

export function Footer({ page }: { page: LandingPageName }) {
  const items = navItems(page);

  return (
    <footer className="footer">
      <div className="footer-cell footer-about">
        <p className="brand">
          <span className="brand-mark" aria-hidden="true" />
          {site.brand}
        </p>
        <p>{site.footerLine}</p>
      </div>

      <nav className="footer-cell" aria-label="Product">
        <h2>Product</h2>
        <ul>
          {items.slice(0, 3).map((item) => (
            <li key={item.label}>
              <NavLink item={{ ...item, current: false }} />
            </li>
          ))}
        </ul>
      </nav>

      <nav className="footer-cell" aria-label="Plans and contact">
        <h2>Plans and contact</h2>
        <ul>
          {items.slice(3).map((item) => (
            <li key={item.label}>
              <NavLink item={{ ...item, current: false }} />
            </li>
          ))}
          <li>
            <a href="mailto:hello@example.com">hello@example.com</a>
          </li>
        </ul>
      </nav>

      <p className="footer-cell footer-copy">
        © {site.year} {site.brand}
      </p>
    </footer>
  );
}
