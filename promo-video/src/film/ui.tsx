import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";

export const DISPLAY = loadDisplay("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;
export const MONO = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;
export const UI =
  'system-ui, -apple-system, "SF Pro Display", "Segoe UI", sans-serif';

// The site's dark palette and reward colours (public/style.css)
export const T = {
  bg: "#0d0e0c",
  surface: "#161714",
  surface2: "#1c1e1a",
  line: "#2a2d26",
  lineStrong: "#40443a",
  text: "#eef0e8",
  muted: "#a0a596",
  accent: "#53fc18",
  ink: "#061002",
  warn: "#ffb547",
};
export const HUES = [
  "#00e701",
  "#eb2f96",
  "#2f80ed",
  "#fa8c16",
  "#9b51e0",
  "#13c2c2",
  "#fadb14",
  "#f5222d",
];

// Timing helpers. Every one of them takes fractional frames, so motion blur can sample between frames.
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.55, 0, 1, 0.45);
export const INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const ease = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing = OUT,
) => interpolate(f, [a, b], [from, to], { ...CLAMP, easing });
export const lin = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], CLAMP);
/** A spring from 0 to 1 starting at frame `at`; `bounce` lets it overshoot. */
export const sp = (f: number, at: number, bounce = false) =>
  spring({
    frame: f - at,
    fps: 60,
    config: bounce
      ? { damping: 11, stiffness: 130, mass: 0.8 }
      : { damping: 200, stiffness: 110 },
  });
export const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const panel = (radius = 20): React.CSSProperties => ({
  background: T.surface,
  borderRadius: radius,
  boxShadow: `inset 0 0 0 1.5px ${T.line}, 0 40px 90px rgba(0,0,0,.5)`,
  fontFamily: UI,
  color: T.text,
});

/** The three-bar level meter, the product's mark. `live` moves it like audio. */
export const Meter: React.FC<{
  size: number;
  live?: boolean;
  color?: string;
  grow?: number;
}> = ({ size, live = false, color = T.accent, grow = 1 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: size * 0.14,
        height: size,
      }}
    >
      {[0.45, 1, 0.7].map((h, i) => {
        const level = live
          ? 0.28 +
            0.72 * Math.abs(Math.sin(f / 7 + i * 1.9) * Math.cos(f / 11 + i))
          : h;
        return (
          <div
            key={i}
            style={{
              width: size * 0.22,
              height: Math.max(size * 0.08, size * level * grow),
              borderRadius: size * 0.05,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
};

const ICONS = {
  play: ["M7 5v14l11-7z"],
  sound: [
    "M11 5 6 9H2v6h4l5 4V5z",
    "M15.5 8.5a5 5 0 0 1 0 7",
    "M19 5a10 10 0 0 1 0 14",
  ],
  shuffle: ["M16 3h5v5", "M4 20 21 3", "M21 16v5h-5", "M15 15l6 6", "M4 4l5 5"],
  check: ["M5 12l5 5L20 7"],
  link: [
    "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7",
    "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  ],
  message: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
};
export const Icon: React.FC<{
  name: keyof typeof ICONS;
  size: number;
  color?: string;
  width?: number;
  fill?: boolean;
}> = ({ name, size, color = "currentColor", width = 1.8, fill = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? color : "none"}
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flex: "none" }}
  >
    {ICONS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

/** A key: a square button with a lip along the bottom; `down` (0 to 1) presses it. */
export const Key: React.FC<{
  children: React.ReactNode;
  primary?: boolean;
  size?: number;
  down?: number;
}> = ({ children, primary = false, size = 24, down = 0 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.4,
      fontFamily: UI,
      fontSize: size,
      fontWeight: primary ? 600 : 500,
      whiteSpace: "nowrap",
      padding: `${size * 0.55}px ${size * 0.95}px`,
      borderRadius: size * 0.42,
      background: primary ? T.accent : T.surface2,
      color: primary ? T.ink : T.text,
      boxShadow: primary
        ? `inset 0 ${-size * 0.13 * (1 - down)}px 0 rgba(0,0,0,.28)`
        : `inset 0 0 0 1.5px ${T.line}, inset 0 ${-size * 0.13 * (1 - down)}px 0 rgba(0,0,0,.35)`,
      translate: `0 ${down * size * 0.1}px`,
    }}
  >
    {children}
  </div>
);

/** The signal light: an amber dot while OBS is away, moving bars once it is connected. */
export const Led: React.FC<{ on: boolean; size?: number }> = ({
  on,
  size = 24,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: size * 0.45,
      fontFamily: UI,
      fontSize: size,
      fontWeight: 600,
      whiteSpace: "nowrap",
      color: on ? T.accent : T.warn,
    }}
  >
    {on ? (
      <Meter size={size * 0.7} live />
    ) : (
      <div
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: "50%",
          background: T.warn,
        }}
      />
    )}
    {on ? "OBS connected" : "OBS not connected"}
  </div>
);

/** A reward pad in the reward's own colour. `lit` (0 to 1) is the pad pressed or playing. */
export const Pad: React.FC<{
  title?: string;
  cost?: number;
  color: string;
  count?: number;
  lit?: number;
  w?: number;
  h?: number;
}> = ({ title, cost, color, count, lit = 0, w = 460, h = 230 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 22,
      padding: "22px 24px 28px",
      display: "flex",
      flexDirection: "column",
      fontFamily: UI,
      color: T.text,
      background: `color-mix(in srgb, ${color} ${13 + lit * 26}%, ${T.surface})`,
      boxShadow: [
        `inset 0 0 0 ${1.5 + lit * 2.5}px color-mix(in srgb, ${color} ${30 + lit * 70}%, ${T.line})`,
        `inset 0 -8px 0 color-mix(in srgb, ${color} 50%, transparent)`,
        `0 0 ${lit * 90}px color-mix(in srgb, ${color} ${lit * 50}%, transparent)`,
      ].join(","),
    }}
  >
    {title && (
      <div
        style={{
          fontSize: h * 0.14,
          fontWeight: 600,
          letterSpacing: "-0.015em",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
    )}
    <div
      style={{
        marginTop: "auto",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: h * 0.12,
          fontWeight: 500,
          lineHeight: 1.15,
        }}
      >
        {cost !== undefined && (
          <>
            {cost}{" "}
            <span
              style={{ fontFamily: UI, fontSize: h * 0.08, color: T.muted }}
            >
              points
            </span>
          </>
        )}
        {count !== undefined && (
          <div style={{ fontSize: h * 0.078, color: T.muted, marginTop: 4 }}>
            {count}×
          </div>
        )}
      </div>
      <div
        style={{
          width: h * 0.24,
          height: h * 0.24,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {lit > 0.5 ? (
          <Meter size={h * 0.1} live color={T.bg} />
        ) : (
          <Icon name="play" size={h * 0.1} color={T.bg} fill />
        )}
      </div>
    </div>
  </div>
);

/** The on-stream card: a dark plate whose lip fills while the sound plays. */
export const Card: React.FC<{
  scale?: number;
  accent?: string;
  user: string;
  nth?: number;
  reward: string;
  message?: string;
  note?: string;
  progress?: number;
}> = ({
  scale = 1,
  accent = T.accent,
  user,
  nth = 0,
  reward,
  message,
  note,
  progress = 1,
}) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      fontFamily: UI,
      fontWeight: 600,
      fontSize: 22 * scale,
      lineHeight: 1.35,
      color: "#fff",
      textAlign: "center",
      whiteSpace: "nowrap",
      background: "rgba(13,14,12,.95)",
      borderRadius: 10 * scale,
      padding: `${12 * scale}px ${24 * scale}px ${16 * scale}px`,
      boxShadow: `0 ${12 * scale}px ${36 * scale}px rgba(0,0,0,.5)`,
    }}
  >
    {note && (
      <div style={{ fontSize: 14 * scale, fontWeight: 700, color: accent }}>
        {note}
      </div>
    )}
    <span style={{ color: accent }}>{user}</span>
    {nth > 1 && (
      <span style={{ fontSize: 16.5 * scale, opacity: 0.7 }}> ×{nth}</span>
    )}{" "}
    <span
      style={{
        display: "inline-flex",
        verticalAlign: "-0.12em",
        opacity: 0.75,
      }}
    >
      <Icon name="sound" size={20 * scale} width={2} />
    </span>{" "}
    {reward}
    {message !== undefined && (
      <div
        style={{
          fontWeight: 500,
          fontSize: 20 * scale,
          marginTop: 6 * scale,
          minHeight: 27 * scale,
        }}
      >
        {message}
      </div>
    )}
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        height: 4 * scale,
        background: accent,
        opacity: 0.3,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: `${progress * 100}%`,
        height: 4 * scale,
        background: accent,
      }}
    />
  </div>
);

export const Cursor: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{
      translate: "45% 45%",
      filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))",
    }}
  >
    <path
      d="M5 3l14 8-6 1.5L10 19z"
      fill="#fff"
      stroke="#000"
      strokeWidth={1.1}
      strokeLinejoin="round"
    />
  </svg>
);
