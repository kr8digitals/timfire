import type { Article } from './content';

/**
 * The Facebook archive pieces (Dec 2023 – Jul 2026), published with the owner's
 * approval of 16 Nov 2026.
 *
 * Fidelity is per piece, as agreed with the owner:
 *  - the first poem and the masterpieces are word-for-word, hashtags and all;
 *  - unintentional slips (double spaces, "proponed", "reals", "manover") are
 *    lightly tidied without touching the voice;
 *  - the export's trailing timestamp line is an artefact and is never content.
 *
 * Every photograph referenced here is the frame the post actually went out
 * with, converted to WebP under /images/archive (see public/images/INDEX.md).
 */
export const ARCHIVE_JOURNAL: Article[] = [
  {
    id: 'a-queen',
    title: "He's got a queen",
    slug: 'hes-got-a-queen',
    category: 'Poetry',
    tags: ['Poetry', 'First words', 'Love'],
    summary: 'The first poem I ever wrote. Posted with five photographs of us in coral and crowns.',
    body: `He's got a queen
 Beautiful and keen
 Supreme at heart...
 Aren't they torn far apart?
 By him is a queen
 If not mistaken, is he a king?

 Look in their eyes
 Just as green as grass
 Wet behind the ears
 They are born yesterday
 Their love at gullible size

 Behold not on each other's face?
 The smiles that each cheek makes
 Melts the bone of May
 That each lay

 Look! He's got a queen
 In the land of distancing
 O'hail their beautic sight
 Or the innocent souls will sing and sting
 For ice spring is king

 Written by:
 K.U.T.I. Timfire
 (Iziogo Kenneth Timothy Adore).`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/queen-lead.webp',
    imageWidth: 640, imageHeight: 1337,
    imageAlt: 'TIMFIRE in white traditional attire and a beaded crown, grinning back-to-back with his queen, who wears a tiara, coral beads and a lion-print wrapper',
    origin: 'My first poem ever — first posted on my Facebook wall, 13 December 2023, with the five photographs it was written beside.',
  },
  {
    id: 'a-musician',
    title: 'They get disappointed when I say I want to be a musician',
    slug: 'they-get-disappointed',
    category: 'Spoken word',
    tags: ['Sounds and music', 'Spoken word', 'Purpose'],
    summary: '“Timothy, you’re too intelligent for this.” My patients aren’t in hospitals — they’re souls waiting for the sounds I will create.',
    body: `💭 They get disappointed when I say I want to be a musician.
 To them, it’s not a dream—it’s foolishness.

 At times, they whisper and lecture:
 “Timothy, you’re too intelligent for this.
 You should have worn a lab coat,
 not carried a guitar strap.
 Science is serious, music is a waste.”

 But they don’t hear me out.
 Because my purpose isn’t a textbook—
 it’s the heartbeat of a nation.
 My patients aren’t in hospitals,
 they’re souls waiting for the sounds I will create.
 My melodies are the medicine,
 my rhythm is the prescription.

 It’s hard to live under expectations
 I never asked to carry…
 To chase admiration
 from a generation that fears imagination.
 They see vision as rebellion,
 consistency as punishment.

 But I keep pacing, meditating,
 turning every doubt into fuel.

 I don’t want riches or fleeting applause.
 Not the cars, not the city lights,
 not the fame that fades overnight.

 I want to be great because
 God gave me a sound too big to stay silent.

 Yes—I feel misunderstood.
 Yes—I feel not good.
 But melody is my neighborhood,
 purpose is my passport,
 and destiny is my destination.

 So let them laugh.
 Let them call me foolish.
 I will not trade my calling for their approval.

 Even in rejection—
 my vision remains unshaken.
 And I will sing until the world finally listens. 🎶🔥

 👉 What’s one misconception people have about your field?
 #30DaysConsistencyDrillWithDavidChibuike
 #timfire
 #growthmindset`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/rehearsal-still.webp',
    imageWidth: 300, imageHeight: 640,
    imageAlt: 'TIMFIRE looking up at a microphone hanging from the ceiling during rehearsal',
    origin: 'First posted on my Facebook wall, 4 September 2025, as a spoken-word video.',
    videoExternal: 'https://www.tiktok.com/@kutimfire/video/7644259695053589778',
    videoPoster: '/images/archive/rehearsal-still.webp',
    videoCaption: 'Hear me sing it — the poem, out loud on my TikTok',
  },
  {
    id: 'a-storm',
    title: 'The storm is a mirage',
    slug: 'the-storm-is-a-mirage',
    category: 'Essay',
    tags: ['Penlight', 'Faith', 'Mindset'],
    summary: 'I’m not denying your pain. I’m exposing your perception. The storm is a mirror with thunder.',
    body: `The storm is a mirage.
 And no, I'm not denying your pain. I'm exposing your perception.

 We treat storms like they're sent to destroy us. But what if they're sent to disclose us? The wind doesn't create the weakness, it reveals where the foundation was already cracked. The flood doesn't drown the strong. It drowns what was pretending to be strong. The storm is a mirror with thunder.

 "Peace, be still" [Mark 4:39]-we think Jesus calmed the chaos for the disciples. But the Greek? Phimōthēti -"be muzzled." He didn't negotiate with nature. He silenced a liar. Because the storm wasn't just weather. It was a voice screaming "You're finished." And Jesus? He muzzled the mouthpiece.

 Here's the angle nobody talks about: you don't still the storm by fighting it. You still it by outgrowing its definition of you. The storm says you're small. You agree, and it rages louder. But when you remember who spoke you into existence, the storm becomes background noise to a deeper frequency.

 Peter walked on water until he re-interpreted the wind [Matthew 14:30]. The storm didn't change. His agreement did. He let the mirage become the master.

 So how do you still your storm?
 Stop begging the sky to change. Change your altitude. Rise in the Spirit until the storm that swallowed you from below looks like vapor from above. The same clouds that blocked your sun become the floor you stand on.
 The storm isn't your enemy. Your agreement with it is.

 Stillness isn't the absence of waves. It's the presence of One who sleeps through them.

 #30DaysPenlightCreativeWriters
 #PenlightCreativeWriters`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/worship-stage.webp',
    imageWidth: 900, imageHeight: 600,
    imageAlt: 'TIMFIRE singing into a microphone with one hand raised before a crowd holding up phone lights',
    origin: 'First posted on my Facebook wall, 3 May 2026, for the Penlight creative writers’ challenge.',
  },
  {
    id: 'a-jesus',
    title: 'Jesus is never coming back',
    slug: 'jesus-is-never-coming-back',
    category: 'Essay',
    tags: ['Penlight', 'Faith'],
    summary: 'There. I said it. Scroll past if you’re offended, or lean in if you’re brave. Because here’s what we easily forget: He never left.',
    body: `Jesus is never coming back.

 There. I said it. Scroll past if you're offended, or lean in if you're brave.

 Because here's what we easily forget: He never left.
 "Lo, I am with you always, even to the end of the age" [Matthew 28:20]. Not until I return. Always. The ascension wasn't an exit, it was an expansion. Heaven didn't contain Him; it released Him into everywhere.

 We keep waiting for a future Jesus while ignoring the present One. We scan the skies for lightning when He's already the thunder in our chests. "The kingdom of God is within you" [Luke 17:21]—not approaching. Arrived.

 So what is "coming again"?
 Not a better version. Not a fixed version. A revealed version. Like dawn doesn't create the sun, it just exposes what was there all along. "Every eye will see Him" [Revelation 1:7] because the veil finally drops, not because He starts existing.

 Your desperation for His return might actually be amnesia about His presence.
 Stop waiting for the Guest to arrive. Realize that He's the Host and He never left the table.

 Here's the real truth, Jesus is coming again in a way we've never seen, in a day we'll never know. What if it's now? Accept the Jesus that's present and stop worrying of the Jesus to come because He's still the one.
 #30DaysPenlightCreativeWriters
 #PenlightCreativeWriters`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/soot.webp',
    imageWidth: 843, imageHeight: 1043,
    imageAlt: 'A man in a red shirt covered in soot, standing in a burnt-out room',
    origin: 'First posted on my Facebook wall, 19 April 2026, for the Penlight creative writers’ challenge.',
  },
  {
    id: 'a-dissatisfaction',
    title: "I'm Grateful For My Dissatisfaction",
    slug: 'grateful-for-my-dissatisfaction',
    category: 'Essay',
    tags: ['Penlight', 'Gratitude', 'Mindset'],
    summary: 'Cancel me if you want, but hear me out first. Thanking the Chef while still hungry doesn’t mean the meal was enough. It means you trust the kitchen.',
    body: `I'm Grateful For My Dissatisfaction.
 Cancel me if you want, but hear me out first.

 We've turned gratitude into something outside its original picture. Count your blessings. Be content. Don't want "too much." As if desire is ingratitude and ambition is sin. We've spiritualized stagnation and called it peace.

 But what if your dissatisfaction is not the absence of gratitude, but the evidence of it?
 Think: You don't hunger for what you've never tasted. You don't ache for home if you've never had one. Your restlessness is memory. Your spirit remembers Eden. Your bones remember pre-fall. And everything "good enough" in this life is a cheap forgery of what you were actually made for.

 Paul said "I have learned in whatever state I am, to be content" [Philippians 4:11]. But this same Paul also said "I press toward the goal" [Philippians 3:14]. Content in the present. Dissatisfied with the permanent. He wasn't grateful for less. He was grateful while wanting more.

 Gratitude isn't denial of lack. It's acknowledgment of source in the middle of lack. Thanking the Chef while still hungry doesn't mean the meal was enough. It means you trust the kitchen.

 Your dissatisfaction with your marriage? It might mean you actually believe in covenant. Your dissatisfaction with your church? It might mean you actually believe in Body. Your dissatisfaction with yourself? It might mean the new creation is already groaning to get out.

 So I'm grateful for the ache. Grateful for the itch. Grateful for the "not yet" that keeps me from making a god of the "already."
 Because the day I'm fully satisfied here is the day I've forgotten where Home is.

 Gratitude says "thank You for what is." Dissatisfaction says "I know there's more." Both are prayers.

 #30DaysPenlightCreativeWriters
 #PenlightCreativeWriters`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/pulpit.webp',
    imageWidth: 843, imageHeight: 1124,
    imageAlt: 'A church hall interior with a minister at the pulpit and worshippers in white',
    origin: 'First posted on my Facebook wall, 5 May 2026, for the Penlight creative writers’ challenge.',
  },
  {
    id: 'a-science-hero',
    title: 'CELEBRATE THE SCIENCE HERO',
    slug: 'celebrate-the-science-hero',
    category: 'Good Report',
    tags: ['Good Report', 'Family', 'Gratitude'],
    summary: 'He is the CMD of Chitom Rapha Hospital & Maternity — and he is my father. Today is his birthday.',
    body: `CELEBRATE THE SCIENCE HERO

 💙 THE GOOD REPORT

 Today I celebrate a man who wrote his name in the sand of time — quietly, patiently, impossibly kind.

 His name is the reason a thousand mothers slept with peace. His hands are the reason many children took their first breath. He is the CMD of Chitom Rapha Hospital & Maternity — and he is my father.

 He was once a little boy with a wrong injection that left his leg crippled.
 That wound could have ended a story — instead, it started one. He chose to become the very kind of doctor who would never repeat that mistake.

 He vowed that no child, no mother, no family would ever suffer that way again.
 So he stayed.
 While doors to comfort and foreign shores opened, he refused them.

 He built clinics where most doctors won’t go — in rural places where life and death meet in the dark hours. He sleeps in hospitals for days because a life on his watch is worth every lost hour of rest. He’ll perform three C-sections, then another surgery for an abdominal mass — and still stand at the bedside with prayers on his lips.

 He sells his comfort to save lives.
 He chooses humanity over headlines.
 He treats the humble and the high-born with the same steady hands and same steady heart.

 He is more than a surgeon. He is a teacher who corrects with love, a preacher who quotes Scripture between procedures, and a lawyer-by-nature whose counsel steadies us when the world screams. There were times we had little storms at home — and he handled them the only way he knows how: with patient wisdom, a calm voice, and a father’s conviction.

 I’ve watched him refuse the easy path, choose the hard work, and keep walking it for years.

 Today is his birthday.
 So here’s what I want the world to know:
 👉 Your sacrifices are seen.
 👉 Your sleepless nights did not go unnoticed.
 👉 Your hands have written stories of hope where there was only fear.
 👉 Your life has been a sermon in action.

 Dad — you taught me courage by example. You taught me mercy by practice. You taught me service by living it. I know you don’t like fuss. I know tears are rare. But if this message steals even a single tear from you today, let it be the kind that says: you were worth everything you gave.

 Friends — if a man like this has touched your life, show it.
 Drop a message below. Share this post. Send him a birthday prayer. Tell him thank you for choosing people over comfort, for staying when leaving would be easier, for healing when healing cost him rest.

 🎂 Happy Birthday, Sir.
 May your days be long. May your hands never tire. May the lives you’ve saved shout your name in gratitude for generations.
 🔁 Share this to honor a life that chooses others every day.

 💬 Leave a message for my father below — let him know he’s loved, seen, and remembered.
 #30DaysConsistencyDrillWithDavidChibuike #Day16
 #TheGoodReport #Day11 #HappyBirthday #ChitomRapha #HeroInSilence #Timfire #HumanityFirst #ThankYouDoctor #LegacyOfCare

 © Timfire.`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/science-hero-desk.webp',
    imageWidth: 843, imageHeight: 843,
    imageAlt: 'Dr Iziogo Thomas in a white coat beside his desk, beneath a framed portrait of himself',
    origin: 'First posted on my Facebook wall, 11 November 2025 — Good Report, Day 11.',
  },
  {
    id: 'a-redefiner',
    title: 'SHE GAVE ME $50B AND STILL CALLS EVERY DAY TO SAY HI',
    slug: 'she-gave-me-50b',
    category: 'Good Report',
    tags: ['Good Report', 'Mentorship', 'KR8 DIGITALS'],
    summary: 'Not in dollars and coins, but in value. She gave me 21 days of back-to-back mentorship; no conditions, no charges, no fine print.',
    body: `SHE GAVE ME $50B AND STILL CALLS EVERY DAY TO SAY HI.

 DAY 16 GOOD REPORT

 I know what you’re thinking… $50 billion? Impossible.
 But it happened.
 Not in dollars and coins, but in value.
 And to me, that’s worth more than money could ever buy.

 I met her when life had lost its meaning.
 Dreams that once burned bright were turning to smoke,
 and giving up started sounding like the perfect option.
 Then she showed up: The Redefiner.
 From our very first conversation, something shifted.

 She gave me 21 days of back-to-back mentorship; no conditions, no charges, no fine print.
 For 21 days, she poured into me like someone who’d been sent from heaven with my name on her mission list.

 When the newsletter ended, I thought that was it.
 But she didn’t stop there.
 She still calls, almost every day:
 “Timfire, are you still showing up?”
 “Are you still being consistent?”
 “Are you still becoming?”

 Every call, every correction, every reminder felt like fuel in my system.
 She didn’t just mentor me, she REDEFINED me.

 She believed in me before I did.
 She saw a brand where I only saw an idea.
 She gave birth to KR8 Digitals, the digital brand that’s now shaping my future and empowering others to do the same.

 Because of her, I’m no longer guessing my path, I’m walking it with confidence.
 Because of her, I learned that consistency without clarity is confusion.
 Because of her, I stopped trying to impress the world and started investing in who I’m becoming.

 I call her The Redefiner because she’s exactly that. She’ll find you drowning in uncertainty and teach you how to swim in purpose.

 If you’ve ever wanted someone to hold your hand through the fog, to speak life into your dreams, to help you build structure around your calling;
 you need to meet her.

 I’m not exaggerating. One encounter with her can literally redefine your entire existence.
 The world needs more people like her
 but for now, I’m grateful the world gave her to me.

 Check the comment section to connect with The Redefiner.
 And trust me if you’re ready for change, she’ll make it happen.

 Who has redefined your life?
 Tag them below and let them know their impact still speaks.

 #30DaysConsistencyDrillWithDavidChibuike #Day17 #TheGoodReport #Day13 #Timfire #TheRedefiner #KR8Digitals #MentorshipMatters #PurposeBuilder #LifeRedefined #GratitudeStory

 © Timfire.`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/redefiner-bw.webp',
    imageWidth: 754, imageHeight: 960,
    imageAlt: 'Black-and-white portrait of The Redefiner in a dark dress, standing beside a car',
    origin: 'First posted on my Facebook wall, 13 November 2025 — Good Report, Day 13.',
  },
  {
    id: 'a-bread',
    title: 'SHE BOUGHT A BREAD FOR ME 🥹🫂💘 WHY? 🤷‍♂️',
    slug: 'she-bought-a-bread-for-me',
    category: 'Good Report',
    tags: ['Good Report', 'Kindness'],
    summary: '“Where’s the bread you bought for me?” began as my daily joke. Fast forward to today… she actually bought a bread.',
    body: `SHE BOUGHT A BREAD FOR ME 🥹🫂💘 WHY? 🤷‍♂️

 Do you know where I met her? At my workplace.

 She was newly employed, and the moment I saw her, I went straight up to give her a warm welcome.
 I gisted with her — made her laugh, smile, and blush.

 Honestly, no one could even tell she was new because I had already talked off that newbie shyness and given her a reason to feel at home.

 One of the questions I jokingly asked her was,
 “Where’s the bread you bought for me?”
 She laughed and said she hadn’t bought any — but promised she would. She even crossed her heart. 💖

 To me, it was just a joke…
 But I never knew she really meant it.
 That question — “Where’s my bread?” — became my daily greeting.

 First thing in the morning or anytime I saw her, I’d say it.
 And every time, she’d laugh, smile deeply, and I could tell I was making someone’s day.

 Fast forward to today… she actually bought a bread.
 And not just any bread — an expensive, premium bread! 😅

 Since I live within the hospital environment, she brought it while coming to work.

 For the first time, I didn’t ask for bread — I just gave her a strong smile.
 Then she said, “You must be forgetting something…”
 and handed me a beautiful bag.

 I was speechless. I didn’t even want to collect it —
 but she wouldn’t let me refuse either.

 And right there, I learned something again…
 👉 How you make people feel truly matters.

 This is just one of many times I’ve received gifts simply because of small acts of kindness — making others feel seen, valued, and cherished.

 So here’s to you reading this:

 Spread life. Spread laughter. Spread joy everywhere you go.

 Be the reason someone smiles today —
 and watch what happens to you. 🌻

 #30DaysConsistencyDrillWithDavidChibuike #Day13 #KindnessStories #HumanConnection #SpreadLove #RealMoments #JoyInLittleThings #TimfireMoments #EmotiveStory

 © Timfire`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/bread.webp',
    imageWidth: 843, imageHeight: 1765,
    imageAlt: 'A colleague handing TIMFIRE a paper bag with the promised bread inside',
    origin: 'First posted on my Facebook wall, 8 November 2025 — Good Report, Day 13.',
  },
  {
    id: 'a-who-am-i',
    title: 'A Muslim asked me “who are you?” — and I had no answer',
    slug: 'who-am-i',
    category: 'Poetry',
    tags: ['Poetry', 'Identity', 'Faith'],
    summary: 'On the 26th of September, 2024, a Muslim asked me “who are you?”. Trust me if I say I didn’t know what to answer.',
    body: `On the 26th of September, 2024, a Muslim asked me "who are you?". Trust me if I say I didn't know what to answer. Everyone would expect me to say my name and add a little bit of what I do but, there's more to my personality; there's me without a clue. I managed to maneuver the question but remained restless henceforth.

 The question that hunted me years back
 Is back:
 "Who am I ?"
 But this time,
 There's a soul before my eyes 👀.

 In the evening I went through series of reels
 That gave me a glimpse of what's not real
 I couldn't control what I feel
 So without sleeping, I began to dream...

 There's more to me than me
 There's more than just the things I see
 There's more than just beliefs
 I have always believed
 But, why's my life like this?

 "Out of the mundane
 To where I'm ordained
 For things that were made
 Were made from things unseen
 There are realms of glory
 For my world to see
 Dimensions found only
 In Jesus Christ the son

 Channels of my spirit
 Open up"

 That song by Dunsin Oyekan
 Gave me answers more than I can
 I noticed that I am who I am
 Because of who I was and
 I will be who I want
 To be in the future afar
 Because of who now I am.

 #appreciatinggodforwhoiam`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/who-am-i-1.webp',
    imageWidth: 843, imageHeight: 1124,
    imageAlt: 'Close selfie of TIMFIRE in the shop, thinking, shelves of stock behind him',
    origin: 'First posted on my Facebook wall, 29 September 2024.',
    videoExternal: 'https://www.facebook.com/share/1EHJ272qmK/',
    videoPoster: '/images/archive/talk-still.webp',
    videoCaption: 'The #Timfire answer, filmed the same evening — on my Facebook wall',
  },
  {
    id: 'a-its-time',
    title: 'I think it’s time',
    slug: 'i-think-its-time',
    category: 'Spoken word',
    tags: ['Spoken word', 'Faith'],
    summary: 'Time to raise the dead — not just in tombs, but in hearts that have stopped believing. It. Is. Time.',
    body: `I think it’s time.
 Time to raise the dead — not just in tombs,
 but in hearts that have stopped believing,
 dreams that have stopped breathing,
 visions that lie buried under the rubble of fear.

 I think it’s time.
 Time to heal the sick —
 not only in bodies,
 but in minds tormented,
 in souls weary,
 in hope that’s running on empty.

 I think it’s time.
 Time to walk on seas —
 to step where logic says, “You will drown,”
 but faith whispers, “Keep your eyes on Me.”
 To tread on storms and call them peace,
 to turn every wave into a pathway of testimony.

 I think it’s time.
 Time to move mountains —
 not by might, not by power,
 but by the Spirit who speaks and they obey.
 Mountains of doubt,
 mountains of shame,
 mountains of impossibility—
 you have no place here.

 So, hear me world—
 this is not a rehearsal, this is the hour.
 The kingdom is not waiting for tomorrow;
 heaven’s clock strikes now.
 Signs will follow those who believe,
 miracles will break out where faith is planted.
 I don’t know if you believe it or not,
 but one thing is sure—
 It. Is. Time.

 Hello, world. Watch faith rise.
 #30DaysConsistencyDrillWithDavidChibuike
 #day14
 #timfire
 #growthmindset`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/its-time-1.webp',
    imageWidth: 612, imageHeight: 816,
    imageAlt: 'TIMFIRE in a white shirt leaning against a stone wall, one hand raised in greeting',
    origin: 'First posted on my Facebook wall, 14 September 2025.',
  },
  {
    id: 'a-fell-in-love',
    title: 'So guys, I fell in love a few days ago',
    slug: 'so-guys-i-fell-in-love',
    category: 'Essay',
    tags: ['Penlight', 'Love', 'Faith'],
    summary: 'She walked in like sunset decided to take human form. Then I woke up. Not from sleep. From me.',
    body: `So guys, I fell in love a few days ago.
 Swear. It was cinematic. The kind of love that makes poets unemployed. She walked in like sunset decided to take human form: golden, slow, unfair to everyone else in the room. Her laugh? Like someone shook a jar of honey and let it spill wherever it wanted. Her eyes? Two continents I suddenly had citizenship in. I wrote her name in my journal. I practiced our initials together. I almost posted her hand. Almost.

 Then I woke up.
 Not from sleep. From me.
 Because here's what nobody tells you about mirages: they're real. The light is real. The heat is real. The thirst that creates them? Devastatingly real. I didn't hallucinate her. I projected her. Every quality I lack, I found in her. Every void I haven't filled, she seemed to fit. I wasn't falling in love. I was falling into myself—and using her as the landing.
 The "love story" was a mirror with better lighting.

 We do this with people, with purpose, with God. We chase the shimmer because the desert of our own incompleteness is too honest to sit in. But mirages don't quench. They tease. They keep you walking past the real oasis because the fake one sparkles harder.

 So I didn't fall out of love. I fell through it. And on the other side? Not her. Him. The One who doesn't mirror my void but fills it. Who doesn't sparkle to attract my thirst but becomes the water. "Let him who is thirsty come" [Revelation 22:17]—not to another mirage. To the Source that mirages were always pointing to.

 My love story wasn't a lie. It was a detour with a destination.
 And her? Still sunset. Still honey. Still beautiful. Just not my salvation.
 #30DaysPenlightCreativeWriters
 #PenlightCreativeWriters`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/in-love.webp',
    imageWidth: 843, imageHeight: 1124,
    imageAlt: 'TIMFIRE in white walking beside a woman in an ankara dress, both carrying bags',
    origin: 'First posted on my Facebook wall, 4 May 2026, for the Penlight creative writers’ challenge.',
  },
  {
    id: 'a-screenshot',
    title: 'Let me tell you a story about that screenshot',
    slug: 'the-screenshot-story',
    category: 'Story',
    tags: ['KR8 DIGITALS', 'Teaching', 'Mindset'],
    summary: 'Everything was set for class. Then Nigerian network struck. I even entered bush oo 🤣 in search of network.',
    body: `Let me tell you a story about that screenshot.
 A day ago we had our onboarding for our digital skills scholarship and hundreds of people got access before the deadline (1 day only 😫)

 Everything was set for classes; the videos, the notes, the reference, everything. But when it was time for class last night, Nigerian network struck. In fact, NEPA is now an angel to me 🤧 even though they've not brought light for two months now 🙆

 All my plans were shattered. Hungry students were active on the call but me that started the call was kicked out by network as if I was a stranger 😤

 I even entered bush oo 🤣 in search of network.
 And just about when the class was already ruined, I postponed the class, and was raging in anger 😡🤬

 I took a deep breath. That was when I realised that things we don't expect are the things that make us a better person.

 I'm still angry at network oo 🧏😂
 But I've just learned to live with it and find a way around it.

 #kr8digitals #mindsetshift #tech`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/screenshot-story.webp',
    imageWidth: 843, imageHeight: 1052,
    imageAlt: 'TIMFIRE seated and smiling in beige traditional wear beside a phone screen showing the scholarship space',
    origin: 'First posted on my Facebook wall, 22 July 2026.',
  },
  {
    id: 'a-music-hand',
    title: 'MUSIC MAKES NO SENSE… If There’s No One Holding Your Hand',
    slug: 'music-makes-no-sense',
    category: 'Good Report',
    tags: ['Good Report', 'Sounds and music', 'Mentorship'],
    summary: 'Music is the deepest mystery on earth. Today’s Good Report is for someone who kept me holding onto a dream that often feels invisible: Graciewells.',
    body: `🎵 MUSIC MAKES NO SENSE…If There’s No One Holding Your Hand

 GOOD REPORT DAY 16

 I grew up choosing a dream bigger than me…
 A dream that breaks you, shapes you, stretches you, and sometimes almost finishes you -- Music.

 People love music.
 People applaud music makers.
 People enjoy the melodies, the emotions, the magic…
 But there is one truth I’ve found that many will never understand:
 Music is the deepest mystery on earth.
 (But don’t argue yet… explanation will come later.)

 Today’s Good Report is for someone who kept me holding onto a dream that often feels invisible: Graciewells.

 When I look at where I started…
 When I remember where I met her…
 And when I see where I am today…
 Only one thing explains my courage:
 An idol + a mentor.

 Every melody she sings tells my heart to beat again.
 Every voice note, every text, every instruction feels like life support:
 “Go get it.”
 “Timothy, I need you to practice this…”
 “Can you do this? Yes You Can…”
 “I saw this and knew you needed it…”

 She’s the reason I can play the piano.
 She’s the reason I don't quit straining my voice.
 She’s the reason I stepped onto a big music stage for the first time.

 Graciewells, thank you.
 For your patience… your push… your consistency… your belief…
 Words will never be enough, so I’m left with one that carries the weight of a thousand emotions:
 THANK YOU.

 To you reading this…
 ❓ Who is the one person that holds your hands like they were born with the assignment of raising you?
 ❓ Who keeps you running when your strength is gone?

 Celebrate them.
 Tag me.
 Let’s honor them together.

 #30DaysConsistencyDrillWithDavidChibuike #Day21 #GoodReportDay16 #MusicJourney #MentorMagic #GratitudePost #PurposePartners #DestinyHelpers #HoldMyHand #TimfireWrites #ValuePeople #InspirationDaily

 © Timfire`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/keyboard.webp',
    imageWidth: 819, imageHeight: 1024,
    imageAlt: 'TIMFIRE in a “Create Well” t-shirt playing a keyboard outdoors on a hillside',
    origin: 'First posted on my Facebook wall, 16 November 2025 — Good Report, Day 16.',
  },
  {
    id: 'a-unaware',
    title: 'HE’S NOT EVEN AWARE OF WHAT HE’S DONE…',
    slug: 'hes-not-even-aware',
    category: 'Good Report',
    tags: ['Good Report', 'Leadership', 'Gratitude'],
    summary: 'Sometimes the people who change our lives don’t even know they did. Back in JSS3, there was one guy — our Senior Prefect.',
    body: `HE’S NOT EVEN AWARE OF WHAT HE’S DONE…

 GOOD REPORT DAY 8

 Sometimes the people who change our lives don’t even know they did.

 Back in JSS3, there was one guy — our Senior Prefect.
 His name? Sunday Odinakachukwu Ogbo.
 Confident. Focused. Inspiring.
 I admired everything about him — from his courage to his calm.
 But guess what?
 I never told him. 😅
 I was that quiet, “mind my business” type. Man-alone steez 😎😁

 Still, I started working in silence.
 I wasn’t the best student.
 But every day, his standard pushed me to grow.

 Fast forward — I got “forced” into joining the Press Club (the same one he once led).
 And for the first time (same day), I was chosen to represent the club in a debate (first time in my life 😫)
 That moment changed everything...

 I didn’t even present after all the prep 😭 — but something ignited in me.

 That pressure woke up the leader in me.
 And the next year, I found myself leading the same club that once scared me.

 All because of one person who never knew what his life did to mine.

 So today, I’m celebrating Sunday Odinakachukwu Ogbo— and every silent influencer out there.

 The ones who inspire without speaking, lead and mentor without titles, and shape destinies without knowing it.

 💭 Someone might be watching you right now — learning, growing, and believing again because of your consistency.

 Don’t stop shining. 🌟
 You have no idea whose life you’re rewriting.

 🔥 Call to Action:
 Tag or mention someone who has unknowingly impacted your life.
 Tell them “You may not know it, but you changed my story.”

 #30DaysConsistencyDrillWithDavidChibuike #Day13
 #TheGoodReport #Timfire #Day8 #InspirationThatLasts #InfluenceWithoutNoise #LeadershipByExample #HiddenImpact

 © Timfire`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/unaware-suit.webp',
    imageWidth: 715, imageHeight: 980,
    imageAlt: 'Portrait of Sunday Odinakachukwu Ogbo in a dark suit and tie against a yellow wall',
    origin: 'First posted on my Facebook wall, 8 November 2025 — Good Report, Day 8.',
  },
  {
    id: 'a-crazy-moments',
    title: 'Even in our crazy moments, let’s see a chance to worship God',
    slug: 'even-in-our-crazy-moments',
    category: 'Sounds and music',
    tags: ['Sounds and music', 'Worship'],
    summary: 'When kitchen utensils become instruments — the two-minute proof that worship doesn’t wait for a stage.',
    body: `Even in our crazy moments, let's see a chance to worship God

 When kitchen utensils become instruments, the ceiling becomes a sky and the kitchen becomes a sanctuary. Two of us, a pile of pots, and no audience except God — watch it and tell me worship needs a stage.`,
    status: 'published',
    visibility: 'public',
    publishAt: '',
    image: '/images/archive/worship-utensils-poster.webp',
    imageWidth: 360, imageHeight: 640,
    imageAlt: 'TIMFIRE and a friend laughing up at the ceiling mid-song, kitchen utensils in hand under coloured lights',
    origin: 'First posted on my Facebook wall, 3 May 2026, with the video below.',
    videoSrc: '/media/worship-utensils.mp4',
    videoPoster: '/images/archive/worship-utensils-poster.webp',
    videoCaption: 'When kitchen utensils become instruments — 3 May 2026',
    videoExternal: 'https://www.facebook.com/share/1EHJ272qmK/',
  },
];
