export type GalleryShot = {
  src: string;
  w: number;
  h: number;
  alt: string;
  caption: string;
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
];
