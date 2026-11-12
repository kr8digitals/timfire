/**
 * Dedicated service landing pages.
 *
 * The Services index introduces; these pages educate and convert. Each one
 * answers, in plain language: what the service is, why the visitor needs it,
 * what problems it solves, what working with TIMFIRE accomplishes, what the
 * process looks like — and only then asks for the enquiry, through the form
 * built for that exact intention.
 */

export type ServiceBlock = { heading: string; body: string };

export type ServicePage = {
  slug: string;
  serviceId: string;
  name: string;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  blocks: ServiceBlock[];
  outcomes: string[];
  process: string[];
  formKind: string;
  description: string;
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'website-design-development',
    serviceId: 'website',
    name: 'Website design & development',
    eyebrow: 'Websites',
    title: 'A website is your',
    accent: 'best employee.',
    lead: 'It opens before you do, answers before you reply, and remembers every detail you would rather not repeat. From ₦150,000, built around the one thing a visitor should do next.',
    description:
      'Fast, clear websites for businesses and organisations — new builds, rebuilds, redesigns and audits — each built around a single outcome and handed over in your name.',
    blocks: [
      {
        heading: 'What a website actually does',
        body: 'A website is not a brochure with your logo on it. It has three jobs, and it either does them or it does not: explain what you offer in the first screen, prove it with real work and real words, and capture the enquiry before the visitor gets distracted. Most websites fail the third job quietly — the phone never rings, and nobody can say why.',
      },
      {
        heading: 'New, rebuilt, audited or improved',
        body: 'Four different needs, one craft. A brand-new site when you have nothing yet. A rebuild when the old one is slow, embarrassing or built on a platform you do not own. A redesign when the business has outgrown how it looks. An audit when the site exists but the enquiries do not — I read it the way a customer would, on a mid-range phone, and tell you exactly where the money leaks. And sometimes the honest answer is smaller than all four: a targeted improvement to the page that is losing you customers.',
      },
      {
        heading: 'What you can expect from me',
        body: 'I build for the phone most of your visitors actually hold, not the laptop in my office. Every page gets one clear action. Copy is written in the language your customers use, not the language of brochures. Domain, hosting and files are set up in your name from day one, with a handover walkthrough — you own everything, including the ability to edit text without calling me.',
      },
    ],
    outcomes: [
      'Loads fast on a mid-range Android on a slow connection',
      'One clear action per page, reachable in two taps',
      'First screen explains what you do without the words “solutions” or “innovative”',
      'Domain, hosting and source files registered in your name',
      'Content you can edit yourself after handover',
    ],
    process: [
      'A conversation, then a written quote — scope and price agreed before any work',
      'Structure before design: pages, order and the action each one serves',
      'Build on real content: your prices, your photos, your actual words',
      'Launch, measure the first enquiries, and hand over with a walkthrough',
    ],
    formKind: 'website',
  },
  {
    slug: 'ai-agent-development',
    serviceId: 'ai',
    name: 'AI agent development',
    eyebrow: 'AI agents',
    title: 'The work gets done',
    accent: 'while you sleep.',
    lead: 'An AI agent is not a chatbot bolted onto a website. It is a trained member of staff: grounded in your real prices, your real process and your real refusals. From ₦200,000.',
    description:
      'Domain-grounded AI agents for WhatsApp, websites and internal tools — built on a written knowledge base, with refusals designed before answers, and two weeks of supervised learning after launch.',
    blocks: [
      {
        heading: 'What an AI agent is — and is not',
        body: 'A chatbot guesses. An agent knows. The difference is not the model; it is the knowledge base behind it: the document where your real prices, your real turnaround times and the things you will not do are written down plainly. I build that document with you first, because a confident wrong answer costs you a customer who trusted you, while an honest “let me get a person” costs nothing.',
      },
      {
        heading: 'What it can take off your plate',
        body: 'The same twenty questions answered every day, at 2am, in three languages if you need. Booking and scheduling without a back-and-forth. Follow-ups that actually happen. Reports compiled instead of postponed. First-draft responses your team approves rather than writes. The rule is simple: if a task is repetitive, rule-based and currently living in your head, it is a candidate.',
      },
      {
        heading: 'Proof, not promises',
        body: 'RIYA answers visitors on kr8digitals.com today. Beauty Shuts runs a YouTube channel end to end — ideas, scripts, generation, editing, posting, analytics. Tenny works as a WhatsApp chief of staff, managing five other agents and checking that they deliver. These are not demos; they are working systems with owners who rely on them.',
      },
    ],
    outcomes: [
      'A written knowledge base you keep, model-independent',
      'Refusal and escalation rules designed before the answers',
      'Two weeks of supervised conversation review after launch',
      'A monthly report of what people actually asked',
      'Handover: you can extend the knowledge base without me',
    ],
    process: [
      'Map the work: what the agent handles, what a human must own',
      'Write the knowledge base together — prices, process, refusals',
      'Build and test against the questions you dread most',
      'Launch, read every conversation for a fortnight, then tune',
    ],
    formKind: 'ai',
  },
  {
    slug: 'seo-optimisation',
    serviceId: 'seo',
    name: 'SEO optimisation',
    eyebrow: 'Search',
    title: 'Be the answer when',
    accent: 'they go looking.',
    lead: 'Search is where intention lives: someone already wants what you sell and is typing it into a box. From ₦80,000, I make sure the box returns you.',
    description:
      'Technical health, content that answers real queries, local visibility and speed — SEO as a system, not a trick, with the naira base price converted to your currency.',
    blocks: [
      {
        heading: 'What SEO actually means',
        body: 'Search engines are librarians with a bias for clarity. They reward pages that load fast, say one true thing well, and earn links because they deserve them. SEO is the discipline of making your site the clearest answer to a question someone really asks — “hotel with event hall in Abakaliki”, “website developer in Nigeria”, “STEM competition for secondary schools”.',
      },
      {
        heading: 'Why your website needs it',
        body: 'A beautiful site nobody can find is a showroom with the lights off. Paid ads stop the moment you stop paying; search compounds. The page you fix this quarter keeps answering questions next year. For local businesses the effect is sharper still: most customers choose from the first three results, and most never scroll past them.',
      },
      {
        heading: 'What I do for you',
        body: 'First the technical floor: speed, mobile behaviour, structured data, sitemaps, canonical URLs — the things that decide whether search engines can read you at all. Then the content floor: pages and articles written to answer the queries your market actually types, linked internally so authority flows to the pages that earn money. Then the local floor: your business profiles, consistent details, and reviews that mean something.',
      },
    ],
    outcomes: [
      'A technical audit with the fixes that matter first',
      'Pages written for real queries, not for keywords stuffed in',
      'Structured data so search engines understand what you offer',
      'Local profile consistency across the places customers check',
      'A plain monthly report: what ranked, what clicked, what enquired',
    ],
    process: [
      'Audit: can search engines read you, and how fast do you load',
      'Query map: the questions your market types, ranked by value',
      'Fix the floor, then write or rewrite the pages that answer them',
      'Measure monthly and double down on what converts',
    ],
    formKind: 'seo',
  },
  {
    slug: 'graphic-design',
    serviceId: 'graphic',
    name: 'Graphic design',
    eyebrow: 'Design',
    title: 'Design that speaks',
    accent: 'before you do.',
    lead: 'A poster has about two seconds of a stranger’s attention. From ₦20,000 per piece, I make those two seconds count.',
    description:
      'Posters, flyers, logos, social media kits and event branding — designed to be read at a glance and remembered afterwards.',
    blocks: [
      {
        heading: 'What graphic design is for',
        body: 'Design is not decoration; it is ordering. A good poster tells the eye where to land first, second and third, and leaves one thing in the memory: the date, the price, the name. A good social kit makes ten different posts look like one voice. When the ordering is wrong, people scroll — and scrolling is the expensive part.',
      },
      {
        heading: 'What I make',
        body: 'Event posters and flyers that survive a WhatsApp forward without turning to mush. Logos that still work at favicon size and in one colour on a receipt. Social media kits with templates your team can reuse without breaking the system. Event branding carried consistently from the banner at the gate to the slide on the screen.',
      },
      {
        heading: 'How we work',
        body: 'You tell me the piece, the deadline and where it will be seen — print behaves differently from a phone screen, and a billboard is a different discipline again. I send directions, not one lonely option: two or three routes with the reasoning behind each, then revisions until it is right rather than until we are tired.',
      },
    ],
    outcomes: [
      'Files delivered for every surface: print, web and social',
      'Source files included — you are never locked out of your own design',
      'Templates your team can reuse without breaking the system',
      'Two or three directions first, revisions until it is right',
    ],
    process: [
      'Brief: the piece, the audience, the deadline, the surfaces',
      'Directions: two or three routes with the reasoning attached',
      'Refine together until one route is unmistakably right',
      'Deliver every format, plus the source files',
    ],
    formKind: 'graphic',
  },
  {
    slug: 'branding',
    serviceId: 'branding',
    name: 'Branding',
    eyebrow: 'Identity',
    title: 'Look like',
    accent: 'what you charge.',
    lead: 'People decide what you cost before you say a number. From ₦100,000, branding makes that first decision work in your favour.',
    description:
      'Identity systems for new and existing brands: positioning, name and voice, visual identity and the guidelines that keep it consistent everywhere.',
    blocks: [
      {
        heading: 'Why branding is a business decision',
        body: 'Two identical services at different prices sell differently, and the difference is trust signalled before the first conversation: the logo, the colours, the photography, the way a quotation is laid out. Branding is the deliberate control of those signals, so the price you quote arrives already justified.',
      },
      {
        heading: 'What a brand system includes',
        body: 'Positioning in one sentence: who you are for, and why you instead. A name and voice that survive contact with real customers. A visual identity — mark, palette, type, imagery — built to work on a shopfront, an invoice and a phone screen at once. And the guidelines document that stops the system drifting the first time someone else touches it.',
      },
      {
        heading: 'Refresh or rebrand',
        body: 'Not every brand needs a bonfire. Sometimes the equity you have built is worth keeping and only the execution is tired — a refresh tightens what exists. A rebrand is for when the business has become something the old identity cannot say. I will tell you honestly which one you need, because a rebrand sold to a refresh client is how trust gets burned.',
      },
    ],
    outcomes: [
      'Positioning in one sentence your whole team can repeat',
      'A visual identity tested at favicon size and shopfront size',
      'Voice guidelines with real examples, not adjectives',
      'A guidelines document that keeps it consistent without you',
    ],
    process: [
      'Listen: customers, competitors, and the story you actually tell',
      'Position and name the promise before any visual exists',
      'Design the identity system around that promise',
      'Hand over guidelines and the files for every surface',
    ],
    formKind: 'branding',
  },
  {
    slug: 'video-editing',
    serviceId: 'video',
    name: 'Video editing',
    eyebrow: 'Motion',
    title: 'Cut for',
    accent: 'attention.',
    lead: 'The first three seconds decide whether the next thirty exist. Quote-only, because length and edits decide the price.',
    description:
      'Adverts, announcements, course lessons and short-form series — edited for retention, captioned for sound-off viewing, delivered in every ratio you need.',
    blocks: [
      {
        heading: 'Why most videos lose people',
        body: 'Not because the footage is bad, but because the cut is polite. Retention is engineered: the hook lands in three seconds, dead air is removed, every scene earns the next, and captions carry the message for the majority who watch with the sound off. Editing is where a video becomes watchable or becomes skipped.',
      },
      {
        heading: 'What I edit',
        body: 'Adverts that sell one thing in under a minute. Announcements that respect the viewer’s time. Course lessons cut so the learning survives the pause button. Short-form series built for the feed: vertical, captioned, paced. Event recaps that make next year’s attendees wish they had come.',
      },
      {
        heading: 'How the work runs',
        body: 'You send footage or we plan the shoot together. I return a first cut early, because feedback on a real cut is worth ten meetings about an imaginary one. Two revision rounds are included; delivery arrives in every ratio and resolution the platforms you use actually require.',
      },
    ],
    outcomes: [
      'A hook in the first three seconds, every time',
      'Captions and sound-off viewing handled by default',
      'Delivered in every ratio your platforms require',
      'First cut early, two revision rounds included',
    ],
    process: [
      'Agree the one thing the video must make someone do',
      'Assemble and cut to retention, not to runtime',
      'First cut early; revise against the goal, not taste',
      'Deliver every format, plus the project file on request',
    ],
    formKind: 'video',
  },
  {
    slug: 'mentorship',
    serviceId: 'mentorship',
    name: 'One-on-one mentorship',
    eyebrow: 'Teaching',
    title: 'Learn by',
    accent: 'building.',
    lead: 'Pay as you learn, ₦2,500 per hour. Bring a real project, a stuck point or a career question; we work through it together.',
    description:
      'Practical one-on-one mentorship in web development, AI agents and freelancing — sessions built around your real project, not a slide deck.',
    blocks: [
      {
        heading: 'What a session looks like',
        body: 'You bring the thing: a project that is stuck, a decision you are avoiding, a career fork. We open it together and work, not talk about working. You leave with the next step done or clearly defined, and with the reasoning behind it — because the reasoning is the part that transfers to the next problem.',
      },
      {
        heading: 'Who it is for',
        body: 'Beginners who need a first real build instead of a tenth tutorial. Self-taught developers with gaps they can feel but not name. Professionals moving into AI agents from another stack. Freelancers who can build but cannot price. If you want motivation, there are cheaper sources; if you want the next commit unblocked, this is the room.',
      },
      {
        heading: 'Why pay-as-you-learn works',
        body: 'No package to abandon, no cohort to fall behind. You book the hours your current problem deserves and stop when it is solved. Through KR8 Academy the same teaching runs free in eight-week cohorts; mentorship is the individual, on-demand version of it, and it funds the free one.',
      },
    ],
    outcomes: [
      'Sessions scheduled around your project, not a curriculum',
      'Code and decisions reviewed in front of you, live',
      'A written next-step after every session',
      'Honest direction, including “you do not need me for this”',
    ],
    process: [
      'A short message about where you are and what is stuck',
      'First session: diagnose and fix the immediate blocker',
      'A plan for the next two weeks, in writing',
      'Sessions as needed; stop whenever the problem is solved',
    ],
    formKind: 'mentorship',
  },
];

export function servicePageBySlug(slug: string): ServicePage | undefined {
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

export function servicePageByServiceId(id: string): ServicePage | undefined {
  return SERVICE_PAGES.find((p) => p.serviceId === id);
}
