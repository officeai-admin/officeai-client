import type { ReactNode } from "react";
import { Link } from "@/routing/Link";
import type { NavItem } from "../navigation";

/** A section link stays a plain anchor (the shell scrolls to it); anything else changes address. */
export function NavLink({ item, children }: { item: NavItem; children?: ReactNode }) {
  const current = item.current ? ("page" as const) : undefined;

  if (item.href.startsWith("#")) {
    return (
      <a href={item.href} aria-current={current}>
        {children ?? item.label}
      </a>
    );
  }

  return (
    <Link to={item.href} aria-current={current}>
      {children ?? item.label}
    </Link>
  );
}
