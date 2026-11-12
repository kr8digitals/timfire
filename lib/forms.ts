import type { ServiceKey } from './services';

/**
 * Every service gets its own form.
 *
 * The shared fields (name, email, message) are deliberately few. Everything
 * else is specific to the job, so the first reply can be useful instead of
 * being another round of questions.
 */

export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'chips' | 'url';

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
  /** Full width in the two-column grid */
  wide?: boolean;
};

export type ServiceForm = {
  heading: string;
  intro: string;
  /** The submit button's own words */
  submit: string;
  fields: FormField[];
};

const budgetOptions = [
  'Under ₦150,000',
  '₦150,000 – ₦300,000',
  '₦300,000 – ₦600,000',
  '₦600,000 – ₦1,200,000',
  'Above ₦1,200,000',
  'I need guidance on budget',
];

const timingOptions = ['As soon as possible', 'Within a month', 'In one to three months', 'Just exploring for now'];

export const SERVICE_FORMS: Record<ServiceKey, ServiceForm> = {
  website: {
    heading: 'Tell me about the website',
    intro:
      'The more specific you are, the more useful my first reply will be. If you do not know the answers yet, say so — that is normal at this stage.',
    submit: 'Send the brief',
    fields: [
      {
        name: 'business',
        label: 'What is the business or project?',
        type: 'text',
        required: true,
        placeholder: 'e.g. a four-room guest house in Abakaliki',
        wide: true,
      },
      {
        name: 'outcome',
        label: 'What must the site make happen?',
        type: 'select',
        required: true,
        options: [
          'Get enquiries or messages',
          'Take bookings or reservations',
          'Take orders or payments',
          'Look credible to partners, funders or institutions',
          'Explain a complicated service clearly',
          'Publish content regularly',
          'Something else',
        ],
        help: 'The single most valuable thing a visitor could do.',
      },
      {
        name: 'pages',
        label: 'Roughly how many pages?',
        type: 'select',
        options: ['1 – 3', '4 – 6', '7 – 12', 'More than 12', 'Not sure yet'],
      },
      {
        name: 'content',
        label: 'What content do you already have?',
        type: 'chips',
        help: 'Select anything that applies.',
        options: ['Logo', 'Photographs', 'Written copy', 'Prices / menu', 'Nothing yet'],
        wide: true,
      },
      {
        name: 'budget',
        label: 'Budget range',
        type: 'select',
        options: budgetOptions,
      },
      {
        name: 'timing',
        label: 'When do you need it?',
        type: 'select',
        options: timingOptions,
      },
      {
        name: 'reference',
        label: 'A site you like, and why',
        type: 'text',
        placeholder: 'Optional — a link is fine',
        wide: true,
      },
    ],
  },

  redesign: {
    heading: 'Tell me about the current site',
    intro:
      'A redesign starts with understanding what the existing site gets right, so nothing worth keeping gets thrown away by accident.',
    submit: 'Request the review',
    fields: [
      { name: 'currentUrl', label: 'The current site address', type: 'url', required: true, placeholder: 'https://…', wide: true },
      {
        name: 'platform',
        label: 'What is it built on?',
        type: 'select',
        options: ['WordPress', 'Wix / Squarespace / Webflow', 'Shopify', 'Custom build', 'I do not know', 'Something else'],
      },
      {
        name: 'problem',
        label: 'What is wrong with it now?',
        type: 'chips',
        help: 'Select everything that applies.',
        options: [
          'Looks dated',
          'Slow on phones',
          'Hard to update',
          'Brings in no enquiries',
          'Content is out of date',
          'Breaks on mobile',
          'Hard to find on Google',
        ],
        wide: true,
      },
      {
        name: 'keep',
        label: 'Anything that must be kept?',
        type: 'textarea',
        placeholder: 'Design, a particular page, your search rankings, specific photography…',
        wide: true,
      },
      { name: 'budget', label: 'Budget range', type: 'select', options: budgetOptions },
      { name: 'timing', label: 'When do you need it?', type: 'select', options: timingOptions },
    ],
  },

  audit: {
    heading: 'Request a website audit',
    intro:
      'Send the address and I will review it across performance, clarity, mobile behaviour, search visibility, accessibility and whether enquiries can actually reach you.',
    submit: 'Request the audit',
    fields: [
      { name: 'currentUrl', label: 'The site to review', type: 'url', required: true, placeholder: 'https://…', wide: true },
      {
        name: 'suspicion',
        label: 'What made you want an audit?',
        type: 'chips',
        options: [
          'No enquiries coming in',
          'Slow on mobile',
          'Poor search visibility',
          'Recently redesigned and it got worse',
          'Planning a rebuild',
          'Someone else did SEO work and I want a second opinion',
        ],
        wide: true,
      },
      {
        name: 'access',
        label: 'Can you share read-only analytics access?',
        type: 'radio',
        options: ['Yes, if useful', 'No — public review only', 'Not sure what that means'],
        wide: true,
      },
      {
        name: 'notes',
        label: 'Anything specific you want looked at?',
        type: 'textarea',
        wide: true,
      },
    ],
  },

  ai: {
    heading: 'Describe the job for the agent',
    intro:
      'The best agents do a narrow job carefully. Tell me what people ask you repeatedly, or what you need handled without you.',
    submit: 'Send the brief',
    fields: [
      {
        name: 'channel',
        label: 'Where should it live?',
        type: 'select',
        required: true,
        options: ['Website chat', 'WhatsApp', 'Instagram or Facebook DMs', 'Internal tool for my team', 'Not sure — advise me'],
      },
      {
        name: 'job',
        label: 'What should it do?',
        type: 'chips',
        required: true,
        help: 'Select all that apply.',
        options: [
          'Answer common questions',
          'Qualify and collect enquiries',
          'Take bookings',
          'Route messages to the right person',
          'Draft content',
          'Research or summarise',
          'Internal scheduling',
        ],
        wide: true,
      },
      {
        name: 'knowledge',
        label: 'What information does it need to know?',
        type: 'textarea',
        placeholder: 'Prices, services, opening hours, policies, FAQs — everything it must answer from.',
        wide: true,
      },
      {
        name: 'refuse',
        label: 'What must it never do?',
        type: 'textarea',
        placeholder: 'Quote prices without approval, promise dates, give medical or legal advice, pretend to be human…',
        wide: true,
      },
      { name: 'budget', label: 'Budget range', type: 'select', options: budgetOptions },
      { name: 'timing', label: 'When do you need it?', type: 'select', options: timingOptions },
    ],
  },

  seo: {
    heading: 'Tell me what you want to be found for',
    intro:
      'Search work is only useful if it targets the things your customers actually type. Start with those.',
    submit: 'Request the plan',
    fields: [
      { name: 'currentUrl', label: 'The site', type: 'url', placeholder: 'https://… (or "no site yet")', wide: true },
      {
        name: 'searchTerms',
        label: 'What should people find you for?',
        type: 'text',
        placeholder: 'e.g. "guest house in Abakaliki", "STEM competition Nigeria"',
        wide: true,
      },
      {
        name: 'location',
        label: 'Where do your customers come from?',
        type: 'select',
        options: ['My city or region', 'Across Nigeria', 'Across Africa', 'Worldwide', 'A mix'],
      },
      {
        name: 'done',
        label: 'Has anyone done SEO work before?',
        type: 'radio',
        options: ['No', 'Yes, and it worked', 'Yes, and nothing changed', 'I am not sure'],
        wide: true,
      },
      {
        name: 'notes',
        label: 'Anything else?',
        type: 'textarea',
        wide: true,
      },
    ],
  },

  graphic: {
    heading: 'Tell me what the design is for',
    intro:
      'Social sets, event visuals, campaign graphics. The brief is usually three questions: what is it for, who sees it, and what should they do?',
    submit: 'Send the brief',
    fields: [
      {
        name: 'purpose',
        label: 'What is the design for?',
        type: 'select',
        required: true,
        options: [
          'Social media set',
          'Event or flyer',
          'Product or service launch',
          'Announcement carousel',
          'Print poster',
          'Something else',
        ],
      },
      {
        name: 'quantity',
        label: 'How many pieces?',
        type: 'select',
        options: ['1 – 3', '4 – 6', '7 – 12', 'A monthly retainer', 'Not sure yet'],
      },
      {
        name: 'platforms',
        label: 'Where will they appear?',
        type: 'chips',
        options: ['Instagram', 'Facebook', 'TikTok', 'WhatsApp status', 'X', 'Print', 'Website'],
        wide: true,
      },
      {
        name: 'brand',
        label: 'Do you have existing brand assets?',
        type: 'radio',
        options: ['Yes — logo, colours and fonts', 'Just a logo', 'Nothing yet'],
        wide: true,
      },
      {
        name: 'message',
        label: 'The main thing it must say',
        type: 'textarea',
        placeholder: 'The date, the offer, the call to action…',
        wide: true,
      },
      { name: 'timing', label: 'When do you need it?', type: 'select', options: timingOptions },
    ],
  },

  branding: {
    heading: 'Tell me about the business behind the brand',
    intro:
      'A brand is what people say about you when you are not in the room. To build one deliberately, I need to know who you are talking to.',
    submit: 'Start the branding brief',
    fields: [
      { name: 'business', label: 'The business or organisation', type: 'text', required: true, wide: true },
      {
        name: 'customers',
        label: 'Who is it for?',
        type: 'text',
        placeholder: 'Be specific — a person, not a demographic',
        wide: true,
      },
      {
        name: 'difference',
        label: 'Why do people choose you over the alternative?',
        type: 'textarea',
        required: true,
        wide: true,
      },
      {
        name: 'feeling',
        label: 'What should the brand feel like?',
        type: 'chips',
        options: ['Warm and human', 'Sharp and technical', 'Traditional and trusted', 'Bold and youthful', 'Calm and premium', 'Playful'],
        wide: true,
      },
      {
        name: 'existing',
        label: 'What exists already?',
        type: 'radio',
        options: ['A logo I like', 'A logo I have outgrown', 'Nothing — starting fresh'],
        wide: true,
      },
      { name: 'scope', label: 'What do you need?', type: 'select', options: ['Logo only', 'Logo and full identity system', 'Identity plus website', 'Identity, website and collateral', 'Not sure yet'] },
      { name: 'budget', label: 'Budget range', type: 'select', options: budgetOptions },
    ],
  },

  video: {
    heading: 'Tell me about the footage',
    intro:
      'Length, footage volume and the number of cuts change the job entirely — which is why this one is quoted per project rather than from a price list.',
    submit: 'Send the brief',
    fields: [
      {
        name: 'kind',
        label: 'What kind of edit?',
        type: 'select',
        required: true,
        options: ['Short-form reel or TikTok', 'Event film', 'Testimonial or interview', 'Promotional video', 'Long-form to shorts', 'Something else'],
      },
      {
        name: 'length',
        label: 'Target length',
        type: 'select',
        options: ['15 – 30 seconds', '30 – 60 seconds', '1 – 3 minutes', '3 – 10 minutes', 'Not sure'],
      },
      {
        name: 'footage',
        label: 'How much footage is there?',
        type: 'select',
        options: ['Under 30 minutes', '30 minutes – 2 hours', 'Half a day', 'Several days', 'Not shot yet'],
      },
      {
        name: 'have',
        label: 'What do you already have?',
        type: 'chips',
        options: ['Raw footage', 'Music licence', 'Logo files', 'Graphics or brand pack', 'Nothing — everything needed'],
        wide: true,
      },
      {
        name: 'notes',
        label: 'What does the video need to achieve?',
        type: 'textarea',
        wide: true,
      },
      { name: 'timing', label: 'When do you need it?', type: 'select', options: timingOptions },
    ],
  },

  mentorship: {
    heading: 'Book a session',
    intro:
      'Bring the real problem — the project you are stuck on, the code that will not work, the client message you cannot phrase. That is what these sessions are for.',
    submit: 'Request a session',
    fields: [
      {
        name: 'focus',
        label: 'What do you want to work on?',
        type: 'chips',
        required: true,
        options: [
          'Learning web development',
          'Getting my first freelance client',
          'Pricing and pitching work',
          'AI agents and automation',
          'Design to code',
          'Reviewing my portfolio',
          'A project I am stuck on',
        ],
        wide: true,
      },
      {
        name: 'level',
        label: 'Where are you now?',
        type: 'radio',
        options: [
          'Total beginner',
          'Finished tutorials, cannot build alone',
          'Building, but not getting clients',
          'Working, want to go deeper',
        ],
        wide: true,
      },
      {
        name: 'stuck',
        label: 'What is the specific thing you are stuck on?',
        type: 'textarea',
        required: true,
        placeholder: 'The more concrete, the more we get done in one session.',
        wide: true,
      },
      {
        name: 'schedule',
        label: 'When suits you?',
        type: 'select',
        options: ['Weekday evenings (WAT)', 'Weekday mornings (WAT)', 'Weekends', 'Flexible — suggest a time'],
      },
      {
        name: 'sessionCount',
        label: 'How many sessions are you considering?',
        type: 'select',
        options: ['Just one, to test', 'Three to six', 'Ongoing', 'Not sure'],
      },
    ],
  },
};

/** The general contact form, used only where there is genuinely no service to pick. */
export const CONTACT_FORM: ServiceForm = {
  heading: 'Send a message',
  intro: 'Not sure where your question fits? Send it here and I will point you in the right direction.',
  submit: 'Send message',
  fields: [
    {
      name: 'topic',
      label: 'What is it about?',
      type: 'select',
      required: true,
      options: [
        'A project I want to start',
        'A question about a service',
        'Mentorship',
        'Speaking or collaboration',
        'A problem with this website',
        'Something else',
      ],
    },
    {
      name: 'notes',
      label: 'The message',
      type: 'textarea',
      required: true,
      wide: true,
    },
  ],
};
