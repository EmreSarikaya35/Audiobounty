import { Fragment } from "react";
import { useCurrentFrame } from "remotion";
import { Place, V3 } from "./rig";
import { DASH, OBS, SKY, TL } from "./timeline";
import { Flip, Rise, Slam } from "./type";
import {
  Card,
  Cursor,
  ease,
  HUES,
  Icon,
  IN,
  INOUT,
  Key,
  Led,
  lin,
  Meter,
  mix,
  MONO,
  Pad,
  panel,
  rnd,
  sp,
  T,
  UI,
} from "./ui";

const add = (a: V3, x = 0, y = 0, z = 0): V3 => [a[0] + x, a[1] + y, a[2] + z];

const REWARDS = [
  { title: "Air horn", cost: 100, color: HUES[0], count: 180 },
  { title: "Bruh", cost: 150, color: HUES[1], count: 160 },
  { title: "Read my message", cost: 500, color: HUES[2], count: 140 },
  { title: "Drum roll", cost: 250, color: HUES[3], count: 120 },
  { title: "Sad trombone", cost: 200, color: HUES[4], count: 100 },
  { title: "Applause", cost: 300, color: HUES[5], count: 80 },
];
const padPos = (i: number): [number, number] => [
  ((i % 3) - 1) * 490,
  i < 3 ? -50 : 210,
];

/** A part of the live strip: it arrives from in front of the board, turning, and sharpens as it seats. */
const Part: React.FC<{
  x: number;
  at: number;
  dim: number;
  children: React.ReactNode;
}> = ({ x, at, dim, children }) => {
  const f = useCurrentFrame();
  const p = sp(f, at, true);
  return (
    <Place
      at={add(DASH, x, -330, 4 + (1 - p) * 700)}
      ry={(1 - p) * 75}
      o={Math.min(1, p * 2.5) * dim}
    >
      {children}
    </Place>
  );
};

/**
 * The dashboard, standing in the air: the live strip is assembled part by part while the camera tracks
 * along it, then the pads flip up from the floor in a wave and one of them is pressed.
 */
export const Dashboard: React.FC<{ bass: number }> = ({ bass }) => {
  const f = useCurrentFrame();
  const bar = ease(f, TL.strip - 6, TL.strip + 30);
  const lit = lin(f, TL.click, TL.click + 8);
  const down =
    lin(f, TL.click - 4, TL.click) * lin(f, TL.click, TL.click + 14, 1, 0);
  const [px, py] = padPos(0);
  const cur = ease(f, TL.click - 46, TL.click - 4, 0, 1, INOUT);
  const building = f > TL.build - 4;
  // it steps back into the dark while the layers in front of it have the floor
  const dim =
    1 -
    0.8 *
      lin(f, TL.layers[0] - 6, TL.layers[0] + 40) *
      lin(f, TL.leave, TL.leave + 40, 1, 0);
  return (
    <>
      <Place at={add(DASH, 0, -330)} dof={5} o={dim}>
        <div
          style={{
            ...panel(18),
            width: 1500,
            height: 104,
            scale: `${bar} 1`,
            transformOrigin: "0 50%",
          }}
        />
      </Place>
      <Part x={-560} at={TL.strip + 8} dim={dim}>
        <Led on size={30} />
      </Part>
      <Part x={-140} at={TL.strip + 22} dim={dim}>
        <div
          style={{
            width: 380,
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 18px",
            borderRadius: 10,
            background: T.bg,
            boxShadow: `inset 0 0 0 1.5px ${T.line}`,
            fontFamily: MONO,
            fontSize: 23,
            color: T.text,
            whiteSpace: "nowrap",
          }}
        >
          <Meter
            size={22}
            live={lit > 0}
            color={lit > 0 ? T.accent : T.lineStrong}
          />
          <span style={{ opacity: lit > 0 ? 1 : 0.45 }}>
            {lit > 0 ? "Air horn — test" : "nothing playing"}
          </span>
        </div>
      </Part>
      <Part x={225} at={TL.strip + 36} dim={dim}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: T.muted,
          }}
        >
          <Icon name="sound" size={30} />
          <div
            style={{
              position: "relative",
              width: 190,
              height: 6,
              borderRadius: 3,
              background: T.lineStrong,
            }}
          >
            <div
              style={{
                width: `${ease(f, TL.strip + 44, TL.strip + 90, 20, 80)}%`,
                height: "100%",
                borderRadius: 3,
                background: T.accent,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${ease(f, TL.strip + 44, TL.strip + 90, 20, 80)}%`,
                top: -17,
                width: 22,
                height: 40,
                marginLeft: -11,
                borderRadius: 5,
                background: T.text,
              }}
            />
          </div>
        </div>
      </Part>
      <Part x={490} at={TL.strip + 50} dim={dim}>
        <Key size={24}>Copy OBS link</Key>
      </Part>
      <Part x={672} at={TL.strip + 62} dim={dim}>
        <Key size={24}>Mute</Key>
      </Part>
      {REWARDS.map((r, i) => {
        const [x, y] = padPos(i);
        const up = sp(f, TL.pads + (i % 3) * 9 + (i < 3 ? 0 : 14), true);
        let glow = i === 0 ? lit : 0;
        if (building && rnd(i * 17 + Math.floor((f - TL.build) / 8.49)) > 0.5)
          glow = 1 - ((f - TL.build) % 8.49) / 8.49;
        glow = Math.min(1, glow + (f > TL.pads + 60 ? bass * 0.18 : 0));
        return (
          <Place
            key={r.title}
            at={add(
              DASH,
              x,
              y + (1 - up) * 420 + (i === 0 ? down * 8 : 0),
              (1 - up) * 260,
            )}
            rx={(1 - up) * 88}
            o={Math.min(1, up * 2) * dim}
            dof={5}
          >
            <Pad {...r} lit={glow} />
          </Place>
        );
      })}
      <Place
        at={add(DASH, mix(420, px + 60, cur), mix(330, py + 30, cur), 40)}
        o={
          lin(f, TL.click - 46, TL.click - 34) *
          lin(f, TL.click + 30, TL.click + 50, 1, 0)
        }
        s={1 - down * 0.14}
      >
        <Cursor />
      </Place>
      {lin(f, TL.click, TL.click + 44) > 0 &&
        lin(f, TL.click, TL.click + 44) < 1 && (
          <Place
            at={add(DASH, px, py, 6)}
            s={1 + lin(f, TL.click, TL.click + 44) * 0.4}
            o={1 - lin(f, TL.click, TL.click + 44)}
          >
            <div
              style={{
                width: 460,
                height: 230,
                borderRadius: 22,
                border: `4px solid ${HUES[0]}`,
              }}
            />
          </Place>
        )}
      <Place at={add(DASH, 0, -560)}>
        <Rise
          lines={["Every reward is a pad."]}
          at={TL.pads - 24}
          out={TL.click - 26}
          size={150}
        />
      </Place>
      <Place at={add(DASH, 0, -560)}>
        <Slam
          text="Press it. It plays."
          at={TL.click - 10}
          out={TL.layers[0] + 6}
          size={150}
          accent={["plays"]}
          stagger={9}
        />
      </Place>
    </>
  );
};

const POOL = ["bruh.mp3", "vine-boom.mp3", "oof.mp3"];

const PoolPanel: React.FC<{ t: number }> = ({ t }) => {
  const pick = t < 30 ? -1 : Math.floor((t - 30) / 26) % POOL.length;
  return (
    <div
      style={{
        ...panel(22),
        width: 620,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {POOL.map((name, k) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            height: 84,
            padding: "0 22px",
            borderRadius: 12,
            fontFamily: MONO,
            fontSize: 30,
            background: k === pick ? "rgba(235,47,150,.16)" : T.surface2,
            boxShadow: `inset 0 0 0 ${k === pick ? 3 : 1.5}px ${k === pick ? HUES[1] : T.line}`,
            translate: `${(1 - sp(t, 10 + k * 7)) * 120}px 0`,
            opacity: sp(t, 10 + k * 7),
          }}
        >
          <Icon
            name={k === pick ? "sound" : "play"}
            size={30}
            color={k === pick ? HUES[1] : T.muted}
          />
          {name}
          {k === pick && (
            <span
              style={{ marginLeft: "auto", color: HUES[1], display: "flex" }}
            >
              <Icon name="shuffle" size={30} />
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const TrimPanel: React.FC<{ t: number }> = ({ t }) => {
  const a = ease(t, 34, 84, 0, 0.26, INOUT);
  const b = ease(t, 48, 98, 1, 0.7, INOUT);
  return (
    <div style={{ ...panel(22), width: 620, padding: 28 }}>
      <div
        style={{
          position: "relative",
          height: 250,
          borderRadius: 14,
          background: T.bg,
          boxShadow: `inset 0 0 0 1.5px ${T.line}`,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 20px",
        }}
      >
        {Array.from({ length: 60 }, (_, k) => {
          const x = k / 59;
          const h =
            (0.15 + 0.8 * rnd(k + 3) * Math.sin(Math.PI * x) ** 0.6) *
            sp(t, 8 + k * 0.5);
          return (
            <div
              key={k}
              style={{
                flex: 1,
                height: `${h * 100}%`,
                borderRadius: 2,
                background: x >= a && x <= b ? T.accent : T.lineStrong,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `calc(20px + (100% - 40px) * ${a})`,
            right: `calc(20px + (100% - 40px) * ${1 - b})`,
            border: `4px solid ${T.accent}`,
            borderRadius: 9,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: 26,
          color: T.muted,
          marginTop: 16,
        }}
      >
        <span>{(a * 4.2).toFixed(1)} s</span>
        <span>{(b * 4.2).toFixed(1)} s</span>
      </div>
    </div>
  );
};

const SAID = "Hello chat, read this out loud!";

const SpeechPanel: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const typed = SAID.slice(0, Math.max(0, Math.floor((t - 24) / 1.5)));
  const spoken = lin(t, 24, 110);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
      }}
    >
      <Card
        scale={1.75}
        user="zeynep"
        nth={7}
        reward="Read my message"
        message={typed}
        progress={spoken}
      />
      <div
        style={{
          ...panel(18),
          width: 600,
          height: 150,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <span style={{ color: T.accent, display: "flex" }}>
          <Icon name="message" size={42} />
        </span>
        <div
          style={{
            flex: 1,
            height: 96,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {Array.from({ length: 40 }, (_, k) => {
            const on = t > 24 && k / 40 < spoken + 0.02;
            const h = on
              ? 0.2 +
                0.8 *
                  Math.abs(
                    Math.sin(k * 1.7 + f / 6) * Math.cos(k * 0.6 - f / 9),
                  )
              : 0.08;
            return (
              <div
                key={k}
                style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  borderRadius: 2,
                  background: on ? T.accent : T.lineStrong,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RegularPanel: React.FC<{ t: number }> = ({ t }) => {
  const land = sp(t, 44, true);
  const fifty = t >= 44;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
      }}
    >
      <div style={{ scale: String(0.74 + 0.26 * land) }}>
        <Card
          scale={2.1}
          user="kaan_tv"
          nth={fifty ? 50 : 49}
          reward="Air horn"
          note={fifty ? "50th redemption!" : undefined}
          progress={lin(t, 44, 120)}
        />
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {["First today", "10th", "50th", "100th"].map((m, k) => {
          const on = k === 2 && fifty;
          return (
            <div
              key={m}
              style={{
                fontFamily: MONO,
                fontSize: 26,
                padding: "12px 20px",
                borderRadius: 10,
                color: on ? T.ink : T.muted,
                background: on ? T.accent : T.surface2,
                boxShadow: on
                  ? "inset 0 -3px 0 rgba(0,0,0,.28)"
                  : `inset 0 0 0 1.5px ${T.line}`,
                opacity: sp(t, 14 + k * 6),
                translate: `0 ${(1 - sp(t, 14 + k * 6)) * 40}px`,
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

const CLAIMS = [
  ["Ten sounds.", "One at random."],
  ["Cut to the", "punchline."],
  ["Reads chat", "out loud."],
  ["Knows your", "regulars."],
];
export const LAYER_Z = [-1150, -850, -550, -250];

/**
 * Four layers stacked in depth in front of the dashboard, one feature each. The camera backs through
 * them while swinging from side to side; each layer swings in as the lens reaches it, and the ones
 * already passed stay behind, out of focus.
 */
export const Layers: React.FC = () => {
  const f = useCurrentFrame();
  const gone = ease(f, TL.leave, TL.leave + 40, 0, 1, IN);
  return (
    <>
      {LAYER_Z.map((z, i) => {
        const t = f - TL.layers[i];
        if (t < -2) return null;
        const side = i % 2 === 0 ? -1 : 1;
        const p = sp(f, TL.layers[i], true);
        const passed =
          i < 3 ? lin(f, TL.layers[i + 1] - 10, TL.layers[i + 1] + 40) : 0;
        const o = Math.min(1, p * 2) * (1 - passed) * (1 - gone);
        return (
          <Fragment key={i}>
            <Place
              at={[
                DASH[0] + side * 345 + side * (1 - p) * 700,
                -600,
                z + gone * 300 - passed * 260,
              ]}
              ry={side * (1 - p) * -80}
              o={o}
              dof={9}
            >
              {i === 0 ? (
                <PoolPanel t={t} />
              ) : i === 1 ? (
                <TrimPanel t={t} />
              ) : i === 2 ? (
                <SpeechPanel t={t} f={f} />
              ) : (
                <RegularPanel t={t} />
              )}
            </Place>
            <Place
              at={[DASH[0] - side * 345, -600, z + gone * 300 - passed * 260]}
              o={(1 - passed) * (1 - gone)}
              dof={9}
            >
              <div style={{ width: 640 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 30,
                    color: T.accent,
                    marginBottom: 14,
                    opacity: sp(f, TL.layers[i] + 4),
                  }}
                >
                  0{i + 1}
                </div>
                <Rise
                  lines={CLAIMS[i]}
                  at={TL.layers[i] + 8}
                  size={92}
                  align="left"
                />
              </div>
            </Place>
          </Fragment>
        );
      })}
    </>
  );
};

const BARS = 30;
const BW = 58;

/**
 * Statistics as a skyline: thirty days of redemptions rise from the floor as solid bars while the
 * camera flies low along them, and the totals count up behind.
 */
export const Skyline: React.FC = () => {
  const f = useCurrentFrame();
  const total = ease(f, TL.bars + 30, TL.bars + 130);
  return (
    <>
      {Array.from({ length: BARS }, (_, i) => {
        const h =
          (90 + 420 * rnd(i + 9) * (0.45 + i / 55)) *
          sp(f, TL.bars + i * 2.6, true);
        if (h < 2) return null;
        const today = i === BARS - 1;
        const face = (c: string): React.CSSProperties => ({
          position: "absolute",
          left: 0,
          top: 0,
          background: c,
        });
        return (
          <Place key={i} at={[SKY[0] - 1190 + i * 82, 0, SKY[2]]} solid>
            <div style={{ width: 0, height: 0, transformStyle: "preserve-3d" }}>
              <div
                style={{
                  ...face(today ? T.accent : "#454a3f"),
                  width: BW,
                  height: h,
                  transform: `translate3d(${-BW / 2}px, ${-h}px, ${BW / 2}px)`,
                }}
              />
              <div
                style={{
                  ...face(today ? "#8dff62" : "#5d6355"),
                  width: BW,
                  height: BW,
                  transform: `translate3d(${-BW / 2}px, ${-h - BW / 2}px, 0) rotateX(90deg)`,
                }}
              />
              <div
                style={{
                  ...face(today ? "#2f9d0a" : "#2f332b"),
                  width: BW,
                  height: h,
                  transform: `translate3d(${-BW}px, ${-h}px, 0) rotateY(90deg)`,
                }}
              />
              <div
                style={{
                  ...face(today ? "#2f9d0a" : "#2f332b"),
                  width: BW,
                  height: h,
                  transform: `translate3d(0, ${-h}px, 0) rotateY(90deg)`,
                }}
              />
            </div>
          </Place>
        );
      })}
      <Place at={add(SKY, 0, -860, -420)} dof={5}>
        <Flip
          text="See what chat loves."
          at={TL.bars + 34}
          out={TL.obs + 10}
          size={150}
          accent={["loves"]}
          stagger={1.3}
        />
      </Place>
      <Place
        at={add(SKY, 0, -690, -420)}
        o={
          lin(f, TL.bars + 50, TL.bars + 70) *
          lin(f, TL.obs + 10, TL.obs + 30, 1, 0)
        }
        dof={5}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 64,
            fontWeight: 500,
            color: T.muted,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: T.text }}>{Math.round(482 * total)}</span>{" "}
          redemptions ·{" "}
          <span style={{ color: T.text }}>
            {Math.round(87700 * total).toLocaleString("en-US")}
          </span>{" "}
          points
        </div>
      </Place>
    </>
  );
};

const KEY_AT: V3 = add(OBS, -420, 46, 20);
const FIELD_AT: V3 = add(OBS, 470, -52, 20);

/** The whole setup: copy the link in the dashboard, paste it into an OBS browser source, the light turns green. */
export const ObsSet: React.FC = () => {
  const f = useCurrentFrame();
  const a = sp(f, TL.obs, true);
  const b = sp(f, TL.obs + 16, true);
  const down =
    lin(f, TL.copy - 4, TL.copy) * lin(f, TL.copy, TL.copy + 12, 1, 0);
  const copied = f >= TL.copy;
  const pasted = f >= TL.paste;
  const on = f >= TL.flip;
  const fly = ease(f, TL.copy + 6, TL.paste, 0, 1, INOUT);
  const cur = ease(f, TL.copy - 40, TL.copy - 4, 0, 1, INOUT);
  return (
    <>
      <Place
        at={add(OBS, -420 - (1 - a) * 500, (1 - a) * 300)}
        ry={(1 - a) * 70}
        o={Math.min(1, a * 2)}
        dof={5}
      >
        <div
          style={{
            ...panel(20),
            width: 640,
            padding: "34px 36px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              scale: String(on ? 0.86 + 0.14 * sp(f, TL.flip, true) : 1),
              transformOrigin: "0 50%",
            }}
          >
            <Led on={on} size={38} />
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <Key primary={!on} size={28} down={down}>
              <Icon name={copied ? "check" : "link"} size={28} width={2.4} />
              {copied ? "Copied" : "Copy OBS link"}
            </Key>
            <Key size={28}>Mute</Key>
          </div>
        </div>
      </Place>
      <Place
        at={add(OBS, 430 + (1 - b) * 500, 10 + (1 - b) * 300)}
        ry={(1 - b) * -70}
        o={Math.min(1, b * 2)}
        dof={5}
      >
        <div
          style={{
            width: 800,
            borderRadius: 16,
            overflow: "hidden",
            fontFamily: UI,
            background: "#1d1f26",
            boxShadow: "inset 0 0 0 1.5px #343844, 0 40px 90px rgba(0,0,0,.5)",
          }}
        >
          <div
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              fontSize: 23,
              color: "#c9cdd6",
              background: "#272a33",
            }}
          >
            Properties for 'Browser'
          </div>
          <div
            style={{
              padding: "28px 30px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              rowGap: 18,
              columnGap: 18,
              alignItems: "center",
              fontSize: 23,
              color: "#9aa0ad",
            }}
          >
            <span>URL</span>
            <div
              style={{
                height: 60,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: 6,
                fontFamily: MONO,
                fontSize: 21,
                color: "#fff",
                background: "#14161b",
                boxShadow: `inset 0 0 0 2.5px ${pasted ? T.accent : "#343844"}`,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {pasted ? "https://audio.mrkaffin.com/overlay/••••••" : ""}
            </div>
            <span>Width</span>
            <div
              style={{
                height: 52,
                width: 180,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: 6,
                fontFamily: MONO,
                color: "#fff",
                background: "#14161b",
                boxShadow: "inset 0 0 0 2px #343844",
              }}
            >
              1920
            </div>
            <span>Height</span>
            <div
              style={{
                height: 52,
                width: 180,
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: 6,
                fontFamily: MONO,
                color: "#fff",
                background: "#14161b",
                boxShadow: "inset 0 0 0 2px #343844",
              }}
            >
              1080
            </div>
          </div>
        </div>
      </Place>
      {fly > 0 && fly < 1 && (
        <Place
          at={[
            mix(KEY_AT[0], FIELD_AT[0], fly),
            mix(KEY_AT[1], FIELD_AT[1], fly) - Math.sin(Math.PI * fly) * 190,
            KEY_AT[2] + Math.sin(Math.PI * fly) * 260,
          ]}
          rz={Math.sin(Math.PI * fly) * -10}
          s={1 - 0.2 * fly}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: MONO,
              fontSize: 26,
              color: T.ink,
              background: T.accent,
              padding: "10px 18px",
              borderRadius: 10,
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="link" size={26} width={2.2} /> /overlay/••••
          </div>
        </Place>
      )}
      <Place
        at={[
          mix(KEY_AT[0] - 260, KEY_AT[0] + 20, cur),
          mix(KEY_AT[1] + 330, KEY_AT[1] + 6, cur),
          KEY_AT[2] + 20,
        ]}
        o={
          lin(f, TL.copy - 40, TL.copy - 28) *
          lin(f, TL.copy + 22, TL.copy + 40, 1, 0)
        }
        s={1 - down * 0.14}
      >
        <Cursor />
      </Place>
      <Place at={add(OBS, 0, -400)}>
        <Rise
          lines={["Paste one link into OBS."]}
          at={TL.obs + 22}
          out={TL.flip - 16}
          size={140}
        />
      </Place>
      <Place at={add(OBS, 0, -400)}>
        <Slam
          text="That's the whole setup."
          at={TL.flip - 2}
          out={TL.build + 30}
          size={140}
          accent={["whole"]}
          stagger={7}
        />
      </Place>
    </>
  );
};
