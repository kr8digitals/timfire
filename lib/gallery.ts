export type GalleryShot = {
  src: string;
  w: number;
  h: number;
  alt: string;
  caption: string;
  /** Journal slug of the post that tells the story behind this frame. */
  story?: string;
};

/**
 * The visual record, curated from the committed Drive photographs.
 * Order is editorial: portraits give way to stage and studio frames, then
 * culture, community and street light. Near-duplicate frames of the same
 * classroom moment (22-classroom, 25-classroom) are deliberately left out —
 * 25-dreams is the sharpest of the three and carries the moment here.
 * No image is cropped by this layout: every frame keeps its own aspect.
 */
export const GALLERY: GalleryShot[] = [
  { src: '/images/gallery/01-orange-suit.webp', w: 1000, h: 1250, alt: 'TIMFIRE smiling in the burnt-orange jacket and white shirt', caption: 'Burnt orange, full light — the jacket the whole site wears.' },
  { src: '/images/gallery/09-stage.webp', w: 1400, h: 900, alt: 'TIMFIRE holding a microphone on a decorated event stage', caption: 'Live on stage, mic in hand — spoken word at a community event.' },
  { src: '/images/gallery/18-workspace.webp', w: 900, h: 1350, alt: 'TIMFIRE seated on a stool in a purple-lit edit suite surrounded by monitors', caption: 'The edit suite: six screens, one decision.' },
  { src: '/images/gallery/05-cream.webp', w: 1000, h: 1300, alt: 'TIMFIRE in a cream shirt and brown trousers', caption: 'Cream shirt, brown trousers — the uniform of a working week.' },
  { src: '/images/gallery/27-culture.webp', w: 900, h: 1250, alt: 'TIMFIRE in white traditional attire with coral beads and a beaded crown, raising one fist', caption: 'Culture day: coral beads and a raised fist.' },
  { src: '/images/gallery/10-candle.webp', w: 1000, h: 1250, alt: 'TIMFIRE with a candle-lit page of writing', caption: 'Candlelight and a page: the poetry frame.' },
  { src: '/images/gallery/24-glass.webp', w: 1200, h: 900, alt: 'TIMFIRE grinning in front of a glass shopfront at golden hour', caption: 'Golden hour against the glass front.' },
  { src: '/images/gallery/08-music.webp', w: 1000, h: 1250, alt: 'TIMFIRE standing in a recording studio beneath a neon MUSIC sign, between a microphone and a mixing desk', caption: 'Under the MUSIC sign: studio session, mic waiting.' },
  { src: '/images/gallery/14-street.webp', w: 900, h: 1300, alt: 'TIMFIRE on a street in evening light', caption: 'Street light on an Abakaliki evening.' },
  { src: '/images/gallery/25-dreams.webp', w: 1000, h: 1000, alt: 'Classroom selfie: TIMFIRE in a blue striped shirt with two classmates seated behind wooden desks', caption: 'Classroom selfie with the tribe — teaching day, dreams included.' },
  { src: '/images/gallery/04-white-suit.webp', w: 900, h: 1350, alt: 'TIMFIRE standing in a white suit', caption: 'White suit, straight back. Shoot day.' },
  { src: '/images/gallery/12-jump.webp', w: 900, h: 1350, alt: 'TIMFIRE caught mid-jump', caption: 'The jump shot. Some ideas arrive at full height.' },
  { src: '/images/gallery/19-face-studio.webp', w: 1000, h: 1000, alt: 'Close studio portrait of TIMFIRE', caption: 'Close-up: the face behind the builds.' },
  { src: '/images/gallery/16-traditional.webp', w: 800, h: 1350, alt: 'TIMFIRE in traditional attire', caption: 'Traditional frame from culture day.' },
  { src: '/images/gallery/21-window.webp', w: 900, h: 1300, alt: 'TIMFIRE lit by window light', caption: 'Window light study.' },
  { src: '/images/gallery/06-black-suit.webp', w: 900, h: 1350, alt: 'TIMFIRE in a black suit', caption: 'The black suit frame, for the formal pages.' },
  { src: '/images/gallery/07-white-shirt.webp', w: 1000, h: 1250, alt: 'TIMFIRE in an open-collar white shirt', caption: 'White shirt, open collar, no agenda.' },
  { src: '/images/gallery/15-church.webp', w: 1000, h: 1300, alt: 'TIMFIRE at a church hall gathering', caption: 'A community morning in the church hall.' },
  { src: '/images/gallery/26-seated.webp', w: 1000, h: 1200, alt: 'TIMFIRE seated and composed', caption: 'Seated, waiting on nobody.' },
  { src: '/images/gallery/03-stool.webp', w: 1000, h: 1250, alt: 'TIMFIRE sitting on a stool during a portrait session', caption: 'On the stool: the pause between takes.' },
  { src: '/images/gallery/11-speak.webp', w: 1000, h: 1250, alt: 'TIMFIRE speaking and gesturing with his hands', caption: 'Mid-sentence. The hands go first when I speak.' },
  { src: '/images/gallery/20-hallway.webp', w: 1000, h: 1000, alt: 'TIMFIRE standing in a hallway', caption: 'Hallway light, between rooms.' },
  { src: '/images/gallery/17-graduation.webp', w: 1000, h: 1300, alt: 'TIMFIRE in graduation gown', caption: 'Graduation day, gown and all.' },
  { src: '/images/gallery/23-street-white.webp', w: 800, h: 1300, alt: 'TIMFIRE in white on the street', caption: 'Street frame in white.' },
  { src: '/images/gallery/02-green-chair.webp', w: 1000, h: 1250, alt: 'TIMFIRE seated in a green chair', caption: 'Green chair, quiet room. A portrait between builds.' },
  { src: '/images/gallery/28-shirt-portrait.webp', w: 1000, h: 1300, alt: 'Soft-lit shirt portrait of TIMFIRE', caption: 'Soft light, shirt portrait.' },
  { src: '/images/gallery/13-white-pray.webp', w: 1000, h: 1250, alt: 'TIMFIRE in white with hands folded', caption: 'White, hands folded — the quiet frame of the session.' },
  // The Facebook archive frames (Dec 2023 – Jul 2026). Every one of these
  // carries a story: the journal post it was published with.
  { src: '/images/archive/queen-couple.webp', w: 640, h: 1337, alt: 'TIMFIRE in a beaded crown and white attire standing beside his queen in a tiara and coral beads', caption: '13 December 2023 — the frame the first poem went out with.', story: 'hes-got-a-queen' },
  { src: '/images/archive/queen-solo.webp', w: 480, h: 1010, alt: 'The queen alone in a tiara, coral beads and a lion-print wrapper, smiling', caption: 'The queen the first poem was written for.', story: 'hes-got-a-queen' },
  { src: '/images/archive/king-solo.webp', w: 640, h: 1337, alt: 'TIMFIRE in white traditional attire and a beaded crown, raising one fist and grinning', caption: 'If not mistaken, is he a king?', story: 'hes-got-a-queen' },
  { src: '/images/archive/worship-stage.webp', w: 900, h: 600, alt: 'TIMFIRE singing into a microphone with one hand raised before a crowd holding up phone lights', caption: 'A sea of phone lights — the night the storm was a mirage.', story: 'the-storm-is-a-mirage' },
  { src: '/images/archive/science-hero-statue.webp', w: 843, h: 843, alt: 'A bronze statue of Dr Iziogo Thomas raised on a plinth before a cheering crowd', caption: 'The science hero, cast in bronze — my father, Dr Iziogo Thomas.', story: 'celebrate-the-science-hero' },
  { src: '/images/archive/science-hero-cheer.webp', w: 843, h: 843, alt: 'Dr Iziogo Thomas in a white coat raising one hand while colleagues in white coats applaud', caption: 'A ward applauding the hands that never tired.', story: 'celebrate-the-science-hero' },
  { src: '/images/archive/redefiner-teal.webp', w: 843, h: 937, alt: 'The Redefiner in a teal patterned dress, arms crossed, outdoors', caption: 'The Redefiner — 21 days that birthed KR8 Digitals.', story: 'she-gave-me-50b' },
  { src: '/images/archive/bread.webp', w: 843, h: 1765, alt: 'A colleague handing TIMFIRE a paper bag with the promised bread inside', caption: 'The joke that became a premium bread.', story: 'she-bought-a-bread-for-me' },
  { src: '/images/archive/its-time-2.webp', w: 612, h: 816, alt: 'TIMFIRE in a white shirt against a stone wall with both hands raised', caption: 'Both hands up: it. is. time.', story: 'i-think-its-time' },
  { src: '/images/archive/in-love.webp', w: 843, h: 1124, alt: 'TIMFIRE in white walking beside a woman in an ankara dress, both carrying bags', caption: 'Still sunset. Still honey. Still beautiful.', story: 'so-guys-i-fell-in-love' },
  { src: '/images/archive/keyboard.webp', w: 819, h: 1024, alt: 'TIMFIRE in a “Create Well” t-shirt playing a keyboard outdoors on a hillside', caption: 'Create Well tee, hillside keyboard — music makes no sense alone.', story: 'music-makes-no-sense' },
  { src: '/images/archive/unaware-rain.webp', w: 704, h: 1472, alt: 'A man standing in the rain at dusk with both arms spread wide', caption: 'Arms open in the rain — the silent influencer.', story: 'hes-not-even-aware' },
  { src: '/images/archive/screenshot-story.webp', w: 843, h: 1052, alt: 'TIMFIRE seated and smiling in beige traditional wear beside a phone screen showing the scholarship space', caption: 'The screenshot that survived Nigerian network.', story: 'the-screenshot-story' },
  { src: '/images/archive/who-am-i-2.webp', w: 843, h: 1124, alt: 'Close selfie of TIMFIRE in the shop with eyes closed, thinking', caption: 'Eyes shut, question open: who am I?', story: 'who-am-i' },
];
