import { Audio } from "@remotion/media";
import { mouseClick } from "@remotion/sfx";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Kinetic } from "../lib/Kinetic";
import { EASE_IN_OUT, pop, track, tw } from "../lib/motion";
import { Backdrop, C, Cursor, Icon, Key, Meter, MONO, Pad, panel, StatusLed } from "../lib/theme";
import { Cam, Obj, World } from "../lib/World";

export const DASHBOARD_FRAMES = 360;
const CLICK = 290; // the streamer presses the first pad

const PADS = [
  { title: "Air horn", cost: 100, color: C.green, count: 180 },
  { title: "Bruh", cost: 150, color: C.pink, count: 160, tag: "3 sounds" },
  { title: "Read my message", cost: 500, color: C.blue, count: 140 },
  { title: "Drum roll", cost: 250, color: C.orange, count: 120 },
  { title: "Sad trombone", cost: 200, color: C.purple, count: 100 },
  { title: "Applause", cost: 300, color: C.cyan, count: 80, tag: "2 sounds" },
];

// Centre of the first pad in world coordinates (the board is 1440 wide and centred on 0, 0)
const PAD = { x: -490, y: 29 };

const cam = (f: number): Cam => ({
  x: track(f, [[0, -560], [150, 380], [240, 0], [300, PAD.x - 30], [360, PAD.x - 50]]),
  y: track(f, [[0, 260], [150, 160], [240, 0], [300, PAD.y + 40], [360, PAD.y + 40]]),
  dolly: track(f, [[0, 380], [150, 260], [240, -200], [300, 360], [360, 420]]),
  rx: track(f, [[0, 62], [150, 46], [240, 0], [360, 0]]),
  ry: track(f, [[0, -20], [150, -6], [240, 0], [300, 5], [360, 3]]),
});

export const Dashboard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lit = tw(f, CLICK, CLICK + 10, 0, 1);
  const press = tw(f, CLICK - 4, CLICK, 0, 1) * tw(f, CLICK, CLICK + 14, 1, 0);
  const ripple = tw(f, CLICK, CLICK + 40, 0, 1);
  const cx = track(f, [[220, 420], [CLICK - 6, PAD.x + 60]], EASE_IN_OUT);
  const cy = track(f, [[220, 420], [CLICK - 6, PAD.y + 30]], EASE_IN_OUT);
  return (
    <Backdrop>
      <World cam={cam}>
        <Obj style={{ width: 1440 }}>
          <div style={{ width: 1440, display: "flex", flexDirection: "column", gap: 24, transformStyle: "preserve-3d" }}>
            <div style={{ height: 64, display: "flex", alignItems: "center", gap: 16, opacity: tw(f, 0, 20, 0, 1) }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: C.accent }} />
              <span style={{ fontSize: 28, fontWeight: 600, marginRight: "auto" }}>mrkaffin</span>
              <span style={{ color: C.muted, display: "flex", gap: 34, alignItems: "center", fontSize: 24 }}>
                <Icon name="settings" size={28} /> EN <span>Log out</span>
              </span>
            </div>
            {/* the live strip: status, what is playing, volume and the keys */}
            <div style={{ ...panel(18), height: 96, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 28px", opacity: tw(f, 6, 26, 0, 1) }}>
              <StatusLed on size={24} />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  height: 56,
                  padding: "0 18px",
                  borderRadius: 10,
                  background: C.bg,
                  boxShadow: `inset 0 0 0 1.5px ${C.line}`,
                  fontFamily: MONO,
                  fontSize: 22,
                  opacity: lit,
                }}
              >
                <Meter size={20} live /> Air horn — test
              </div>
              <span style={{ color: C.muted, display: "flex" }}>
                <Icon name="sound" size={26} />
              </span>
              <div style={{ position: "relative", width: 170, height: 6, borderRadius: 3, background: C.lineStrong }}>
                <div style={{ width: "80%", height: "100%", borderRadius: 3, background: C.accent }} />
                <div style={{ position: "absolute", left: "80%", top: -15, width: 20, height: 36, marginLeft: -10, borderRadius: 5, background: C.text }} />
              </div>
              <Key size={22}>Copy OBS link</Key>
              <Key size={22}>Mute</Key>
            </div>
            <div style={{ height: 70, display: "flex", alignItems: "center", marginTop: 16 }}>
              <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.03em", marginRight: "auto" }}>Sound rewards</span>
              <Key primary size={24}>
                <Icon name="plus" size={24} width={2.4} /> New reward
              </Key>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 460px)", gap: 30, transformStyle: "preserve-3d" }}>
              {PADS.map((r, i) => {
                const p = pop(f, fps, 10 + i * 7, 13, 110);
                const first = i === 0;
                return (
                  <div
                    key={r.title}
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `translateZ(${(1 - p) * -420}px) rotateX(${(1 - p) * 40}deg) translateY(${first ? press * 6 : 0}px)`,
                      opacity: Math.min(1, p * 1.5),
                    }}
                  >
                    <Pad {...r} lit={first ? lit : 0} />
                  </div>
                );
              })}
            </div>
          </div>
        </Obj>
        {/* click ripple and cursor live just above the board */}
        <Obj x={PAD.x + 60} y={PAD.y + 30} z={50} s={1 + ripple * 3} o={ripple > 0 && ripple < 1 ? 1 - ripple : 0}>
          <div style={{ width: 60, height: 60, borderRadius: 30, border: `3px solid ${C.green}` }} />
        </Obj>
        <Obj x={cx} y={cy} z={60} o={tw(f, 220, 236, 0, 1)} s={1 - press * 0.12}>
          <Cursor />
        </Obj>
      </World>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 110px 130px" }}>
        <Kinetic text="Every reward is a pad." start={30} out={175} size={64} align="left" />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 110px 130px" }}>
        <Kinetic text="Press it. It plays." start={205} out={340} size={64} align="left" accent={["plays."]} />
      </AbsoluteFill>
      <Sequence from={CLICK - 2} layout="none">
        <Audio src={mouseClick} />
      </Sequence>
    </Backdrop>
  );
};
