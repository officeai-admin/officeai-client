import { Check, Minus, Plus } from "lucide-react";
import { Link } from "@/routing/Link";
import { ROUTES } from "@/routing/router";
import { ContactForm } from "./components/ContactForm";
import { LandingShell } from "./components/LandingShell";
import { compare, compareIntro, contact, plans, pricingIntro, site } from "./content";

export function PricingPage() {
  return (
    <LandingShell page="pricing" title={site.pricingTitle}>
      <section className="hero hero-short" id="top">
        <div className="plate" aria-hidden="true" />
        <div className="hero-box">
          <h1>{pricingIntro.title}</h1>
          <div className="hero-row hero-row-text">
            <p>{pricingIntro.lead}</p>
            <p className="note">{pricingIntro.note}</p>
          </div>
        </div>
      </section>

      <section className="plan-grid" id="plans" aria-label="Plans">
        {plans.map((plan) => (
          <article className={plan.featured ? "plan is-featured" : "plan"} key={plan.id}>
            <header className="plan-head">
              <h3 className="plan-name">{plan.name}</h3>
              <p className="plan-price">
                <span className="plan-cur">$</span>
                <span className="plan-num">{plan.price}</span>
                <span className="plan-unit">{plan.unit}</span>
              </p>
              <p className="plan-blurb">{plan.blurb}</p>
            </header>
            {plan.action === "contact" ? (
              <a className="btn btn-line" href="#contact">
                {plan.cta}
              </a>
            ) : (
              <Link className={plan.featured ? "btn btn-coral" : "btn btn-line"} to={ROUTES.signUp}>
                {plan.cta}
              </Link>
            )}
            <div className="plan-body">
              <p className="plan-lead">{plan.lead}</p>
              <ul className="plan-list">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Plus className="ic" size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="sect" id="compare">
        <header className="sect-head" data-reveal="">
          <h2>{compareIntro.title}</h2>
        </header>
        <div className="compare-wrap">
          <table className="compare-table">
            <caption className="sr-only">What the Free, Pro and Team plans include</caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Feature</span>
                </th>
                {plans.map((plan) => (
                  <th scope="col" key={plan.id}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            {compare.map((group) => (
              <tbody key={group.group}>
                <tr className="compare-group">
                  <th scope="rowgroup" colSpan={4}>
                    {group.group}
                  </th>
                </tr>
                {group.rows.map(([label, ...included]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {included.map((yes, index) => (
                      <td className={yes ? "is-yes" : "is-no"} key={plans[index].id}>
                        {yes ? (
                          <Check className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
                        ) : (
                          <Minus className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
                        )}
                        <span className="sr-only">{yes ? "Included" : "Not included"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="sect contact" id="contact">
        <div className="contact-intro" data-reveal="">
          <h2>{contact.title}</h2>
          <p>{contact.lead}</p>
          <dl className="contact-details">
            {contact.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>
                  <a href={`mailto:${detail.value}`}>{detail.value}</a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="contact-form" data-reveal="">
          <ContactForm />
        </div>
      </section>
    </LandingShell>
  );
}
