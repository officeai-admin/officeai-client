import { ROUTES } from "@/routing/router";

export type LandingPageName = "home" | "pricing" | "auth";

export interface NavItem {
  label: string;
  /** Starts with "#" for a section on the current page, otherwise another address in the app. */
  href: string;
  current?: boolean;
}

/** The shared navigation, resolved for the page it sits on. */
export function navItems(page: LandingPageName): NavItem[] {
  const home = page === "home" ? "" : ROUTES.landing;
  const pricing = page === "pricing" ? "" : ROUTES.pricing;

  return [
    { label: "Features", href: `${home}#features` },
    { label: "How it works", href: `${home}#how-it-works` },
    { label: "FAQ", href: `${home}#faq` },
    { label: "Pricing", href: ROUTES.pricing, current: page === "pricing" },
    { label: "Contact", href: `${pricing}#contact` },
  ];
}
