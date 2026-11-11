import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Kinetic } from "../lib/Kinetic";
import { EASE_IN, pop, track } from "../lib/motion";
import { Backdrop, C, Meter, Pad } from "../lib/theme";
import { Cam, Obj, World } from "../lib/World";

export const HOOK_FRAMES = 260;
const BEATS = [36, 104, 172]; // each line lands on a beat, and pads light with it

const COLORS = [C.green, C.pink, C.blue, C.orange, C.purple, C.cyan, C.yellow, C.green, C.blue, C.pink, C.orange, C.purple];
const COLS = 4;
const PW = 340;
const PH = 210;
const GAP = 28;

// A board of blank pads lying on the floor; the camera rises over it and then dives through the logo
const cam = (f: number): Cam => ({
  x: 0,
  y: track(f, [[0, 120], [210, 40], [260, 0]]),
  dolly: track(f, [[0, -260], [210, 120], [260, 1500]], EASE_IN),
  rx: track(f, [[0, 58], [210, 44], [260, 6]]),
  ry: track(f, [[0, -16], [260, 8]]),
});

/** How bright pad i is at frame f: every beat lights a different third of the board, then it fades. */
const lit = (f: number, i: number) => {
  let v = 0;
  BEATS.forEach((b, k) => {
    if ((i + k) % 3 !== 0) return;
    const d = f - b;
    if (d >= -3) v = Math.max(v, Math.max(0, 1 - d / 44) ** 2);
  });
  return v;
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meter = pop(f, fps, 200, 12, 110);
  return (
    <Backdrop>
      <World cam={cam}>
        {COLORS.map((color, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const inn = pop(f, fps, 2 + i * 3, 14, 110);
          return (
            <Obj
              key={i}
              x={(col - (COLS - 1) / 2) * (PW + GAP)}
              y={150 + (row - 1) * (PH + GAP)}
              z={-360 - (1 - inn) * 500}
              o={Math.min(1, inn * 1.5) * (1 - Math.min(1, meter))}
            >
              <Pad color={color} lit={lit(f, i)} w={PW} h={PH} />
            </Obj>
          );
        })}
        <Obj z={60} s={0.4 + meter * 0.6} o={Math.min(1, meter * 2)}>
          <Meter size={300} live={f > 218} grow={meter} />
        </Obj>
      </World>
      {/* a soft shade so the type reads over the lit pads */}
      <AbsoluteFill style={{ background: "radial-gradient(60% 34% at 50% 40%, rgba(13,14,12,.82), transparent)", opacity: 1 - Math.min(1, meter) }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Kinetic text="Channel points." start={BEATS[0] - 8} out={BEATS[1] - 32} size={150} by="char" stagger={1.5} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Kinetic text="Real sounds." start={BEATS[1] - 6} out={BEATS[2] - 32} size={150} by="char" stagger={1.5} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 200 }}>
        <Kinetic text="One soundboard." start={BEATS[2] - 6} out={194} size={150} by="char" stagger={1.5} />
      </AbsoluteFill>
    </Backdrop>
  );
};
