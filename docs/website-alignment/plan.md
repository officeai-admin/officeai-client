# OfficeAI website alignment plan

Plan for aligning the OfficeAI marketing site with [`brief.md`](./brief.md) (OfficeAI Website Alignment & Rewrite Specification, 14 October 2026). Agreed with the product owner on 15 October 2026.

Scope: the public marketing pages in `src/landing/` (landing, pricing, sign-in pages' shared shell, metadata). The chat app at `/app`, authentication, backend calls and data handling are out of scope and must not change.

## Current state (as of commit `fb917c9`)

- **Where the copy lives:** landing, pricing and sign-in pages are in `src/landing/`. Nearly all copy is in `src/landing/content.ts`; styling is in `src/landing/landing.css`. The chat app is separate.
- **Positioning:** the hero says "One assistant for questions, research and files", which reads as a chatbot, not the enterprise AI workspace the brief describes.
- **Over-claims:** the features list and plan cards advertise the Research agent, Alt-text generator, conversation summary and assistant modes. The app currently hides these or has no backend for them.
- **Brand:** written "Office AI". The brief asks for "OfficeAI" in the wordmark and prose.
- **What the code supports today:** chat; PDF and image attachments up to 6 MB; document upload into the backend's Qdrant hybrid search index (an early form of "Company Knowledge"); conversation history synced with the backend; Google or email sign-in via Supabase.
- **Not found in the code:** deployment options, model choice, admin controls, audit logs, agents, automations, integrations.
- **Missing pages and metadata:** no privacy or terms pages; the pricing page is placeholder plans and prices; the only metadata is `<title>Office AI</title>`.
- **Tooling:** no tests. Scripts are `npm run lint` and `npm run build` (Vite only since `606bfe9` removed `tsc -b`). `tsc -b` still reports one pre-existing error in `src/components/ui/prompt-input.tsx`.
- **CTA conflict:** the brief says to show one primary CTA unless there are two distinct journeys. "Get started" and "Try for Free" both go to `/signup`.

## Phase 1: inventory (no code changes, then owner review)

1. Run the site and capture the landing page at phone, tablet, laptop and wide desktop widths.
2. List every section, heading, claim, CTA, link and metadata field.
3. Build the content/claims inventory from brief section 12, Phase B: current copy, what it communicates, the mismatch, the proposed replacement, whether the claim is verified, and whether the capability is live, planned or unknown, based on the code and backend endpoints.
4. Send the inventory and any open questions it could not settle from the code to the product owner. Phase 2 starts only after the owner approves it.

## Phase 2: rewrite (after owner approval)

- Restructure the landing page in the brief's order: header, hero, product preview, trust strip, core capabilities, how it works, security and deployment, use cases, platform vision, FAQ, final CTA, footer.
- Keep the existing design system: fonts, colours, grid, components and the chat mockup. This is a copy and structure rewrite, not a redesign.
- Label every capability "Available now", "Coming soon" or "Roadmap".
- Where an owner question is unanswered, write neutral copy and leave a `TODO(product-owner)` comment instead of a guessed claim.
- Do not invent capabilities, security guarantees, integrations, testimonials, customer logos, metrics or certifications.
- Metadata: use the brief's title, meta description and H1; add Open Graph/Twitter tags and a canonical URL for https://www.officeai.in/; add `robots.txt` and a sitemap.
- Brand: "OfficeAI" everywhere in visible copy. Leave the `ai-assistant:*` localStorage keys and the package name unchanged.
- CTAs: collapse to one primary path, or keep two only if they lead to different destinations. Every link and button must go to a real destination.
- Do not add empty links or pages that do not exist (no placeholder legal pages).

## Phase 3: validation and PR

- Run `npm run build`, `npm run lint` and `npx tsc -b`; report any failure that already existed.
- Check keyboard navigation and visible focus, reduced motion, contrast, every link and CTA, the contact form, and the console for errors, at each width.
- Open a PR on `officeai-admin/officeai-client` against `main` listing changed files, decisions, test results and remaining questions. Do not merge.

## Open questions for the product owner

Anything left unanswered becomes neutral copy with a TODO.

1. **Deployment:** which options exist today: vendor-hosted, private cloud, customer VPC, on-premises?
2. **Models:** which AI model providers does the backend use, and can a customer choose or run local models?
3. **Data:** are prompts and files sent to a third-party model provider? Where are uploads, search data and logs stored, and for how long?
4. **Knowledge:** does uploading to the search index work for customers today? Does retrieval respect per-document permissions? Do answers cite their sources?
5. **Agents, automations, integrations:** live, in development or roadmap? Any named connectors?
6. **Admin:** any SSO, roles, admin settings or audit logs today?
7. **Conversion:** is self-service sign-up the real path, or should the primary CTA be "Talk to our team" (the existing contact form)?
8. **Pricing page:** keep it in the navigation with placeholder prices, hide it, or change it to "Contact us for pricing"?
9. **Legal:** do approved privacy and terms texts exist? They will not be drafted as part of this work; without them, the footer will not link to legal pages.
10. **Logo:** keep the current square mark, or is a new logo in scope? Proposed: out of scope.
