export type ServiceKey =
  | 'website'
  | 'redesign'
  | 'audit'
  | 'ai'
  | 'seo'
  | 'graphic'
  | 'branding'
  | 'video'
  | 'mentorship';

export type IconKey =
  | 'code'
  | 'refresh'
  | 'search'
  | 'bot'
  | 'trending'
  | 'pen'
  | 'sparkles'
  | 'video'
  | 'graduation';

export interface ServiceDetail {
  key: ServiceKey;
  /** Short name used on cards and in forms */
  name: string;
  /** Two- or three-word hero subject */
  eyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  summary: string;
  /** NGN base price. null = scoped quote (never invented). */
  ngn: number | null;
  unit: 'project' | 'hour';
  priceNote: string;
  enabled: boolean;
  icon: IconKey;
  image: string;
  imageAlt: string;
  problem: string[];
  includes: { title: string; body: string }[];
  audiences: string[];
  process: { title: string; body: string; duration: string }[];
  outcomes: string[];
  faq: { q: string; a: string }[];
  related: ServiceKey[];
}

export const SERVICES: ServiceDetail[] = [
  {
    key: 'website',
    name: 'Website design & development',
    eyebrow: 'Websites that earn their keep',
    heroTitle: 'A website that works',
    heroAccent: 'as hard as you do.',
    heroLead:
      'Fast, clear, mobile-first websites built around one question: what should a visitor do next? Everything else — the design, the copy structure, the technical build — serves that answer.',
    summary:
      'Custom, mobile-first websites engineered for speed, clarity and enquiries — not just to exist.',
    ngn: 150000,
    unit: 'project',
    priceNote: 'Starting price. Final cost depends on pages, features and content readiness.',
    enabled: true,
    icon: 'code',
    image: '/images/work/tech-desk.webp',
    imageAlt: 'TIMFIRE working at a laptop on a website build',
    problem: [
      'Most small-business websites fail quietly. They load slowly on the phones most visitors actually use, bury the phone number three taps deep, and describe the business in language only the owner understands.',
      'The result is not a dramatic failure — it is a slow leak. People arrive, cannot quickly tell whether you do what they need, and leave. Nothing is broken, so nothing gets fixed, and the website keeps costing you customers in the background.',
      'A website is not a brochure. It is the first conversation most people will ever have with your business, and it happens without you in the room.',
    ],
    includes: [
      {
        title: 'Structure before decoration',
        body: 'We agree what each page must accomplish before a single colour is chosen. Navigation, section order and calls to action are planned around how your customers actually decide.',
      },
      {
        title: 'Copy that sounds like you',
        body: 'Headlines, service descriptions and calls to action written to be understood by someone who has never heard of you — and to sound like a person, not a brochure.',
      },
      {
        title: 'Mobile-first build',
        body: 'Designed at 360px first, because that is where most of your visitors are. Tested across real screen sizes from small phones to wide desktops.',
      },
      {
        title: 'Speed as a feature',
        body: 'Optimised images, compressed fonts, lazy loading and minimal JavaScript. A site that loads fast on a mid-range phone on a mobile network.',
      },
      {
        title: 'Search foundations',
        body: 'Clean URLs, proper page titles, meta descriptions, headings, sitemap, structured data and image alt text — built in, not bolted on later.',
      },
      {
        title: 'Forms that actually reach you',
        body: 'Validated enquiry forms with spam protection, clear success messages and a fallback route (email or WhatsApp) so a lead never disappears.',
      },
      {
        title: 'You own everything',
        body: 'Domain, hosting and code set up in your name, with a handover walkthrough and written notes on how to update the parts you will want to change.',
      },
      {
        title: 'After launch',
        body: 'Thirty days of post-launch fixes included. Anything that breaks because of my build gets corrected at no cost.',
      },
    ],
    audiences: [
      'Businesses with no website, or one that is years out of date',
      'Organisations whose site looks fine but brings in no enquiries',
      'Founders who need to look credible to partners, funders or customers',
      'Practices and institutions that need to explain complex services simply',
    ],
    process: [
      {
        title: 'Conversation',
        body: 'A short call or WhatsApp exchange to understand the business, the customers and what a good enquiry looks like for you.',
        duration: 'Day 1',
      },
      {
        title: 'Scope and quote',
        body: 'A written plan: pages, features, timeline and a fixed price. No surprises added later.',
        duration: 'Day 2–3',
      },
      {
        title: 'Content and structure',
        body: 'We collect your real content — services, photos, prices — and agree the page structure. I write or tighten the copy where needed.',
        duration: 'Week 1',
      },
      {
        title: 'Design and build',
        body: 'The site is designed and built in the open. You see progress links, not a mysterious silence.',
        duration: 'Week 2–3',
      },
      {
        title: 'Review and polish',
        body: 'You review on your own phone. We fix what feels off, test every form and link, and check speed and accessibility.',
        duration: 'Week 3–4',
      },
      {
        title: 'Launch and handover',
        body: 'Domain connected, HTTPS confirmed, analytics optional, and a walkthrough of how to update content yourself.',
        duration: 'Week 4',
      },
    ],
    outcomes: [
      'A site that loads in about a second on mobile',
      'Clear calls to action on every page',
      'Enquiries arriving by email and WhatsApp',
      'Search-ready titles, descriptions and structured data',
      'Full ownership of domain, hosting and files',
    ],
    faq: [
      {
        q: 'How long does a website take?',
        a: 'A focused five-page site usually takes two to three weeks. Larger institutional sites or e-commerce builds take four to six. The biggest variable is content readiness — if photos and copy are ready, the build moves quickly.',
      },
      {
        q: 'Do I need to have my content ready first?',
        a: 'No. Bring what you have: a logo, a phone full of photos, a rough idea of your services. I can write the copy and structure the pages with you. If you already have polished content, even better.',
      },
      {
        q: 'What does the price include?',
        a: 'Design, development, mobile responsiveness, SEO foundations, form setup, testing and launch. Domain and hosting are paid directly to the provider in your name, usually a small annual cost.',
      },
      {
        q: 'Can I update it myself afterwards?',
        a: 'Yes. For content you change often — prices, projects, new pages — I can build a simple admin area, or set up a structured content file you edit without touching design. Either way you get written instructions.',
      },
      {
        q: 'What if I already have a website?',
        a: 'That is often the best starting point. See the website redesign service, or start with an audit if you want a clear list of what to fix before committing to a rebuild.',
      },
    ],
    related: ['redesign', 'audit', 'seo'],
  },
  {
    key: 'redesign',
    name: 'Website redesign & rebuild',
    eyebrow: 'The rebuild, done properly',
    heroTitle: 'Keep what works.',
    heroAccent: 'Rebuild what does not.',
    heroLead:
      'A redesign is not a fresh coat of paint. It is a decision about what your existing site gets right, what quietly costs you enquiries, and how to fix the second without breaking the first.',
    summary:
      'A measured rebuild of an existing site: keep the equity, remove the friction, modernise the build.',
    ngn: null,
    unit: 'project',
    priceNote: 'Scoped per project after a review of the current site.',
    enabled: true,
    icon: 'refresh',
    image: '/images/work/studio-collab.webp',
    imageAlt: 'TIMFIRE reviewing work with a collaborator in front of a glass building',
    problem: [
      'Sites age in ways that are hard to see from the inside. You know your business, so you can find anything on your own site in two clicks. A first-time visitor cannot.',
      'Meanwhile the technical layer rots quietly: unoptimised images, an outdated script, a plugin nobody updates, a contact form that stopped delivering mail months ago.',
      'The instinct is to start again from scratch. Often that is right. Sometimes it throws away years of search rankings, links and familiarity. The honest answer depends on what is actually there.',
    ],
    includes: [
      {
        title: 'An honest review first',
        body: 'Before recommending a rebuild, I review what you have: content quality, structure, speed, search visibility and whether the current platform is helping or fighting you.',
      },
      {
        title: 'Keep the equity',
        body: 'Existing URLs, page titles and high-performing pages are preserved or redirected properly, so a redesign does not wipe out what you have earned in search.',
      },
      {
        title: 'Content migration',
        body: 'Your real content is carried across, tightened and reorganised — not copy-pasted with all the old contradictions intact.',
      },
      {
        title: 'Modern build',
        body: 'Rebuilt on a current, maintainable stack with proper image handling, fast page loads and a structure you can extend later.',
      },
      {
        title: 'Redirect map',
        body: 'Every old URL that changes gets a permanent redirect to the right new page. No dead ends, no lost visitors.',
      },
      {
        title: 'Pre-launch comparison',
        body: 'Side-by-side checks of the old and new site on real devices before anything goes live, with a rollback plan.',
      },
    ],
    audiences: [
      'Businesses whose site looks dated next to their competitors',
      'Sites that are slow, break on mobile, or look wrong on new phones',
      'Owners stuck on a platform they cannot update themselves',
      'Organisations whose site content no longer matches what they actually do',
    ],
    process: [
      { title: 'Review', body: 'I go through the existing site page by page and note what to keep, fix or remove.', duration: 'Day 1–2' },
      { title: 'Recommendation', body: 'A written verdict: repair in place, or rebuild. With reasons and a price for each.', duration: 'Day 3' },
      { title: 'Plan', body: 'URL mapping, content plan and redirect list agreed before work starts.', duration: 'Week 1' },
      { title: 'Rebuild', body: 'New design and build, with content migrated and tightened.', duration: 'Week 2–4' },
      { title: 'Verification', body: 'Old-versus-new checks, redirect tests, speed and mobile review.', duration: 'Week 4' },
      { title: 'Cutover', body: 'Careful switchover with monitoring for the first week.', duration: 'Launch week' },
    ],
    outcomes: [
      'A modern site without losing existing search visibility',
      'Every old link still working through redirects',
      'Content that matches what you do today',
      'A build you can maintain and extend',
      'Measurably faster load times',
    ],
    faq: [
      {
        q: 'Will I lose my Google rankings?',
        a: 'Not if the migration is done properly. Existing URLs are preserved where possible, and changed URLs get permanent redirects. I also carry over page titles, descriptions and structured data. Rankings can dip briefly during any change, then recover.',
      },
      {
        q: 'Can you keep the parts I like?',
        a: 'Yes — that is usually the right call. Logo, colours, photography and specific pages can all be carried across. I will tell you plainly which parts are helping you and which are working against you.',
      },
      {
        q: 'How is this priced?',
        a: 'After reviewing the current site I give a fixed price for the agreed scope. Redesigns are quoted individually because the amount of content migration varies enormously.',
      },
    ],
    related: ['audit', 'website', 'seo'],
  },
  {
    key: 'audit',
    name: 'Website audit',
    eyebrow: 'Know exactly what to fix',
    heroTitle: 'Find out what is',
    heroAccent: 'costing you enquiries.',
    heroLead:
      'A structured review of your website against the things that actually matter: speed, clarity, mobile behaviour, search visibility, accessibility and whether enquiries can reach you.',
    summary:
      'A written, prioritised review of your site with a fix list ordered by impact.',
    ngn: null,
    unit: 'project',
    priceNote: 'Scoped per site. Deducted from the cost if you go on to book a rebuild.',
    enabled: true,
    icon: 'search',
    image: '/images/work/workspace-neon.webp',
    imageAlt: 'TIMFIRE at a multi-screen workstation reviewing a website',
    problem: [
      'Most site owners suspect something is wrong but cannot name it. They are told to "improve SEO" or "make it faster" without knowing which page, which image, or which line of code is the actual problem.',
      'An audit replaces that guesswork with a list. Not a hundred automated warnings, but a short, ordered set of things that are genuinely worth fixing, with the reason each one matters.',
      'It is also the cheapest way to decide whether you need a rebuild at all. Sometimes a site needs three fixes, not a new build.',
    ],
    includes: [
      {
        title: 'Performance measurement',
        body: 'Real load-time measurements on mobile and desktop, with the specific causes identified — image weight, blocking scripts, font loading, layout shift.',
      },
      {
        title: 'Clarity review',
        body: 'A first-impression assessment: within five seconds, can a stranger tell what you do, who it is for and what to do next?',
      },
      {
        title: 'Mobile check',
        body: 'Tested at common phone widths for overflow, unreadable text, tiny tap targets and broken layouts.',
      },
      {
        title: 'Search visibility',
        body: 'Titles, descriptions, headings, indexability, sitemap, robots and structured data reviewed page by page.',
      },
      {
        title: 'Accessibility scan',
        body: 'Colour contrast, keyboard navigation, focus states, form labels and alt text — assessed against WCAG 2.2 AA where practical.',
      },
      {
        title: 'Enquiry-path test',
        body: 'I test every form, phone link and WhatsApp button as a real visitor would, and tell you where leads can leak.',
      },
      {
        title: 'Prioritised report',
        body: 'A written document separating "fix this first", "fix this next" and "nice to have", with an effort estimate for each.',
      },
    ],
    audiences: [
      'Owners who suspect their site is underperforming but do not know why',
      'Businesses considering a rebuild who want evidence first',
      'Teams who have been sold SEO work and want an independent read',
      'Anyone about to spend money on marketing and want the site ready for it',
    ],
    process: [
      { title: 'Access', body: 'You share the site URL and, if useful, read-only analytics access.', duration: 'Day 1' },
      { title: 'Review', body: 'Manual and measured review across performance, clarity, mobile, search, accessibility and forms.', duration: 'Day 2–4' },
      { title: 'Report', body: 'A written report with screenshots, priorities and plain-English explanations.', duration: 'Day 5' },
      { title: 'Walkthrough', body: 'A short call to talk through the findings and answer questions.', duration: 'Day 5–7' },
    ],
    outcomes: [
      'A prioritised, jargon-free fix list',
      'Measured performance numbers you can compare later',
      'A clear verdict: repair, optimise, or rebuild',
      'Screenshots showing exactly what is wrong',
      'The cost deducted if you book the rebuild',
    ],
    faq: [
      {
        q: 'Is this an automated report?',
        a: 'No. Automated tools generate the raw numbers, but every finding is reviewed by hand and explained in context. Automated audits routinely flag things that do not matter and miss things that do.',
      },
      {
        q: 'Do you fix the issues too?',
        a: 'If you want. The audit is standalone, but most clients ask me to implement the priority fixes. That work is quoted separately and the audit fee is deducted from a rebuild.',
      },
      {
        q: 'How long does it take?',
        a: 'Usually three to five working days from getting access, depending on site size.',
      },
    ],
    related: ['redesign', 'seo', 'website'],
  },
  {
    key: 'ai',
    name: 'AI agent development',
    eyebrow: 'Assistants that know your business',
    heroTitle: 'An AI agent that answers',
    heroAccent: 'like someone who works there.',
    heroLead:
      'Custom AI assistants grounded in your actual information — services, prices, policies, availability — that answer enquiries, qualify leads and hand over to a human when they should.',
    summary:
      'Custom, domain-grounded AI agents for enquiries, booking, lead routing and internal operations.',
    ngn: 200000,
    unit: 'project',
    priceNote: 'Starting price. Final cost depends on scope, integrations and knowledge sources.',
    enabled: true,
    icon: 'bot',
    image: '/images/work/studio-collab.webp',
    imageAlt: 'TIMFIRE collaborating on a technical build',
    problem: [
      'Most businesses already have an AI problem: customers ask questions at 11pm, and nobody answers. Enquiries arrive on WhatsApp, Instagram, email and a website form, and half of them never get a reply.',
      'Off-the-shelf chatbots make this worse. They invent answers, promise things you do not offer, and frustrate the customer you were trying to help.',
      'A useful agent is narrower and more careful. It answers from information you have approved, says "I do not know" when it does not, collects what you need to follow up, and escalates a real human conversation when the situation calls for one.',
    ],
    includes: [
      {
        title: 'Knowledge grounding',
        body: 'Your agent answers from a curated set of your real content — services, prices, hours, policies, FAQs — not from general internet guesswork.',
      },
      {
        title: 'Honest boundaries',
        body: 'Clear rules for what the agent will not do: no inventing prices, no promising timelines, no medical or legal advice, no pretending to be human.',
      },
      {
        title: 'Lead capture',
        body: 'Conversations become structured records — name, contact, need, budget, timeline — delivered to you by email or into your admin area.',
      },
      {
        title: 'Human handover',
        body: 'A WhatsApp or email handoff when the agent is unsure, when the customer asks for a person, or when the value of the enquiry justifies your attention.',
      },
      {
        title: 'Channel integration',
        body: 'Website chat, WhatsApp, or an internal tool — deployed where your customers already are, not where it is easiest to build.',
      },
      {
        title: 'Observability',
        body: 'A simple log of what people ask and what the agent answered, so you can improve the knowledge base over time.',
      },
      {
        title: 'Guardrails and privacy',
        body: 'No sensitive data stored in the prompt, no key exposure in the browser, rate limiting, and a clear privacy note for visitors.',
      },
    ],
    audiences: [
      'Businesses that lose enquiries outside working hours',
      'Teams answering the same ten questions every day',
      'Customer-facing companies with high WhatsApp or DM volume',
      'Owners who want automation without buying a generic subscription chatbot',
      'Internal teams that need an assistant for booking, scheduling or research',
    ],
    process: [
      { title: 'Task mapping', body: 'We list the questions and tasks the agent must handle, and the ones it must refuse.', duration: 'Week 1' },
      { title: 'Knowledge build', body: 'Your approved content is turned into a structured knowledge base.', duration: 'Week 1–2' },
      { title: 'Prototype', body: 'A working agent you can talk to, tested against real questions from your business.', duration: 'Week 2' },
      { title: 'Guardrails', body: 'Refusals, escalation rules, rate limits and privacy handling added.', duration: 'Week 2' },
      { title: 'Deployment', body: 'Live on your chosen channel, with a human handover path.', duration: 'Week 3' },
      { title: 'Review', body: 'Two weeks of conversation review and knowledge tuning.', duration: 'Week 3–5' },
    ],
    outcomes: [
      'Enquiries answered at any hour, in your voice',
      'Structured lead records instead of scattered messages',
      'Fewer repetitive questions reaching you directly',
      'A knowledge base you can keep improving',
      'Clear escalation to a human when it matters',
    ],
    faq: [
      {
        q: 'Will it make things up?',
        a: 'A properly grounded agent is instructed to answer only from approved content and to say when it does not know. I test for this with adversarial questions before launch. No system is perfect, which is why human handover and conversation logs matter.',
      },
      {
        q: 'Do I need technical staff to run it?',
        a: 'No. You need to keep your information current, which usually means sending me updated prices or policies, or editing a knowledge file. The technical layer stays with me.',
      },
      {
        q: 'Which platforms do you build on?',
        a: 'It depends on the job. Website chat and WhatsApp integrations are the most common. I choose the stack based on your channels, budget and how much of the conversation needs to be automated.',
      },
      {
        q: 'What about customer data?',
        a: 'Conversations are handled with minimum necessary data, secrets stay server-side, and visitors get a clear note that they are talking to an AI assistant. You own the conversation records.',
      },
    ],
    related: ['website', 'seo', 'mentorship'],
  },
  {
    key: 'seo',
    name: 'SEO optimisation',
    eyebrow: 'Be found by the right people',
    heroTitle: 'Be found by people',
    heroAccent: 'already looking for you.',
    heroLead:
      'Technical search foundations, honest content structure and local visibility — so the people searching for what you do can actually find you, and understand why they should choose you.',
    summary:
      'Technical SEO, structured data and content structure that make your site discoverable and credible.',
    ngn: 80000,
    unit: 'project',
    priceNote: 'Starting price for a technical foundation. Ongoing content work is quoted separately.',
    enabled: true,
    icon: 'trending',
    image: '/images/work/workspace-neon.webp',
    imageAlt: 'TIMFIRE reviewing search analytics at a workstation',
    problem: [
      'SEO has a reputation problem, and mostly deserves it. Business owners are sold monthly retainers, promised rankings, and given reports full of numbers that never translate into customers.',
      'The unglamorous truth is that most sites have basic, fixable problems: pages with no real title, duplicate descriptions, missing headings, images with no alt text, no sitemap, and no structured data telling search engines what the business actually is.',
      'Fix those first. Then, if you want to compete for valuable search terms, build genuinely useful content around what your customers type into Google. No tricks, no keyword stuffing, no fake reviews.',
    ],
    includes: [
      {
        title: 'Technical foundations',
        body: 'Crawlable structure, clean URLs, canonical tags, sitemap, robots rules, correct status codes and HTTPS.',
      },
      {
        title: 'Page-level optimisation',
        body: 'Unique, specific titles and descriptions for every page — written for a human reading a search result, not for a keyword counter.',
      },
      {
        title: 'Structured data',
        body: 'Schema markup for your organisation, services, articles, breadcrumbs and local business details where relevant.',
      },
      {
        title: 'Content structure',
        body: 'Headings that describe, internal links that guide, and pages that answer the questions people actually search.',
      },
      {
        title: 'Local visibility',
        body: 'Consistent business name, address and phone details, and a properly completed Google Business Profile where relevant.',
      },
      {
        title: 'Speed and Core Web Vitals',
        body: 'Image compression, font strategy and layout stability — because slow pages rank and convert worse.',
      },
      {
        title: 'Honest reporting',
        body: 'What was changed, what to expect, and what not to expect. No guaranteed first-place promises.',
      },
    ],
    audiences: [
      'Businesses that exist on Google Maps but have no real website presence',
      'Sites with good content that nobody finds',
      'Owners who have paid for SEO before and seen nothing change',
      'Businesses entering a new city, market or service category',
    ],
    process: [
      { title: 'Baseline', body: 'Current visibility, indexing and technical state recorded so improvement is measurable.', duration: 'Week 1' },
      { title: 'Technical fixes', body: 'Titles, descriptions, headings, sitemap, schema, canonicals and speed work.', duration: 'Week 1–2' },
      { title: 'Content structure', body: 'Existing pages reorganised and gaps identified.', duration: 'Week 2–3' },
      { title: 'Local setup', body: 'Business profile and citation consistency where relevant.', duration: 'Week 3' },
      { title: 'Handover', body: 'A plain document of what changed and what to keep doing.', duration: 'Week 3–4' },
    ],
    outcomes: [
      'Every page with a unique, meaningful title and description',
      'Structured data search engines can read',
      'A sitemap that reflects reality',
      'Faster pages and better Core Web Vitals',
      'A clear, honest picture of what to expect',
    ],
    faq: [
      {
        q: 'Can you guarantee first position on Google?',
        a: 'No, and anyone who does is guessing or misleading you. I can guarantee that the technical foundations will be correct, the content will be genuinely useful, and the work will be honest.',
      },
      {
        q: 'How long until I see results?',
        a: 'Technical fixes can be picked up within days to weeks. Content-driven visibility usually takes three to six months. It is a slow compounding asset, not a switch.',
      },
      {
        q: 'Do I need a new website for SEO?',
        a: 'Not necessarily. If the site can be crawled, is reasonably fast and has a sane structure, it can often be optimised in place. If the platform is fighting us, I will say so.',
      },
    ],
    related: ['website', 'audit', 'redesign'],
  },
  {
    key: 'graphic',
    name: 'Graphic design',
    eyebrow: 'Design people stop scrolling for',
    heroTitle: 'Visuals that make',
    heroAccent: 'people stop.',
    heroLead:
      'Campaign graphics, social creative, event visuals and promotional design — made to be read in one second on a phone screen and remembered after the scroll.',
    summary:
      'Social creative, campaign graphics and event visuals built for small screens and fast scrolls.',
    ngn: 20000,
    unit: 'project',
    priceNote: 'Starting price per design set. Volume and complexity affect the final cost.',
    enabled: true,
    icon: 'pen',
    image: '/images/ventures/kr8-poster-dev.webp',
    imageAlt: 'Website development promotional design created for KR8 DIGITALS',
    problem: [
      'Most small businesses do not have a design problem, they have a consistency problem. Every post is made separately, in a different app, by whoever had five minutes. The result is a feed that does not look like one business.',
      'Design for social is also a different craft from design for print. The thing must work at thumbnail size, in a moving feed, with text readable by someone holding a phone at arm\'s length.',
      'Good graphic design is not decoration. It is the difference between a message that lands and one that gets scrolled past.',
    ],
    includes: [
      {
        title: 'Social creative sets',
        body: 'Coherent sets for a campaign or month of posts, sized correctly for each platform rather than squeezed into one shape.',
      },
      {
        title: 'Event and announcement visuals',
        body: 'Flyers, posters and carousels for launches, events and announcements — with the hierarchy that makes the date and the action obvious.',
      },
      {
        title: 'Typography that holds up',
        body: 'Text large enough to read on a phone, contrast that survives compression, and layouts that do not collapse at thumbnail size.',
      },
      {
        title: 'Consistent templates',
        body: 'Reusable layouts your team can fill in without breaking the look, so consistency survives after the project ends.',
      },
      {
        title: 'Export-ready files',
        body: 'Correct dimensions, formats and file sizes for each destination, including print-ready files where needed.',
      },
    ],
    audiences: [
      'Businesses posting regularly without a consistent visual system',
      'Event organisers needing flyers and announcement visuals',
      'Founders launching a product or offer',
      'Teams that need templates they can reuse themselves',
    ],
    process: [
      { title: 'Brief', body: 'What is the piece for, who sees it, and what should they do?', duration: 'Day 1' },
      { title: 'Direction', body: 'One or two visual directions agreed before the set is built.', duration: 'Day 1–2' },
      { title: 'Design', body: 'The full set produced and exported at the right sizes.', duration: 'Day 2–4' },
      { title: 'Revisions', body: 'Two rounds of refinement included.', duration: 'Day 4–5' },
    ],
    outcomes: [
      'A consistent visual set, not one-off posts',
      'Files correctly sized for each platform',
      'Templates you can reuse',
      'Designs legible at thumbnail size',
      'A faster turnaround on future creative',
    ],
    faq: [
      {
        q: 'Do you design logos?',
        a: 'Logo design sits under branding rather than graphic design, because it needs a wider system around it — colour, type, usage rules. Ask for branding if you need an identity rather than campaign creative.',
      },
      {
        q: 'How many designs do I get?',
        a: 'It depends on the set. A typical launch package is five to ten pieces. The starting price covers a small set; volume is quoted per project.',
      },
      {
        q: 'Can you work with my existing brand?',
        a: 'Yes. If you have a logo, colours and fonts, I work within them. If the existing brand is the problem, I will say so and suggest branding instead.',
      },
    ],
    related: ['branding', 'video', 'website'],
  },
  {
    key: 'branding',
    name: 'Branding',
    eyebrow: 'Look like the business you are becoming',
    heroTitle: 'A brand that is',
    heroAccent: 'recognisable at a glance.',
    heroLead:
      'Positioning, name treatment, colour, typography and usage rules — a small, practical identity system you can apply consistently without a designer in the room.',
    summary:
      'Positioning, identity design and usage rules — a system, not just a logo.',
    ngn: 100000,
    unit: 'project',
    priceNote: 'Starting price. Final cost depends on the number of marks and collateral items.',
    enabled: true,
    icon: 'sparkles',
    image: '/images/ventures/kr8-poster-ai.webp',
    imageAlt: 'KR8 DIGITALS campaign artwork showing brand colour and typography',
    problem: [
      'A logo is not a brand. A brand is what someone says about you when you are not in the room: what you do, who you are for, and why you rather than the alternative.',
      'Most small businesses have a logo made once, in isolation, with no rules for how to use it. So it gets stretched, recoloured, placed on backgrounds it disappears into, and paired with a different font on every surface.',
      'The fix is not expensive if it is done as a system: a clear positioning sentence, a mark that works at small sizes, a palette, a type pairing, and one page of rules that keeps it all consistent.',
    ],
    includes: [
      {
        title: 'Positioning',
        body: 'One clear sentence: what you offer, for whom, and why it is different. This drives every design decision that follows.',
      },
      {
        title: 'Logo system',
        body: 'A primary mark, a compact version for small spaces, and correct usage on light, dark and coloured backgrounds.',
      },
      {
        title: 'Colour palette',
        body: 'A defined set with hex codes, contrast pairings and rules for when to use each.',
      },
      {
        title: 'Typography',
        body: 'A display face and a body face, with sizes and weights specified so documents and posts look related.',
      },
      {
        title: 'Usage guide',
        body: 'A short document: correct spacing, minimum sizes, what not to do, and how the pieces combine.',
      },
      {
        title: 'Practical assets',
        body: 'Export-ready files for web, social, print and signage, in the formats each needs.',
      },
    ],
    audiences: [
      'Businesses whose logo was made quickly and no longer fits',
      'Founders preparing to pitch, launch or expand',
      'Organisations with several people producing materials inconsistently',
      'Businesses competing on price because they do not look established',
    ],
    process: [
      { title: 'Discovery', body: 'Business, customers, competitors and the feeling the brand should create.', duration: 'Week 1' },
      { title: 'Positioning', body: 'A written positioning statement agreed before design begins.', duration: 'Week 1' },
      { title: 'Identity design', body: 'Mark, palette and type explored and refined.', duration: 'Week 2' },
      { title: 'System', body: 'Usage rules and practical assets assembled into a short guide.', duration: 'Week 3' },
      { title: 'Handover', body: 'Files organised, walkthrough of how to apply the system.', duration: 'Week 3' },
    ],
    outcomes: [
      'A positioning sentence you can repeat confidently',
      'A mark that works at every size',
      'A defined palette and type pairing',
      'A one-page usage guide',
      'Files your printer, developer and social team can all use',
    ],
    faq: [
      {
        q: 'Do I get the source files?',
        a: 'Yes. You receive the logo files, exports for each use, the palette and font details, and the usage guide. The brand is yours.',
      },
      {
        q: 'How many logo options will I see?',
        a: 'I present one considered direction with a few variants rather than a wall of unrelated options. Choosing between five random logos produces a weaker result than refining one good idea.',
      },
      {
        q: 'Can you brand my website too?',
        a: 'Yes — branding and website development are usually done together, so the identity is applied correctly from day one rather than retrofitted.',
      },
    ],
    related: ['website', 'graphic', 'video'],
  },
  {
    key: 'video',
    name: 'Video editing',
    eyebrow: 'Video people finish watching',
    heroTitle: 'Cuts built for how',
    heroAccent: 'people actually watch.',
    heroLead:
      'Short-form reels, event films, testimonial pieces and promotional cuts — edited for retention, captioned for silence, and finished to look deliberate.',
    summary:
      'Short-form reels, event and promotional edits with captions, pacing and colour work.',
    ngn: null,
    unit: 'project',
    priceNote: 'Quoted per project — length, footage volume and edit complexity all vary.',
    enabled: true,
    icon: 'video',
    image: '/images/creative/spoken-stage.webp',
    imageAlt: 'A stage lit for performance, the kind of footage TIMFIRE edits',
    problem: [
      'Raw footage is not a video. A two-hour recording of a good event, uploaded unedited, will not be watched. The same event, cut into ninety seconds with the right moments and burned-in captions, will be.',
      'Most people watch social video with the sound off, on a phone, for the first two seconds before deciding. An edit that does not hook in that window has failed regardless of how good the content was.',
      'Editing is the craft of deciding what to leave out. That is where most amateur video goes wrong: everything is kept.',
    ],
    includes: [
      {
        title: 'Structure and pacing',
        body: 'A strong opening two seconds, a reason to keep watching, and an ending that says what to do next.',
      },
      {
        title: 'Captions',
        body: 'Burned-in, legible captions for sound-off viewing, timed properly rather than auto-generated and left unread.',
      },
      {
        title: 'Colour and sound',
        body: 'Basic colour correction, consistent audio levels and music bed selection where licensed.',
      },
      {
        title: 'Format delivery',
        body: 'Correct aspect ratios for each platform, exported at sensible file sizes.',
      },
      {
        title: 'Reusable assets',
        body: 'Short vertical cuts derived from longer footage so one shoot produces weeks of content.',
      },
    ],
    audiences: [
      'Businesses with event or behind-the-scenes footage sitting unused',
      'Founders who need a short credibility video',
      'Speakers and creatives needing performance clips',
      'Teams producing social content without an editor',
    ],
    process: [
      { title: 'Review', body: 'I review the footage and propose what the edit should become.', duration: 'Day 1–2' },
      { title: 'First cut', body: 'Structure, pacing and captions in a first version for review.', duration: 'Day 2–4' },
      { title: 'Refinement', body: 'Two rounds of revisions on timing, captions and sound.', duration: 'Day 4–6' },
      { title: 'Delivery', body: 'Final exports in each aspect ratio and format needed.', duration: 'Day 6' },
    ],
    outcomes: [
      'A cut that holds attention past two seconds',
      'Captions for sound-off viewing',
      'Consistent colour and audio',
      'Platform-correct exports',
      'Extra short cuts from the same footage',
    ],
    faq: [
      {
        q: 'How do I send footage?',
        a: 'Usually through a shared cloud folder. If the files are very large we agree a transfer method before you upload. Original files are better than compressed WhatsApp versions.',
      },
      {
        q: 'How long should the video be?',
        a: 'For social, fifteen to sixty seconds is usually right. For events, two to three minutes. I will tell you honestly if the footage supports the length you have in mind.',
      },
      {
        q: 'Why is there no starting price?',
        a: 'Because a thirty-second reel from clean footage and a five-minute event film from twelve hours of raw video are entirely different jobs. Quoting a single number would mislead you in one direction or the other.',
      },
    ],
    related: ['graphic', 'branding', 'website'],
  },
  {
    key: 'mentorship',
    name: 'One-on-one mentorship',
    eyebrow: 'Learn by building, not watching',
    heroTitle: 'Bring the real problem.',
    heroAccent: 'Leave with a plan.',
    heroLead:
      'Pay-as-you-learn sessions for people learning to build websites, work with AI, or turn a digital skill into income. We work on your actual project, not a generic curriculum.',
    summary:
      'Practical, pay-as-you-learn sessions on web development, AI and turning a skill into income.',
    ngn: 2500,
    unit: 'hour',
    priceNote: 'Per hour. Packages for regular sessions are available on request.',
    enabled: true,
    icon: 'graduation',
    image: '/images/creative/speaking.webp',
    imageAlt: 'TIMFIRE explaining a concept with open hands during a session',
    problem: [
      'Most people learning to code or build are stuck at the same place: they have followed tutorials but cannot start anything on their own. They can build a to-do app in a course, but not a real project for a real person.',
      'The gap is not more tutorials. It is someone looking at your actual work, telling you what is wrong with it, and showing you what to do next.',
      'This is what mentorship is for. It works best when you bring a real project, a specific stuck point, or a genuine career question.',
    ],
    includes: [
      {
        title: 'Your project, not a template',
        body: 'We work on what you are actually building. Bring the code, the design, the client brief, or the message you cannot phrase.',
      },
      {
        title: 'Honest review',
        body: 'Direct feedback on your work and what to improve, with reasons. No flattery, no padding.',
      },
      {
        title: 'Practical next steps',
        body: 'You leave each session with specific things to do before the next one.',
      },
      {
        title: 'Career and client guidance',
        body: 'Pricing, pitching, scope, contracts, portfolio and how to get the first or next client.',
      },
      {
        title: 'Between-session access',
        body: 'Short questions by WhatsApp between sessions, within reason.',
      },
    ],
    audiences: [
      'Beginners who have finished tutorials but cannot start alone',
      'Developers who can build but cannot get clients',
      'Designers who need to understand how their work becomes code',
      'Anyone moving into web or AI work from another field',
      'Small business owners who want to understand their own website',
    ],
    process: [
      { title: 'First session', body: 'We assess where you are, what you want, and what is blocking you.', duration: 'Hour 1' },
      { title: 'Plan', body: 'A short written plan: what to learn, in what order, and what to build to prove it.', duration: 'Hour 1' },
      { title: 'Regular sessions', body: 'Weekly or as needed, reviewing your real work.', duration: 'Ongoing' },
      { title: 'Checkpoints', body: 'Periodic review of the portfolio or client work you have produced.', duration: 'Monthly' },
    ],
    outcomes: [
      'A clear next step after every session',
      'Feedback on your actual work',
      'A portfolio that proves real capability',
      'Practical guidance on pricing and clients',
      'Confidence to start without a tutorial',
    ],
    faq: [
      {
        q: 'Do I need experience to start?',
        a: 'No. Beginners are welcome. What matters is that you bring something real to work on, even if it is early and unfinished.',
      },
      {
        q: 'How are sessions held?',
        a: 'Google Meet or WhatsApp video, whichever is easier for you, with a shared screen. Recordings available on request.',
      },
      {
        q: 'Do you teach AI agents?',
        a: 'Yes. The AI agent development service is what I do for clients, and I teach the fundamentals and the practical guardrails to individuals and teams.',
      },
      {
        q: 'Why is it pay-as-you-learn?',
        a: 'Because you should be able to try before committing to a package. Most people do three to six sessions. Some need one.',
      },
    ],
    related: ['ai', 'website', 'redesign'],
  },
];

export const SERVICE_BY_KEY = new Map(SERVICES.map((s) => [s.key, s]));

/** Apply owner overrides from the CMS (enable/disable, price, note) to the catalogue. */
export function resolveServices(
  overrides: { key: string; enabled: boolean; ngn: number | null; priceNote: string }[] = [],
): ServiceDetail[] {
  if (!overrides.length) return SERVICES;
  const byKey = new Map(overrides.map((o) => [o.key, o]));
  return SERVICES.map((service) => {
    const override = byKey.get(service.key);
    if (!override) return service;
    return {
      ...service,
      enabled: override.enabled,
      ngn: override.ngn === null ? service.ngn : override.ngn,
      priceNote: override.priceNote?.trim() ? override.priceNote : service.priceNote,
    };
  });
}

export function serviceByKey(key: string): ServiceDetail | undefined {
  return SERVICE_BY_KEY.get(key as ServiceKey);
}

export const ENABLED_SERVICES = SERVICES.filter((s) => s.enabled);
