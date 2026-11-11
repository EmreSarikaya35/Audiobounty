import { AbsoluteFill, useCurrentFrame } from "remotion";

// The site's palette (public/style.css, dark theme) and the reward colours it offers
export const C = {
  bg: "#0d0e0c",
  surface: "#161714",
  surface2: "#1c1e1a",
  raised: "#22241f",
  line: "#2a2d26",
  lineStrong: "#40443a",
  text: "#eef0e8",
  muted: "#a0a596",
  accent: "#53fc18",
  accentInk: "#061002",
  warn: "#ffb547",
  green: "#00e701",
  pink: "#eb2f96",
  blue: "#2f80ed",
  orange: "#fa8c16",
  purple: "#9b51e0",
  cyan: "#13c2c2",
  yellow: "#fadb14",
};

export const FONT = 'system-ui, -apple-system, "SF Pro Display", "Segoe UI", sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

/** A matte panel with a hairline, like the dashboard's cards and drawers. */
export const panel = (radius = 20): React.CSSProperties => ({
  background: C.surface,
  borderRadius: radius,
  boxShadow: `inset 0 0 0 1.5px ${C.line}, 0 40px 90px rgba(0,0,0,.5)`,
  fontFamily: FONT,
  color: C.text,
});

/** The matte stage: flat near-black with a faint perforated grid, no glow. */
export const Backdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: C.bg,
      fontFamily: FONT,
      color: C.text,
      backgroundImage: "radial-gradient(circle, rgba(238,240,232,.055) 1.5px, transparent 2.5px)",
      backgroundSize: "56px 56px",
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Cinematic vignette over everything. */
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)" }} />
);

/** The signature three-bar level meter. `live` makes it move like audio. */
export const Meter: React.FC<{ size: number; live?: boolean; color?: string; grow?: number }> = ({ size, live = false, color = C.accent, grow = 1 }) => {
  const f = useCurrentFrame();
  const base = [0.45, 1, 0.7];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.14, height: size }}>
      {base.map((h, i) => {
        const level = live ? 0.28 + 0.72 * Math.abs(Math.sin(f / 7 + i * 1.9) * Math.cos(f / 11 + i)) : h;
        return <div key={i} style={{ width: size * 0.22, height: Math.max(size * 0.08, size * level * grow), borderRadius: size * 0.05, backgroundColor: color }} />;
      })}
    </div>
  );
};

type IconName = "play" | "sound" | "shuffle" | "check" | "link" | "plus" | "settings" | "more" | "message";
const PATHS: Record<IconName, string[]> = {
  play: ["M7 5v14l11-7z"],
  sound: ["M11 5 6 9H2v6h4l5 4V5z", "M15.5 8.5a5 5 0 0 1 0 7", "M19 5a10 10 0 0 1 0 14"],
  shuffle: ["M16 3h5v5", "M4 20 21 3", "M21 16v5h-5", "M15 15l6 6", "M4 4l5 5"],
  check: ["M5 12l5 5L20 7"],
  link: ["M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7", "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"],
  plus: ["M12 5v14", "M5 12h14"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M4 12h2", "M18 12h2", "M12 4v2", "M12 18v2", "M6.3 6.3l1.4 1.4", "M16.3 16.3l1.4 1.4", "M6.3 17.7l1.4-1.4", "M16.3 7.7l1.4-1.4"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  message: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
};
export const Icon: React.FC<{ name: IconName; size: number; color?: string; width?: number; fill?: boolean }> = ({ name, size, color = "currentColor", width = 1.6, fill = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"} stroke={color} strokeWidth={name === "more" ? 3 : width} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
    {PATHS[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

/** A key: a square button with a lip along the bottom. `down` (0 to 1) presses it. */
export const Key: React.FC<{ children: React.ReactNode; primary?: boolean; size?: number; down?: number; style?: React.CSSProperties }> = ({ children, primary = false, size = 24, down = 0, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: size * 0.4,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: primary ? 600 : 500,
      whiteSpace: "nowrap",
      padding: `${size * 0.55}px ${size * 0.95}px`,
      borderRadius: size * 0.42,
      background: primary ? C.accent : C.surface2,
      color: primary ? C.accentInk : C.text,
      boxShadow: primary ? `inset 0 ${-size * 0.13 * (1 - down)}px 0 rgba(0,0,0,.28)` : `inset 0 0 0 1.5px ${C.line}, inset 0 ${-size * 0.13 * (1 - down)}px 0 rgba(0,0,0,.35)`,
      translate: `0 ${down * size * 0.1}px`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** The signal light: amber dot when OBS is away, moving bars when it is connected. */
export const StatusLed: React.FC<{ on: boolean; size?: number }> = ({ on, size = 24 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.45, fontFamily: FONT, fontSize: size, fontWeight: 600, whiteSpace: "nowrap", color: on ? C.accent : C.warn }}>
    {on ? <Meter size={size * 0.7} live /> : <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: C.warn }} />}
    {on ? "OBS connected" : "OBS not connected"}
  </div>
);

/**
 * A reward pad from the dashboard, in the reward's own colour. `lit` (0 to 1) is the pad pressed or
 * playing on stream. Without a title it is a blank pad.
 */
export const Pad: React.FC<{ title?: string; cost?: number; color: string; count?: number; tag?: string; lit?: number; w?: number; h?: number }> = ({
  title,
  cost,
  color,
  count,
  tag,
  lit = 0,
  w = 460,
  h = 230,
}) => (
  <div
    style={{
      position: "relative",
      width: w,
      height: h,
      borderRadius: 22,
      padding: "24px 26px 30px",
      display: "flex",
      flexDirection: "column",
      fontFamily: FONT,
      color: C.text,
      background: `color-mix(in srgb, ${color} ${13 + lit * 24}%, ${C.surface})`,
      boxShadow: [
        `inset 0 0 0 ${1.5 + lit * 2.5}px color-mix(in srgb, ${color} ${30 + lit * 70}%, ${C.line})`,
        `inset 0 -8px 0 color-mix(in srgb, ${color} 50%, transparent)`,
        `0 0 ${lit * 80}px color-mix(in srgb, ${color} ${lit * 45}%, transparent)`,
        "0 24px 50px rgba(0,0,0,.4)",
      ].join(","),
    }}
  >
    {title && <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{title}</div>}
    {tag && (
      <div style={{ alignSelf: "flex-start", marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 19, fontWeight: 500, background: "rgba(238,240,232,.09)", padding: "3px 10px", borderRadius: 6 }}>
        <Icon name="shuffle" size={18} />
        {tag}
      </div>
    )}
    <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 500, lineHeight: 1.15 }}>
        {cost !== undefined && (
          <>
            {cost} <span style={{ fontFamily: FONT, fontSize: 19, color: C.muted }}>points</span>
          </>
        )}
        {count !== undefined && <div style={{ fontSize: 18, color: C.muted, marginTop: 4 }}>{count}×</div>}
      </div>
      <div style={{ width: 56, height: 56, borderRadius: 28, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {lit > 0.5 ? <Meter size={24} live color={C.bg} /> : <Icon name="play" size={24} color={C.bg} fill />}
      </div>
    </div>
  </div>
);

/**
 * The on-stream card, the same look as public/overlay.html: a dark plate whose lip fills while the
 * sound plays, with the viewer's count and an optional note above the name.
 */
export const OverlayCard: React.FC<{
  scale?: number;
  accent?: string;
  user?: string;
  nth?: number;
  reward?: string;
  message?: string;
  note?: string;
  progress?: number;
}> = ({ scale = 1, accent = C.accent, user = "mert_42", nth = 12, reward = "Air horn", message = "Hello stream", note, progress = 1 }) => (
  <div
    style={{
      position: "relative",
      overflow: "hidden",
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 22 * scale,
      lineHeight: 1.35,
      color: "#fff",
      textAlign: "center",
      whiteSpace: "nowrap",
      background: "rgba(13,14,12,.94)",
      borderRadius: 10 * scale,
      padding: `${12 * scale}px ${24 * scale}px ${16 * scale}px`,
      boxShadow: `0 ${12 * scale}px ${36 * scale}px rgba(0,0,0,.45)`,
    }}
  >
    {note && <div style={{ fontSize: 14 * scale, fontWeight: 700, color: accent }}>{note}</div>}
    <span style={{ color: accent }}>{user}</span>
    {nth > 1 && <span style={{ fontSize: 16.5 * scale, opacity: 0.7 }}> ×{nth}</span>}{" "}
    <span style={{ display: "inline-flex", verticalAlign: "-0.12em", opacity: 0.75 }}>
      <Icon name="sound" size={20 * scale} width={2} />
    </span>{" "}
    {reward}
    {message && <div style={{ fontWeight: 500, fontSize: 20 * scale, marginTop: 6 * scale }}>{message}</div>}
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 4 * scale, background: accent, opacity: 0.3 }} />
    <div style={{ position: "absolute", left: 0, bottom: 0, width: `${progress * 100}%`, height: 4 * scale, background: accent }} />
  </div>
);

/** A mouse pointer. */
export const Cursor: React.FC<{ size?: number }> = ({ size = 54 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ translate: "40% 40%", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.5))" }}>
    <path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#000" strokeWidth={1.1} strokeLinejoin="round" />
  </svg>
);
