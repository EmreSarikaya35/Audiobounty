import { Audio } from "@remotion/media";
import { ding, mouseClick, uiSwitch } from "@remotion/sfx";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Kinetic } from "../lib/Kinetic";
import { EASE_IN_OUT, mix, pop, track, tw } from "../lib/motion";
import { Backdrop, C, Cursor, Icon, Key, MONO, panel, StatusLed } from "../lib/theme";
import { Cam, Obj, World } from "../lib/World";

export const SETUP_FRAMES = 300;
const COPY = 100; // the streamer presses "Copy OBS link"
const SOURCE = 165; // the link lands in the OBS browser source
const FLIP = 222; // the signal light turns green

const URL_TEXT = "https://audio.mrkaffin.com/overlay/";

// The dashboard's live strip on the left, the OBS dialog on the right
const STRIP = { x: -520, y: -60 };
const OBS = { x: 520, y: 20 };
const KEY = { x: STRIP.x + 190, y: STRIP.y + 44 };
const FIELD = { x: OBS.x - 40, y: OBS.y - 34 };

const cam = (f: number): Cam => ({
  x: track(f, [[0, STRIP.x * 0.7], [COPY, STRIP.x * 0.5], [SOURCE + 10, OBS.x * 0.5], [FLIP + 20, 0], [300, 0]]),
  y: track(f, [[0, 40], [300, -10]]),
  dolly: track(f, [[0, -500], [COPY, 80], [SOURCE + 10, 80], [FLIP + 20, -90], [300, -40]]),
  rx: track(f, [[0, 10], [COPY, 3], [300, 2]]),
  ry: track(f, [[0, 16], [COPY, 6], [SOURCE + 10, -6], [FLIP + 20, 0]]),
});

export const Setup: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const down = tw(f, COPY - 4, COPY, 0, 1) * tw(f, COPY, COPY + 12, 1, 0);
  const copied = f >= COPY;
  const fly = tw(f, COPY + 8, SOURCE, 0, 1, EASE_IN_OUT);
  const pasted = f >= SOURCE;
  const on = f >= FLIP;
  const flip = pop(f, fps, FLIP, 10, 140);
  const cx = track(f, [[40, STRIP.x - 300], [COPY - 6, KEY.x + 30]], EASE_IN_OUT);
  const cy = track(f, [[40, STRIP.y + 320], [COPY - 6, KEY.y + 10]], EASE_IN_OUT);
  return (
    <Backdrop>
      <World cam={cam}>
        {/* the dashboard's live strip */}
        <Obj x={STRIP.x} y={STRIP.y} o={tw(f, 0, 20, 0, 1)}>
          <div style={{ ...panel(20), width: 760, padding: "30px 32px", display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ scale: String(on ? 0.9 + 0.1 * flip : 1), transformOrigin: "0 50%" }}>
              <StatusLed on={on} size={34} />
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <Key primary={!on} size={26} down={down}>
                {copied ? <Icon name="check" size={26} width={2.6} /> : <Icon name="link" size={26} width={2} />}
                {copied ? "Copied" : "Copy OBS link"}
              </Key>
              <Key size={26}>Mute</Key>
            </div>
          </div>
        </Obj>
        {/* OBS: properties of a browser source */}
        <Obj x={OBS.x} y={OBS.y} o={tw(f, 20, 44, 0, 1)}>
          <div style={{ ...panel(16), width: 820, overflow: "hidden", background: "#1d1f26", boxShadow: "inset 0 0 0 1.5px #343844, 0 40px 90px rgba(0,0,0,.5)" }}>
            <div style={{ height: 58, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 22, color: "#c9cdd6", background: "#272a33" }}>Properties for 'Browser'</div>
            <div style={{ padding: "28px 30px 30px", display: "grid", gridTemplateColumns: "110px 1fr", rowGap: 18, columnGap: 18, alignItems: "center", fontSize: 22, color: "#9aa0ad" }}>
              <span>URL</span>
              <div
                style={{
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  borderRadius: 6,
                  fontFamily: MONO,
                  fontSize: 21,
                  color: "#fff",
                  background: "#14161b",
                  boxShadow: `inset 0 0 0 2px ${pasted ? C.accent : "#343844"}`,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {pasted ? `${URL_TEXT}••••••••` : ""}
              </div>
              <span>Width</span>
              <div style={{ height: 50, width: 180, display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 6, fontFamily: MONO, color: "#fff", background: "#14161b", boxShadow: "inset 0 0 0 2px #343844" }}>1920</div>
              <span>Height</span>
              <div style={{ height: 50, width: 180, display: "flex", alignItems: "center", padding: "0 16px", borderRadius: 6, fontFamily: MONO, color: "#fff", background: "#14161b", boxShadow: "inset 0 0 0 2px #343844" }}>1080</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 30px 26px" }}>
              <div style={{ fontSize: 22, color: "#fff", padding: "10px 36px", borderRadius: 6, background: pasted ? "#3b5bdb" : "#343844" }}>OK</div>
            </div>
          </div>
        </Obj>
        {/* the copied link travels from the key to the URL field */}
        <Obj x={mix(KEY.x, FIELD.x, fly)} y={mix(KEY.y, FIELD.y, fly) - Math.sin(Math.PI * fly) * 150} z={70} o={fly > 0 && fly < 1 ? 1 : 0} s={1 - 0.2 * fly}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: MONO, fontSize: 24, color: C.accentInk, background: C.accent, padding: "10px 18px", borderRadius: 10, whiteSpace: "nowrap" }}>
            <Icon name="link" size={24} width={2.2} /> /overlay/••••
          </div>
        </Obj>
        <Obj x={cx} y={cy} z={80} o={tw(f, 40, 56, 0, 1) * tw(f, COPY + 20, COPY + 40, 1, 0)} s={1 - down * 0.12}>
          <Cursor />
        </Obj>
      </World>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 110px 130px" }}>
        <Kinetic text="Paste one link into OBS." start={20} out={150} size={64} align="left" />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 110px 130px" }}>
        <Kinetic text="That's the whole setup." start={175} out={286} size={64} align="left" accent={["whole"]} />
      </AbsoluteFill>
      <Sequence from={COPY - 3} durationInFrames={30} layout="none">
        <Audio src={mouseClick} />
      </Sequence>
      <Sequence from={SOURCE} layout="none">
        <Audio src={ding} volume={0.4} />
      </Sequence>
      <Sequence from={FLIP} durationInFrames={40} layout="none">
        <Audio src={uiSwitch} volume={0.5} />
      </Sequence>
    </Backdrop>
  );
};
