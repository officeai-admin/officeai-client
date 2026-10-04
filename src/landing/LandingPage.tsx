import { ArrowRight, Plus } from "lucide-react";
import { Link } from "@/routing/Link";
import { ROUTES } from "@/routing/router";
import { ChatMock } from "./components/ChatMock";
import { LandingShell } from "./components/LandingShell";
import {
  callouts,
  cta,
  faq,
  faqIntro,
  features,
  featuresIntro,
  flows,
  flowsIntro,
  hero,
  site,
  spec,
} from "./content";

const CONTACT = `${ROUTES.pricing}#contact`;

export function LandingPage() {
  return (
    <LandingShell page="home" title={site.title}>
      <section className="hero" id="top">
        <div className="plate" aria-hidden="true" />
        <dl className="spec">
          {spec.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="hero-box">
          <h1>{hero.title}</h1>
          <div className="hero-row">
            <p>{hero.sub}</p>
            <Link className="cell-btn cell-btn-coral" to={ROUTES.signUp}>
              {hero.primary}
              <ArrowRight className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <a className="cell-btn" href="#how-it-works">
              {hero.secondary}
            </a>
          </div>
        </div>
      </section>

      <section className="fig" aria-label="Product preview">
        <div className="fig-notes" data-reveal="">
          <h2>The chat view</h2>
          <ol className="callouts">
            {callouts.map((item) => (
              <li key={item.letter}>
                <b>{item.letter}</b>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="fig-mock" data-reveal="">
          <ChatMock />
        </div>
      </section>

      <section className="sect" id="features">
        <header className="sect-head" data-reveal="">
          <h2>{featuresIntro.title}</h2>
          <p>{featuresIntro.lead}</p>
        </header>
        <ul className="spec-grid">
          {features.map(({ id, group, icon: Icon, title, body }) => (
            <li className="cell" key={id} data-reveal="">
              <div className="cell-top">
                <span className="tag">{group}</span>
                <Icon className="ic" size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="strip" aria-hidden="true" />

      <section className="sect" id="how-it-works">
        <header className="sect-head" data-reveal="">
          <h2>{flowsIntro.title}</h2>
          <p>{flowsIntro.lead}</p>
        </header>
        <ol className="flow-table">
          {flows.map((flow) => (
            <li className="flow-row" key={flow.id} data-reveal="">
              <h3>{flow.name}</h3>
              <ol className="nodes">
                {flow.steps.map((step, index) => (
                  <li key={step}>
                    {index > 0 && <i className="wire" aria-hidden="true" />}
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      <section className="sect" id="faq">
        <header className="sect-head" data-reveal="">
          <h2>{faqIntro.title}</h2>
          <p>
            Something else on your mind?{" "}
            <Link className="text-link" to={CONTACT}>
              Contact us
            </Link>
            .
          </p>
        </header>
        <div className="faq-grid">
          {faq.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>
                <span className="faq-q">{item.q}</span>
                <span className="faq-mark" aria-hidden="true">
                  <Plus className="ic" size={18} strokeWidth={1.75} />
                </span>
              </summary>
              <div className="faq-a">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="closing" id="get-started">
        <div className="closing-copy" data-reveal="">
          <h2>{cta.title}</h2>
          <p>{cta.lead}</p>
        </div>
        <div className="actions" data-reveal="">
          <Link className="btn btn-ink" to={ROUTES.signUp}>
            {cta.primary}
            <ArrowRight className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link className="btn btn-line" to={CONTACT}>
            {cta.secondary}
          </Link>
        </div>
      </section>
    </LandingShell>
  );
}
