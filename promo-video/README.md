# AudioBounty promo video

The 33-second promo shown on the landing page, made with [Remotion](https://www.remotion.dev): 1920×1080 at 60 FPS.

```
npm install
npm run dev                                       # Remotion Studio: preview and edit
npx remotion render Film out/audiobounty-film.mp4  # render the full video
```

## `Film`: the promo (src/film/)

One continuous take: a single 3D world and a camera that never stops. It opens pressed against one pad, rises over the board, tilts up to the stream as a card lands, follows a cable across the floor to the dashboard, backs through four feature layers, flies low along the statistics skyline, reaches OBS, then rewinds the whole journey in two seconds before the logo.

- `rig.tsx` the camera and the world. The camera orbits a target and its flight is a smooth curve through keyframes (continuous velocity, no overshoot) with a little handheld drift. `Place` puts something in the world, fades it before it would pass through the lens and softens it when it is off the focal plane.
- `timeline.ts` every cue in frames, on the soundtrack's beats, and where the sets stand.
- `sets-a.tsx`, `sets-b.tsx` the sets: floor, cable, board, stream screen, dashboard, feature layers, skyline, OBS.
- `type.tsx` kinetic type: letters that flip up, words that slam in, lines that rise through a slot.
- `ui.tsx` the site's palette and pieces (pad, key, signal light, on-stream card).
- `Film.tsx` the camera's keyframes, the finale and the sound.

Motion blur is real: `@remotion/motion-blur` renders every frame six times across the shutter, so everything in the film runs on fractional frames. The pads pulse with the low end of the soundtrack (`@remotion/media-utils`). Type is Space Grotesk and JetBrains Mono from `@remotion/google-fonts`.

## `Promo`: the earlier cut (src/scenes/, src/lib/)

Six scenes joined by 3D transitions, kept as a backup. Render it with `npx remotion render Promo out/audiobounty-promo.mp4`.

The soundtrack is synthesized by `scripts/music.mjs` (106 BPM, A minor, laid out on the video's timeline), so there are no samples to license. After changing the timeline, regenerate it:

```
node scripts/music.mjs music.wav && ffmpeg -y -i music.wav -c:a aac -b:a 192k public/music.m4a
```

Sound effects load from remotion.media and the fonts from Google Fonts, so rendering needs an internet connection.

The landing page uses a smaller copy: `public/promo.mp4` (1280 wide), muted until the viewer presses the sound button, and `public/promo.jpg` as its poster.

Remotion is free for individuals and teams of up to 3; see its license for larger companies.
