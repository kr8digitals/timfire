/**
 * Purpose-built enquiry forms.
 *
 * Every distinct intention on this website has its own form definition: its own
 * questions, its own options, its own order. A visitor requesting a website
 * rebuild and a visitor requesting a piano session never see the same fields,
 * so the owner can read an enquiry and know exactly what is being asked without
 * a single follow-up question.
 *
 * `name` and `email` are collected by the form shell; everything in `fields`
 * is specific to the intention.
 */

export type Field = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
};

export type FormDef = {
  kind: string;
  title: string;
  intro: string;
  submitLabel: string;
  fields: Field[];
};

const BUDGETS = ['₦150,000 – ₦300,000', '₦300,000 – ₦600,000', '₦600,000 and above', 'Not sure yet — advise me'];

export const FORMS: Record<string, FormDef> = {
  website: {
    kind: 'website',
    title: 'Website enquiry',
    intro: 'Four questions that tell me what to build and what it should achieve.',
    submitLabel: 'Send website enquiry',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      {
        name: 'projectType',
        label: 'What do you need?',
        type: 'select',
        required: true,
        options: [
          'A completely new website',
          'Rebuild my existing website',
          'Redesign my existing website',
          'Audit my current website',
          'Improve or fix specific things',
        ],
      },
      { name: 'currentSite', label: 'Current website (if any)', type: 'url', required: false, placeholder: 'https://…' },
      {
        name: 'outcome',
        label: 'Who is the website for, and what should they do on it?',
        type: 'textarea',
        required: true,
        hint: 'For example: “Parents in Abakaliki who should book a school visit.”',
      },
      {
        name: 'timeline',
        label: 'When does it need to be live?',
        type: 'select',
        required: true,
        options: ['As soon as possible', 'Within a month', 'Within three months', 'Just exploring for now'],
      },
      { name: 'budget', label: 'Budget range', type: 'select', required: true, options: BUDGETS },
    ],
  },
  ai: {
    kind: 'ai',
    title: 'AI agent request',
    intro: 'Tell me the work you want handed over, and what the agent must never guess.',
    submitLabel: 'Send agent request',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      {
        name: 'task',
        label: 'What repetitive work should the agent handle?',
        type: 'textarea',
        required: true,
        hint: 'Answering the same twenty questions, booking, reporting, follow-ups, drafting…',
      },
      {
        name: 'channel',
        label: 'Where should it live?',
        type: 'select',
        required: true,
        options: ['WhatsApp', 'Website chat', 'Instagram', 'Email', 'An internal tool', 'Not sure yet'],
      },
      {
        name: 'knowledge',
        label: 'What must the agent know to be trustworthy?',
        type: 'textarea',
        required: true,
        hint: 'Real prices, real turnaround times, and the things it must refuse or escalate.',
      },
      {
        name: 'volume',
        label: 'Roughly how many conversations per day?',
        type: 'select',
        required: false,
        options: ['A few', 'Dozens', 'Hundreds', 'No idea yet'],
      },
      { name: 'budget', label: 'Budget range', type: 'select', required: true, options: BUDGETS },
    ],
  },
  seo: {
    kind: 'seo',
    title: 'SEO enquiry',
    intro: 'Tell me who is searching for you and what they type when they do.',
    submitLabel: 'Send SEO enquiry',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      { name: 'siteUrl', label: 'Website address', type: 'url', required: true, placeholder: 'https://…' },
      {
        name: 'goal',
        label: 'What should SEO achieve?',
        type: 'select',
        required: true,
        options: ['More enquiries', 'More sales', 'Local visibility in my city', 'Ranking for specific keywords'],
      },
      { name: 'market', label: 'Who are you trying to be found by?', type: 'textarea', required: true },
      { name: 'keywords', label: 'Words people already use to find you (if you know)', type: 'textarea', required: false },
    ],
  },
  graphic: {
    kind: 'graphic',
    title: 'Graphic design enquiry',
    intro: 'Tell me the piece, the deadline and where it will be seen.',
    submitLabel: 'Send design enquiry',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      {
        name: 'piece',
        label: 'What do you need designed?',
        type: 'select',
        required: true,
        options: ['Poster or flyer', 'Logo', 'Social media kit', 'Event branding', 'Something else'],
      },
      { name: 'where', label: 'Where will it be seen?', type: 'text', required: true, hint: 'Print, WhatsApp status, Instagram, billboard…' },
      { name: 'deadline', label: 'Deadline', type: 'text', required: false },
      { name: 'details', label: 'Describe the job', type: 'textarea', required: true },
    ],
  },
  branding: {
    kind: 'branding',
    title: 'Branding enquiry',
    intro: 'Tell me how the brand should feel before we touch a logo.',
    submitLabel: 'Send branding enquiry',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      {
        name: 'stage',
        label: 'Where is the brand today?',
        type: 'select',
        required: true,
        options: ['Brand new — nothing exists yet', 'Existing brand needing a refresh', 'Full rebrand'],
      },
      { name: 'industry', label: 'What does the business do?', type: 'text', required: true },
      {
        name: 'feel',
        label: 'Three words for how the brand should feel',
        type: 'text',
        required: true,
        hint: 'For example: warm, precise, premium.',
      },
      { name: 'details', label: 'Anything else I should know?', type: 'textarea', required: false },
    ],
  },
  video: {
    kind: 'video',
    title: 'Video editing enquiry',
    intro: 'Tell me what footage exists and what the cut must achieve.',
    submitLabel: 'Send video enquiry',
    fields: [
      { name: 'organisation', label: 'Your name, business or organisation', type: 'text', required: true },
      {
        name: 'footage',
        label: 'What do we start from?',
        type: 'select',
        required: true,
        options: ['I have raw footage', 'Editing only — footage is supplied', 'Filming and editing', 'Stock footage and motion graphics'],
      },
      {
        name: 'purpose',
        label: 'What is the video for?',
        type: 'textarea',
        required: true,
        hint: 'Advert, announcement, course lesson, event recap, short-form series…',
      },
      {
        name: 'length',
        label: 'Target length',
        type: 'select',
        required: false,
        options: ['Under 30 seconds', '30–60 seconds', '1–3 minutes', 'Longer than 3 minutes'],
      },
      { name: 'deadline', label: 'Deadline', type: 'text', required: false },
    ],
  },
  mentorship: {
    kind: 'mentorship',
    title: 'Mentorship booking',
    intro: 'Bring a real project or a real question; we work through it together.',
    submitLabel: 'Book a session',
    fields: [
      { name: 'organisation', label: 'Your name', type: 'text', required: true },
      {
        name: 'focus',
        label: 'What should we work on?',
        type: 'select',
        required: true,
        options: ['Web development', 'AI agents', 'Career direction', 'A project I am stuck on', 'Freelancing and pricing'],
      },
      {
        name: 'experience',
        label: 'Where are you now?',
        type: 'select',
        required: true,
        options: ['Complete beginner', 'Some basics', 'Working professionally'],
      },
      { name: 'goal', label: 'What does success look like after our sessions?', type: 'textarea', required: true },
      { name: 'availability', label: 'When are you usually free?', type: 'text', required: false },
    ],
  },
  music: {
    kind: 'music',
    title: 'Music collaboration',
    intro: 'Singing, songwriting, playing, performing — tell me the shape of the project.',
    submitLabel: 'Send music enquiry',
    fields: [
      { name: 'organisation', label: 'Your name or artist name', type: 'text', required: true },
      {
        name: 'role',
        label: 'What are you inviting me into?',
        type: 'select',
        required: true,
        options: ['A collaboration / feature', 'Songwriting', 'A session on your project', 'Production of my song', 'A live performance'],
      },
      { name: 'genre', label: 'Genre or reference tracks', type: 'text', required: false },
      { name: 'idea', label: 'Describe the project and what you have so far', type: 'textarea', required: true },
      { name: 'timeline', label: 'Timeline', type: 'text', required: false },
    ],
  },
  'spoken-word': {
    kind: 'spoken-word',
    title: 'Spoken word collaboration',
    intro: 'Performance, writing or recording — tell me the piece and the occasion.',
    submitLabel: 'Send spoken word enquiry',
    fields: [
      { name: 'organisation', label: 'Your name or organisation', type: 'text', required: true },
      {
        name: 'format',
        label: 'What do you need?',
        type: 'select',
        required: true,
        options: ['A performance at my event', 'A commissioned piece', 'A recording', 'A workshop or class'],
      },
      { name: 'occasion', label: 'The occasion or project', type: 'text', required: true },
      { name: 'date', label: 'Date or timeframe', type: 'text', required: false },
      { name: 'details', label: 'Theme, tone and anything else that matters', type: 'textarea', required: true },
    ],
  },
  poetry: {
    kind: 'poetry',
    title: 'Poetry collaboration',
    intro: 'Commissioned poems, publication, performance pieces or joint work.',
    submitLabel: 'Send poetry enquiry',
    fields: [
      { name: 'organisation', label: 'Your name or publication', type: 'text', required: true },
      {
        name: 'purpose',
        label: 'What is the poem for?',
        type: 'select',
        required: true,
        options: ['A commissioned poem', 'Publication in an anthology or magazine', 'A performance piece', 'A collaboration'],
      },
      { name: 'theme', label: 'Subject, theme or dedication', type: 'textarea', required: true },
      { name: 'deadline', label: 'Deadline or event date', type: 'text', required: false },
    ],
  },
  speaking: {
    kind: 'speaking',
    title: 'Public speaking enquiry',
    intro: 'Tell me the room, the date and what the audience should leave with.',
    submitLabel: 'Send speaking enquiry',
    fields: [
      { name: 'organisation', label: 'Your name or organisation', type: 'text', required: true },
      {
        name: 'venue',
        label: 'What kind of event?',
        type: 'select',
        required: true,
        options: ['School or university', 'Conference', 'Church or community', 'Corporate', 'Online event'],
      },
      { name: 'topic', label: 'What should I speak about?', type: 'textarea', required: true },
      { name: 'date', label: 'Date and location', type: 'text', required: false },
      { name: 'audience', label: 'Expected audience size', type: 'text', required: false },
    ],
  },
  general: {
    kind: 'general',
    title: 'Send a message',
    intro: 'For anything that does not fit the forms above.',
    submitLabel: 'Send message',
    fields: [
      {
        name: 'topic',
        label: 'What is it about?',
        type: 'select',
        required: true,
        options: ['A service not listed here', 'Press or interview', 'Partnership', 'Something else'],
      },
      { name: 'message', label: 'Your message', type: 'textarea', required: true, hint: 'At least a sentence or two so I can route it properly.' },
    ],
  },
};

export const FORM_KINDS = Object.keys(FORMS);

/** Where each purpose-built form lives. The directory on /contact links here,
 *  jumping straight to the form panel on the destination page. */
export const FORM_ROUTES: Record<string, string> = {
  website: '/services/website-design-development#form',
  ai: '/services/ai-agent-development#form',
  seo: '/services/seo-optimisation#form',
  graphic: '/services/graphic-design#form',
  branding: '/services/branding#form',
  video: '/services/video-editing#form',
  mentorship: '/services/mentorship#form',
  music: '/collaborate/music#form',
  'spoken-word': '/collaborate/spoken-word#form',
  poetry: '/collaborate/poetry#form',
  speaking: '/collaborate/speaking#form',
  general: '#general',
};

export const SERVICE_FORM_KINDS = ['website', 'ai', 'seo', 'graphic', 'branding', 'video', 'mentorship'];
export const CREATIVE_FORM_KINDS = ['music', 'spoken-word', 'poetry', 'speaking'];
