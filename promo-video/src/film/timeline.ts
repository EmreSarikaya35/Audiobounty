// The film's clock, in frames at 60 fps. The soundtrack (scripts/music.mjs) is 106 BPM: one beat is 33.96 frames
// and the first one lands on frame 36, so the cues below sit on its beats.
export const beat = (n: number) => 36 + n * 33.96;

export const TL = {
  words: [beat(0), beat(2), beat(4)], // "Chat" "spends" "points."
  drop: 240, // the groove starts: the screen swings up
  redeem: 292, // the redemption shows in chat
  card: beat(8), // the card lands on stream
  travel: 520, // off along the cable
  strip: 600, // the live strip assembles
  pads: 735, // the pads flip up
  click: beat(23), // a pad is pressed
  layers: [880, 980, 1080, 1180], // the four feature layers
  leave: 1290,
  bars: 1330, // the statistics skyline grows
  obs: 1460,
  copy: 1500,
  paste: 1566,
  flip: 1610, // the signal light turns green
  build: beat(48), // snare roll: the journey rewinds
  stop: beat(52), // everything cuts for a breath
  hit: 1846, // the logo
  end: 1974,
};

// Where the sets stand in the world
export const SCREEN_Z = -520;
export const DASH: [number, number, number] = [3000, -520, -1500];
export const SKY: [number, number, number] = [5600, 0, -900];
export const OBS: [number, number, number] = [8000, -470, -1500];
