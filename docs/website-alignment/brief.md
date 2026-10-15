# OfficeAI Website Alignment & Rewrite Specification

**Prepared:** 14 October 2026\
**Purpose:** Use this document as the implementation brief for Claude to
review and update the existing OfficeAI website.

## 1. Executive summary

OfficeAI is not merely a ChatGPT clone, document chatbot, or RAG
interface. It is an **enterprise-owned AI workspace and platform** that
can grow from AI chat and company knowledge into document intelligence,
agents, automations, workflows, integrations, and custom AI
capabilities.

The website should communicate four things quickly:

1.  **What it is:** One AI workspace for employees to chat, work with
    documents, find company knowledge, and use AI-powered tools.
2.  **Why it is different:** The organization can control how OfficeAI
    is deployed, governed, accessed, and connected to its data.
3.  **What it can grow into:** A platform for chat, knowledge, agents,
    automations, and workflows---not a single-purpose chatbot.
4.  **Who it is for:** Employees who need a simple experience, and
    IT/security leaders who need control, governance, and deployment
    flexibility.

Recommended primary positioning:

> **OfficeAI --- Your organization's AI.**

Recommended supporting line:

> Bring AI chat, company knowledge, documents, agents, and automations
> into one workspace---deployed and governed to fit your organization's
> requirements.

Potential campaign tagline:

> **Your AI. Your Data. Your Infrastructure.**

Use the infrastructure tagline only where the actual deployment options
and architecture support it. Do not imply every customer deployment is
fully self-hosted or that data never leaves a customer's environment
unless that is technically true for the offered configuration.

## 2. What could be verified about the current website

The public URL reviewed was https://www.officeai.in/.

The page fetch/crawler exposed the title **"Office AI"**, but did not
expose the full rendered page copy or usable page sections; it returned
a JavaScript-rendered/loading shell. Therefore, this document does
**not** claim to have verified every existing headline, feature,
section, visual, or CTA on the live page.

Claude must inspect the actual repository and rendered website before
editing. Treat this document as: - a product-positioning and content
specification; - a proposed landing-page structure and copy deck; - a
checklist for identifying and replacing content that conflicts with the
product vision; - implementation guidance that preserves the existing
design system where it is already strong.

Do not blindly replace working design components. First map the current
routes, page sections, shared components, styling tokens, responsive
behavior, and existing product capabilities.

## 3. Product definition and strategic boundaries

### 3.1 Product definition

**OfficeAI is a secure, enterprise-controlled AI workspace and
platform.** It gives employees a familiar place to use AI for work while
allowing the organization to manage access, data connections, models,
policies, and deployment according to its requirements.

### 3.2 Core capabilities

Organize the product around these capability areas:

-   **AI Chat:** A familiar conversational interface for asking
    questions, reasoning, drafting, summarizing, and other supported AI
    tasks.
-   **Knowledge:** Search and ask questions across authorized company
    information using retrieval-augmented generation (RAG) and connected
    knowledge sources.
-   **Documents:** Upload, organize, search, summarize, extract
    information from, and work with supported documents.
-   **Agents:** Configure task-oriented AI agents that can use approved
    tools and information sources.
-   **Automations & Workflows:** Connect steps and tools to reduce
    repetitive work, with human approval and policy controls where
    appropriate.
-   **Integrations:** Connect approved enterprise systems, APIs, and
    tools. Mention MCP only if it is implemented or a confirmed product
    capability.
-   **Model Choice:** Support for multiple model providers or locally
    hosted models, only to the extent that the current product actually
    supports them.
-   **Administration & Governance:** Manage users, permissions, access,
    policies, usage, model availability, and auditability to the extent
    implemented.
-   **Deployment & Data Control:** Deployment options and data handling
    that fit the product's real architecture and customer commitments.

### 3.3 Do not present the roadmap as already shipped

Separate capabilities into: - **Available now** - **In development /
coming soon** - **Roadmap / vision**

Only use "available now" for capabilities confirmed in the codebase or
product. If agents, workflow orchestration, local models, model
switching, audit logs, or specific connectors are planned rather than
implemented, label them honestly. The brand can be ambitious without
misleading prospective customers.

## 4. Target audiences and what each needs to hear

### Employees and business users

They want to know: - Can I ask questions and get useful answers? - Can I
work with company documents? - Can I find information without knowing
where it is stored? - Can this help me write, summarize, analyze, and
complete work? - Is the experience easy to use?

Use plain language. Do not lead with "RAG," "LLM orchestration," "vector
database," "MCP," or "inference plane."

### IT, security, and platform teams

They want to know: - Where does the product run? - Which data is
processed and stored, and where? - Can identity, permissions, and
existing systems be integrated? - Can administrators control model and
tool access? - What is logged, and how is access audited? - What
deployment patterns are supported? - What are the operational
requirements?

Provide a dedicated security/deployment section with accurate technical
detail and a clear route to technical documentation or a sales
conversation.

### CIOs, CTOs, and business leaders

They want to know: - What business problem does this solve? - How does
it help teams use AI without creating unmanaged, fragmented usage? - How
can the organization govern adoption? - What can the platform become
over time? - How does it fit the current technology environment?

Emphasize one governed platform rather than a disconnected collection of
AI tools.

## 5. Recommended landing-page information architecture

Use this sequence unless the current site has a demonstrably stronger
structure:

1.  Header/navigation
2.  Hero
3.  Product interface preview
4.  Trust and control statement
5.  Core capabilities
6.  How it works
7.  Enterprise control, privacy, and deployment
8.  Example use cases
9.  Expandable platform vision: agents and automation
10. FAQ
11. Final CTA
12. Footer

Avoid making the homepage a long technical feature inventory. Each
section should answer one buyer question and move the visitor toward
understanding or trying the product.

## 6. Proposed homepage copy

The copy below is a recommended starting point. Claude should adapt it
to existing components and preserve any accurate, useful copy already
present.

### 6.1 Navigation

**Brand:** OfficeAI

Suggested links: - Product - Use cases - Security & Deployment -
Documentation (only if public docs exist) - Sign in

Primary navigation CTA: - **Request a demo** for a sales-led product;
or - **Get started** if self-service onboarding is functional.

Do not show both CTAs unless there are two distinct, working journeys.
All links and buttons must navigate to real destinations.

### 6.2 Hero

**Eyebrow:** ENTERPRISE AI WORKSPACE

**Headline option A (recommended):** \# Your organization's AI. All in
one workspace.

**Subheadline:** Bring AI chat, company knowledge, document workflows,
and AI-powered tools together in one workspace---while keeping
deployment, access, and data governance aligned with your organization's
requirements.

**Primary CTA:** Explore OfficeAI\
**Secondary CTA:** Talk to our team

If a working interactive product is available, use **Try OfficeAI** as
the primary CTA. If the product is not publicly accessible, do not imply
that it is.

**Short trust line:** Built for work. Designed for enterprise control.

Alternative headline if a more outcome-oriented voice fits the current
aesthetic: \# Put your company's knowledge to work with AI.

Supporting copy: Ask questions, work with documents, and turn company
knowledge into useful answers and actions---all through one familiar AI
workspace.

Do not put both headline options on the page. Choose one and keep the
other for an A/B test.

### 6.3 Product preview

Show a real, current screenshot or carefully designed product mock-up.
Do not use a generic chatbot illustration if the product interface is
available.

The preview should demonstrate: - a conversation; - a grounded answer
referencing an authorized document or source; - a document/knowledge
panel or source list; - a visible route to other workspace capabilities,
if implemented.

Use realistic, non-confidential sample data. Clearly label any mock
interface as a preview if it is not a live product.

Potential caption: **One workspace for the way your team works.**

Supporting line: Move from asking a question to finding a source,
creating an output, or starting a task without jumping between
disconnected AI tools.

### 6.4 Trust/control strip

Use a short strip with three or four concise statements, only where
supported:

-   **Your environment** --- Deployment options designed around
    enterprise requirements.
-   **Your access rules** --- Keep information available to the right
    people.
-   **Your AI choices** --- Use approved models and tools where
    supported.
-   **Your governance** --- Manage usage and capabilities centrally.

Do not use unsupported compliance badges, certifications, encryption
claims, or absolute security promises.

### 6.5 Core capabilities section

**Heading:** \## One workspace. More ways to work with AI.

**Intro:** OfficeAI brings everyday AI assistance and organizational
knowledge together, with a platform that can expand into more advanced
tools and workflows.

Use six cards. Keep descriptions plain and outcome-oriented.

**AI Chat**\
Ask questions, explore ideas, draft content, and get help with everyday
work in a familiar conversational interface.

**Company Knowledge**\
Find answers across connected company information and understand where
those answers came from.

**Document Intelligence**\
Summarize documents, extract key details, compare information, and turn
files into useful outputs.

**AI Agents**\
Use task-focused assistants that can work with approved tools and
information sources. Mark as coming soon if not available.

**Automations & Workflows**\
Connect repetitive steps into governed workflows and reduce manual work.
Mark as coming soon if not available.

**Integrations**\
Bring approved business systems and tools into the AI workspace. List
named integrations only when they are supported.

Avoid vague cards such as "Next-generation intelligence," "AI magic," or
"Unlimited possibilities." Visitors need to understand the outcome of
each capability.

### 6.6 How it works

**Heading:** \## From company information to useful work.

**Step 1 --- Connect your knowledge**\
Make approved documents and information sources available to OfficeAI,
according to your configuration and access rules.

**Step 2 --- Ask in plain language**\
Employees ask questions, request summaries, or create content without
needing to understand the underlying AI technology.

**Step 3 --- Get useful, source-aware answers**\
Where supported, OfficeAI retrieves relevant information and presents
answers with source references so users can verify important details.

**Step 4 --- Move from answers to action**\
As supported capabilities are enabled, users can work with approved
agents, tools, and workflows---not just chat.

Do not promise citations, access-control inheritance, or source-level
permission enforcement unless the implementation has been tested to
provide them.

### 6.7 Security, privacy, and deployment

**Heading:** \## AI that fits the way your organization operates.

**Body:** Enterprise AI should work within an organization's security,
data-handling, and operational requirements. OfficeAI is designed around
enterprise control over deployment and the way users, information,
models, and tools are managed.

Use a set of concrete, factual subsections:

**Deployment options**\
Explain exactly which deployment modes are available: for example,
customer-managed infrastructure, private cloud, on-premises, or
vendor-hosted. Include only options that are genuinely supported.

**Data handling**\
Explain what data is stored, where it is stored, which services process
it, retention behavior, and whether prompts or files are sent to
external model providers. Link to the privacy policy and technical
documentation.

**Access and administration**\
Describe actual user provisioning, role/permission controls, source
permissions, administrative settings, and audit logs. Do not imply
inherited document permissions unless confirmed.

**Model and tool governance**\
Describe which models and tools administrators can allow or restrict.
Mention local models only if supported.

**Operational transparency**\
Link to security documentation, architecture notes, subprocessors, or a
security contact as available.

Important: Do not say "your data never leaves your infrastructure,"
"zero data retention," "military-grade security," "fully air-gapped,"
"SOC 2 certified," "GDPR compliant," or similar absolute/certification
claims without documented evidence and appropriate approval. A
customer-controlled deployment does not automatically mean every model
inference, telemetry event, backup, or integration stays inside the
customer's environment.

### 6.8 Use cases

**Heading:** \## Useful across the workday.

Use cases should connect capabilities to familiar work:

-   **Research and discovery:** Find relevant information across
    approved company sources.
-   **Document review:** Summarize long reports and extract key
    information.
-   **Writing and communication:** Draft, rewrite, and refine everyday
    business content.
-   **Knowledge sharing:** Help employees discover information that is
    otherwise scattered across systems.
-   **Operational assistance:** Use approved tools and workflows to help
    complete recurring tasks.
-   **Team-specific assistants:** Create role- or function-specific
    experiences when supported.

Use examples from real target customers or realistic scenarios. Avoid
claiming quantified productivity improvements unless supported by
credible evidence.

### 6.9 Platform vision

**Heading:** \## Start with AI chat. Grow into AI-powered work.

**Body:** OfficeAI is designed to grow beyond a single chat interface.
As capabilities become available, organizations can bring knowledge,
document tasks, agents, integrations, and automations into one governed
workspace.

A simple visual progression: **Chat → Knowledge → Documents → Agents →
Automations → Workflows**

Label future stages clearly if they are not shipped yet. This section
should communicate direction without implying the roadmap is already
available.

### 6.10 Final CTA

**Heading:** \## Bring AI into the way your organization works.

**Body:** Explore how OfficeAI can bring AI assistance and company
knowledge into a workspace aligned with your organization's needs.

**Primary CTA:** Talk to our team\
**Secondary CTA:** Explore the product

If self-service access is available, replace the primary CTA with **Get
started**. Every CTA must have a working destination and analytics event
if analytics are configured.

### 6.11 Footer

Recommended footer groups: - Product: Overview, Capabilities, Use
cases - Enterprise: Security & Deployment, Documentation (if available),
Contact - Legal: Privacy Policy, Terms of Service - Company: About,
Contact

Do not add empty links or pages that do not exist. Add a real company
contact route and legal pages appropriate to the product's actual
operation.

## 7. FAQ recommendations

Use concise answers and only make claims that the product team can
verify.

**What is OfficeAI?**\
OfficeAI is an enterprise AI workspace for using AI chat, working with
documents, and accessing organizational knowledge, with additional tools
and workflows available according to the product's capabilities.

**How is OfficeAI different from a public AI chatbot?**\
OfficeAI is designed for organizational use, bringing AI assistance and
company knowledge into a workspace that can be configured around
enterprise access, governance, and deployment requirements.

**Can OfficeAI work with our company documents?**\
Explain supported file types, upload limits, connectors, indexing
behavior, retention, and permission handling based on the current
implementation.

**Where is our data stored and processed?**\
Give a precise answer for each available deployment model. Explain
external model-provider processing, logs, backups, and integrations
where relevant. Link to the privacy and security documentation.

**Can we deploy OfficeAI in our own environment?**\
List only supported deployment options and clarify the difference
between customer-managed, private-cloud, on-premises, and vendor-hosted
arrangements.

**Which AI models does OfficeAI support?**\
List only verified model providers and deployment options. Clarify
whether model availability depends on configuration.

**Does OfficeAI support agents and automations?**\
Clearly distinguish released functionality from planned capabilities.

**How are user permissions handled?**\
Explain actual access-control behavior, especially whether permissions
from connected sources are enforced during retrieval and responses.

**How can we evaluate OfficeAI for our organization?**\
Provide a real demo, pilot, or contact path with realistic expectations.

## 8. Brand voice and writing rules

OfficeAI should sound: - clear, confident, and practical; -
enterprise-ready but not bureaucratic; - approachable to non-technical
employees; - specific about outcomes; - careful and transparent about
security.

Prefer: - "Ask questions about your company documents." - "Find answers
across approved company knowledge." - "Manage which tools and models
your team can use." - "Choose a deployment model that fits your
requirements."

Avoid: - unexplained acronyms; - excessive AI buzzwords; - generic
phrases such as "revolutionize your business"; - unsupported "100%
secure" promises; - implying AI answers are always correct; - presenting
every roadmap capability as available today.

Use "OfficeAI" consistently in the wordmark and prose. "Office AI" may
appear as a descriptive phrase in natural language, but the product
brand should not alternate randomly between "Office AI," "OfficeAI," and
"Office.AI."

## 9. Visual and UX direction

Preserve and improve the existing visual identity rather than applying a
generic template.

### Desired impression

-   calm, modern, capable, trustworthy;
-   product-led rather than stock-photo-led;
-   clear typography and generous spacing;
-   a restrained accent palette;
-   real UI as the main visual proof;
-   approachable for everyday employees and credible to IT buyers.

### Logo guidance

Use a compact symbol that works at small sizes and a readable wordmark.
The symbol can suggest an organization/workspace and intelligence
without relying on a robot, brain, lock, or generic sparkle. Keep the
logo legible in light and dark contexts. Avoid making the logo look like
an official Microsoft product or imply affiliation.

### UI requirements

-   Mobile-responsive header and hero.
-   Clear visual hierarchy: one main headline and one primary CTA.
-   Consistent button styles and focus states.
-   Accessible contrast and keyboard navigation.
-   Motion should be subtle and respect reduced-motion settings.
-   Product screenshots should be crisp, legible, and consistent with
    the real interface.
-   Use icons consistently; do not mix unrelated icon styles.
-   Keep card copy short enough to scan.
-   Ensure the page remains useful when animations or JavaScript fail.

### Performance and accessibility

-   Optimize images and fonts.
-   Avoid large animations that delay content.
-   Ensure meaningful heading order, descriptive link labels, alt text,
    visible focus states, and appropriate semantic landmarks.
-   Test responsive layouts at narrow mobile, tablet, laptop, and wide
    desktop widths.
-   Ensure the core message and CTA are available to search engines and
    assistive technologies.

## 10. SEO and metadata

Suggested title: **OfficeAI \| Your Organization's AI Workspace**

Suggested meta description: **Bring AI chat, company knowledge, document
workflows, and AI-powered tools into one enterprise workspace, with
deployment and governance aligned to your organization's needs.**

Suggested H1: **Your organization's AI. All in one workspace.**

SEO content should naturally include terms that prospective buyers use,
such as: - enterprise AI workspace; - private AI for business; -
enterprise knowledge assistant; - AI document assistant for
organizations; - self-hosted enterprise AI (only if that deployment is
actually supported); - enterprise AI agents and automation (when
available).

Do not keyword-stuff. Add structured data only where accurate. Ensure
canonical URLs, social sharing metadata, favicon, robots directives,
sitemap, and page titles are configured correctly.

## 11. Conversion and trust improvements

Prioritize: 1. Make the product category obvious above the fold. 2. Show
the actual product UI, not only abstract graphics. 3. Use one clear
primary CTA. 4. Provide a dedicated security/deployment explanation. 5.
Make the current availability of features explicit. 6. Add a real
demo/contact flow with confirmation and privacy-conscious form handling.
7. Add customer logos, testimonials, metrics, or case studies only when
authentic and approved. 8. Add documentation and technical details for
IT evaluators. 9. Explain how to start a pilot or evaluate the product.
10. Make privacy policy and terms easy to find.

Do not fabricate customer names, logos, user counts, performance
statistics, certifications, endorsements, or case studies.

## 12. Claude implementation workflow

Claude should follow this sequence:

### Phase A --- Inspect before changing

1.  Inspect the project structure, framework, routing, styles, assets,
    package scripts, and existing components.
2.  Run the existing site locally if possible.
3.  Capture the current homepage and inspect all responsive breakpoints.
4.  Inventory all current page sections, headings, copy, CTAs, links,
    feature claims, metadata, and footer links.
5.  Identify which claims are supported by the code/product and which
    require confirmation.
6.  Preserve the current visual identity and useful existing components
    unless they conflict with the goals.

### Phase B --- Build a content/claims inventory

Create an internal table with: - current section/copy; - what it
communicates; - issue or mismatch; - recommended replacement; - whether
the claim is verified; - whether the capability is live, planned, or
unknown.

Do not silently invent technical facts. If a security/deployment claim
cannot be verified, write neutral copy or leave a clearly marked TODO
for the product owner.

### Phase C --- Implement

1.  Update page structure and copy according to Sections 5--8.
2.  Keep styling consistent with the existing design system.
3.  Use actual product screenshots where available; otherwise create a
    clearly illustrative mockup.
4.  Add or update metadata and semantic structure.
5.  Make every navigation link and CTA functional.
6.  Add feature availability labels where needed.
7.  Ensure no unsupported claims remain in visible copy.
8.  Keep components reusable and avoid unnecessary dependency additions.

### Phase D --- Validate

1.  Run the project's lint, type-check, tests, and production build
    using the existing scripts.
2.  Inspect the homepage on desktop, tablet, and mobile.
3.  Test keyboard navigation, focus visibility, contrast, and reduced
    motion.
4.  Check links, CTA destinations, forms, and empty/error states.
5.  Verify page title, description, canonical URL, favicon, and social
    metadata.
6.  Check for broken images, console errors, hydration errors, layout
    shifts, and obvious performance regressions.
7.  Provide a concise summary of files changed, decisions made, tests
    run, and unresolved product/security questions.

### Implementation constraints

-   Do not rewrite the whole application if a targeted homepage update
    is sufficient.
-   Do not remove working product functionality to simplify the
    marketing site.
-   Do not change authentication, data handling, deployment, or security
    behavior as part of a copy/marketing task.
-   Do not add fake logos, testimonials, metrics, certifications, or
    product integrations.
-   Do not expose secrets, environment variables, API keys, internal
    endpoints, or customer data.
-   Keep the site buildable and preserve existing routing.
-   Where the real product's capabilities are unclear, flag the question
    rather than guessing.

## 13. Acceptance criteria

The work is complete when:

-   A first-time visitor can understand what OfficeAI is within five
    seconds.
-   The headline communicates an enterprise AI workspace, not only a
    chatbot or document store.
-   The site explains the employee value in plain language.
-   Chat, knowledge/documents, agents, and automation are represented in
    a way that distinguishes available features from roadmap items.
-   Enterprise control and deployment are explained with accurate,
    qualified claims.
-   Security copy does not overpromise.
-   The actual product interface is shown or a preview is clearly
    labeled.
-   Primary CTA is obvious and functional.
-   Mobile layouts are polished and usable.
-   SEO metadata and accessibility basics are implemented.
-   Existing design quality and useful components are preserved.
-   Build/tests pass, or any pre-existing failures are documented.
-   Claude provides a list of unresolved questions requiring
    product-owner confirmation.

## 14. Product-owner questions Claude must surface, not guess

1.  Which deployment modes are currently supported: vendor-hosted,
    private cloud, customer VPC, on-premises, or air-gapped?
2.  Which model providers and local models are currently supported?
3.  Are prompts, files, embeddings, telemetry, logs, and backups stored
    or processed by any third party?
4.  Which document formats and maximum file sizes are supported?
5.  Which connectors and integrations are implemented today?
6.  Are document-source permissions enforced during retrieval and
    response generation?
7.  Are citations/source references available in answers?
8.  Are agents and automations live, in development, or roadmap-only?
9.  What identity, SSO, role-based access, audit, retention, and admin
    controls are actually available?
10. Is there a working self-service signup, demo request, or sales
    contact flow?
11. Which privacy, security, and compliance statements have been
    approved for public use?

## 15. Final positioning recommendation

Use the brand consistently:

**OfficeAI**\
**Your organization's AI.**

Supporting description: **A unified AI workspace for chat, company
knowledge, documents, agents, and automations---with deployment and
governance designed around enterprise requirements.**

The website should tell a simple story:

**Understand it → See it → Trust it → Explore it.**

The goal is not to make OfficeAI sound like it has every AI feature
today. The goal is to make the product's direction unmistakable, show
the real value available now, and build confidence that the platform can
expand responsibly as more capabilities ship.
