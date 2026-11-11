import { Audio } from "@remotion/media";
import { uiSwitch, whoosh } from "@remotion/sfx";
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Kinetic } from "../lib/Kinetic";
import { pop, rnd, track, tw } from "../lib/motion";
import { Backdrop, C, Icon, MONO, OverlayCard, panel } from "../lib/theme";
import { Cam, Obj, World } from "../lib/World";

export const FEATURES_FRAMES = 600;
const GAP = 1900; // distance between two feature stations
const FOCUS = [20, 170, 320, 470]; // when each station is centred

// The camera whips from one station to the next and holds on each
const cam = (f: number): Cam => ({
  x: track(f, [[0, -260], [FOCUS[0] + 16, 0], [FOCUS[1] - 36, 30], [FOCUS[1], GAP], [FOCUS[2] - 36, GAP + 30], [FOCUS[2], 2 * GAP], [FOCUS[3] - 36, 2 * GAP + 30], [FOCUS[3], 3 * GAP], [600, 3 * GAP + 30]]),
  y: 0,
  dolly: track(f, [[0, -420], [40, 170], [600, 190]]),
  rx: 3,
  ry: track(f, [[0, -12], [40, -3], [FOCUS[1] - 36, -2], [FOCUS[1] - 16, -14], [FOCUS[1] + 10, -3], [FOCUS[2] - 36, -2], [FOCUS[2] - 16, -14], [FOCUS[2] + 10, -3], [FOCUS[3] - 36, -2], [FOCUS[3] - 16, -14], [FOCUS[3] + 10, -3], [600, 2]]),
});

const TITLES = [
  ["Reads the chat's message aloud.", "Text-to-speech, with a banned-word list and a spam filter."],
  ["A pool of sounds, cut to the punchline.", "Up to ten per reward, one at random. Trim each on its waveform."],
  ["A card that knows your regulars.", "It counts every viewer and marks their 10th, 50th and 100th."],
  ["See what your chat loves.", "Thirty days of redemptions, top rewards and top viewers."],
];

/** One station: the claim on the left, the proof on the right. */
const Station: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const f = useCurrentFrame();
  return (
    <Obj x={i * GAP} style={{ width: 1560 }}>
      <div style={{ width: 1560, display: "flex", alignItems: "center", gap: 90 }}>
        <div style={{ width: 700, flex: "none" }}>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.accent, marginBottom: 22, opacity: tw(f, FOCUS[i] - 6, FOCUS[i] + 14, 0, 1) }}>0{i + 1}</div>
          <Kinetic text={TITLES[i][0]} start={FOCUS[i] - 6} size={66} align="left" stagger={3} />
          <div style={{ fontSize: 30, lineHeight: 1.4, color: C.muted, marginTop: 28, opacity: tw(f, FOCUS[i] + 24, FOCUS[i] + 48, 0, 1) }}>{TITLES[i][1]}</div>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>{children}</div>
      </div>
    </Obj>
  );
};

const MESSAGE = "Hello chat, this one is read out loud!";

/** 01: the card with the viewer's message, typed out, and the voice under it. */
const Speech: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - FOCUS[0];
  const typed = MESSAGE.slice(0, Math.max(0, Math.floor((t - 26) / 1.6)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
      <OverlayCard scale={1.9} user="zeynep" nth={7} reward="Read my message" message={typed || " "} progress={tw(t, 26, 150, 0, 1, (x) => x)} />
      <div style={{ ...panel(18), width: 620, height: 150, padding: "0 30px", display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ color: C.accent, display: "flex" }}>
          <Icon name="message" size={40} />
        </span>
        <div style={{ flex: 1, height: 90, display: "flex", alignItems: "center", gap: 5 }}>
          {Array.from({ length: 44 }, (_, k) => {
            const speaking = t > 26 && k / 44 < tw(t, 26, 150, 0, 1, (x) => x) + 0.02;
            const h = speaking ? 0.2 + 0.8 * Math.abs(Math.sin(k * 1.7 + f / 6) * Math.cos(k * 0.6 - f / 9)) : 0.08;
            return <div key={k} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 2, background: speaking ? C.accent : C.lineStrong }} />;
          })}
        </div>
      </div>
    </div>
  );
};

const POOL = ["bruh.mp3", "vine-boom.mp3", "oof.mp3"];

/** 02: a reward's sounds, one picked at random, and a waveform trimmed to the part that matters. */
const Pool: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - FOCUS[1];
  const pick = t < 20 ? -1 : Math.floor((t - 20) / 34) % POOL.length;
  const a = tw(t, 40, 90, 0, 0.24);
  const b = tw(t, 60, 110, 1, 0.68);
  return (
    <div style={{ ...panel(22), width: 660, padding: 30, display: "flex", flexDirection: "column", gap: 14 }}>
      {POOL.map((name, k) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            height: 68,
            padding: "0 20px",
            borderRadius: 12,
            fontFamily: MONO,
            fontSize: 26,
            background: k === pick ? "rgba(235,47,150,.16)" : C.surface2,
            boxShadow: `inset 0 0 0 ${k === pick ? 2.5 : 1.5}px ${k === pick ? C.pink : C.line}`,
          }}
        >
          <Icon name={k === pick ? "sound" : "play"} size={26} color={k === pick ? C.pink : C.muted} />
          {name}
          {k === pick && (
            <span style={{ marginLeft: "auto", color: C.pink, display: "flex" }}>
              <Icon name="shuffle" size={26} />
            </span>
          )}
        </div>
      ))}
      {/* the trimmer */}
      <div style={{ position: "relative", height: 170, marginTop: 12, borderRadius: 14, background: C.bg, boxShadow: `inset 0 0 0 1.5px ${C.line}`, display: "flex", alignItems: "center", gap: 4, padding: "0 18px" }}>
        {Array.from({ length: 64 }, (_, k) => {
          const x = k / 63;
          const kept = x >= a && x <= b;
          const h = 0.15 + 0.8 * rnd(k + 3) * Math.sin(Math.PI * x) ** 0.6;
          return <div key={k} style={{ flex: 1, height: `${h * 100}%`, borderRadius: 2, background: kept ? C.accent : C.lineStrong }} />;
        })}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(18px + (100% - 36px) * ${a})`, right: `calc(18px + (100% - 36px) * ${1 - b})`, border: `3px solid ${C.accent}`, borderRadius: 8 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 22, color: C.muted }}>
        <span>{(a * 4.2).toFixed(1)} s</span>
        <span>{(b * 4.2).toFixed(1)} s</span>
      </div>
    </div>
  );
};

const MARKS = ["First today", "10th", "50th", "100th"];

/** 03: the card on a round number: bigger, with a note above the name. */
const Regulars: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f - FOCUS[2];
  const land = pop(t, fps, 34, 9, 130);
  const count = t < 34 ? 49 : 50;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 56 }}>
      <div style={{ scale: String(0.78 + 0.22 * land) }}>
        <OverlayCard scale={2.3} user="kaan_tv" nth={count} reward="Air horn" message="" note={count === 50 ? "50th redemption!" : undefined} progress={tw(t, 34, 150, 0, 1, (x) => x)} />
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {MARKS.map((m, k) => {
          const on = k === 2 && t >= 34;
          return (
            <div
              key={m}
              style={{
                fontFamily: MONO,
                fontSize: 24,
                padding: "12px 20px",
                borderRadius: 10,
                color: on ? C.accentInk : C.muted,
                background: on ? C.accent : C.surface2,
                boxShadow: on ? "inset 0 -3px 0 rgba(0,0,0,.28)" : `inset 0 0 0 1.5px ${C.line}`,
                opacity: tw(t, 10 + k * 5, 26 + k * 5, 0, 1),
              }}
            >
              {m}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DAYS = Array.from({ length: 30 }, (_, k) => 0.2 + 0.7 * rnd(k + 9) * (0.5 + k / 60));
const TOP = [
  ["Air horn", C.green, 180],
  ["Bruh", C.pink, 160],
  ["Read my message", C.blue, 140],
  ["Drum roll", C.orange, 120],
] as const;

/** 04: the statistics drawer. */
const Stats: React.FC = () => {
  const f = useCurrentFrame();
  const t = f - FOCUS[3];
  const grow = tw(t, 6, 60, 0, 1);
  return (
    <div style={{ ...panel(22), width: 660, padding: 30, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          [Math.round(482 * grow).toLocaleString("en-US"), "Redemptions"],
          [Math.round(87700 * grow).toLocaleString("en-US"), "Points spent"],
        ].map(([n, label]) => (
          <div key={label} style={{ borderRadius: 14, padding: "16px 20px", background: C.surface2, boxShadow: `inset 0 0 0 1.5px ${C.line}` }}>
            <div style={{ fontFamily: MONO, fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em" }}>{n}</div>
            <div style={{ fontSize: 20, color: C.muted }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 150, display: "flex", alignItems: "flex-end", gap: 5 }}>
        {DAYS.map((d, k) => (
          <div key={k} style={{ flex: 1, height: `${d * 100 * tw(t, 10 + k, 44 + k, 0, 1)}%`, borderRadius: "3px 3px 0 0", background: k === 29 ? C.accent : C.lineStrong }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TOP.map(([name, color, n], k) => (
          <div key={name} style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, height: 46, padding: "0 16px", fontSize: 24 }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(n / 180) * 100 * tw(t, 30 + k * 6, 76 + k * 6, 0, 1)}%`, borderRadius: 6, background: `color-mix(in srgb, ${color} 22%, transparent)` }} />
            <div style={{ position: "relative", width: 14, height: 14, borderRadius: 3, background: color }} />
            <span style={{ position: "relative" }}>{name}</span>
            <span style={{ position: "relative", marginLeft: "auto", fontFamily: MONO, fontWeight: 600 }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Features: React.FC = () => (
  <Backdrop>
    <World cam={cam}>
      <Station i={0}>
        <Speech />
      </Station>
      <Station i={1}>
        <Pool />
      </Station>
      <Station i={2}>
        <Regulars />
      </Station>
      <Station i={3}>
        <Stats />
      </Station>
    </World>
    {FOCUS.slice(1).map((at) => (
      <Sequence key={at} from={at - 36} durationInFrames={60} layout="none">
        <Audio src={whoosh} volume={0.35} />
      </Sequence>
    ))}
    <Sequence from={FOCUS[2] + 34} durationInFrames={40} layout="none">
      <Audio src={uiSwitch} volume={0.3} />
    </Sequence>
  </Backdrop>
);
