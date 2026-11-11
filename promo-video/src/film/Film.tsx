import { Audio } from "@remotion/media";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { ding, mouseClick, uiSwitch, whoosh } from "@remotion/sfx";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { camAt, CamKey, Place, Stage } from "./rig";
import { Board, Cable, Floor, Screen } from "./sets-a";
import { Dashboard, LAYER_Z, Layers, ObsSet, Skyline } from "./sets-b";
import { DASH, OBS, SCREEN_Z, TL } from "./timeline";
import { Flip, Rise } from "./type";
import { ease, HUES, IN, Key, lin, Meter, Pad, sp, T } from "./ui";

export const FILM_FRAMES = TL.end;

// One take. The camera's whole flight, from the first pad to the pull-back over everything.
const KEYS: CamKey[] = [
  // pressed up against one pad, then up and back over the board
  { f: 0, t: [-172, 0, 0], yaw: -24, pitch: 83, roll: -10, dolly: -1060 },
  { f: 40, t: [-165, -5, -5], yaw: -19, pitch: 80, roll: -7, dolly: -960 },
  { f: 110, t: [40, -70, -90], yaw: -5, pitch: 60, roll: 0, dolly: -180 },
  { f: 232, t: [0, -210, -230], yaw: 9, pitch: 38, dolly: 400 },
  // tilt up as the screen swings open, then push into the card
  { f: 325, t: [0, -500, SCREEN_Z], yaw: -8, pitch: 7, dolly: 420 },
  { f: 430, t: [-110, -600, SCREEN_Z], yaw: 7, pitch: 4, dolly: 130 },
  { f: 518, t: [-180, -694, SCREEN_Z], yaw: 13, pitch: 2, dolly: -380 },
  // away along the cable, low and banking
  { f: 588, t: [1700, -70, -930], yaw: 34, pitch: 40, roll: 7, dolly: 60 },
  // track along the live strip while it assembles, then back off for the pads
  {
    f: 652,
    t: [DASH[0] - 520, -850, DASH[2]],
    yaw: -17,
    pitch: 6,
    roll: 0,
    dolly: -620,
  },
  { f: 742, t: [DASH[0] + 480, -850, DASH[2]], yaw: 15, pitch: 5, dolly: -620 },
  { f: 835, t: [DASH[0], -660, DASH[2]], yaw: -5, pitch: 9, dolly: 600 },
  // back through the four layers, swinging side to side
  {
    f: 925,
    t: [DASH[0] - 30, -600, LAYER_Z[0]],
    yaw: -19,
    pitch: 6,
    dolly: -190,
  },
  {
    f: 1025,
    t: [DASH[0] + 30, -600, LAYER_Z[1]],
    yaw: 19,
    pitch: 3,
    dolly: -190,
  },
  {
    f: 1125,
    t: [DASH[0] - 30, -600, LAYER_Z[2]],
    yaw: -19,
    pitch: 6,
    dolly: -190,
  },
  {
    f: 1225,
    t: [DASH[0] + 30, -600, LAYER_Z[3]],
    yaw: 19,
    pitch: 3,
    dolly: -190,
  },
  // swing out to the right and fly low along the skyline
  { f: 1310, t: [4150, -200, -760], yaw: 38, pitch: 20, roll: 6, dolly: 230 },
  { f: 1380, t: [4850, -250, -900], yaw: 31, pitch: 13, roll: 2, dolly: 170 },
  { f: 1455, t: [5720, -500, -1050], yaw: -7, pitch: 9, roll: 0, dolly: 700 },
  // on to OBS
  { f: 1535, t: [OBS[0] - 150, -540, OBS[2]], yaw: -13, pitch: 7, dolly: 170 },
  { f: 1645, t: [OBS[0] + 70, -560, OBS[2]], yaw: 10, pitch: 5, dolly: 120 },
  // the build: the whole journey rewound in two seconds, ending high over the board
  {
    f: 1716,
    t: [5600, -300, -900],
    yaw: -20,
    pitch: 22,
    roll: -4,
    dolly: 1500,
  },
  { f: 1756, t: [3000, -450, -1300], yaw: 16, pitch: 20, roll: 4, dolly: 1500 },
  { f: 1800, t: [0, -120, -150], yaw: -10, pitch: 62, roll: -8, dolly: 900 },
  { f: 1830, t: [0, -60, -80], yaw: -16, pitch: 74, roll: -12, dolly: 620 },
];

// After the breath, the logo floats over a floor that keeps sliding by
const END_KEYS: CamKey[] = [
  {
    f: TL.hit - 20,
    t: [-9000, -260, 400],
    yaw: -14,
    pitch: 26,
    roll: -3,
    dolly: 500,
  },
  {
    f: TL.end,
    t: [-9000, -330, -700],
    yaw: 12,
    pitch: 18,
    roll: 2,
    dolly: 260,
  },
];

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const logo = sp(f, TL.hit, true);
  const ring = lin(f, TL.hit, TL.hit + 50);
  return (
    <AbsoluteFill style={{ opacity: lin(f, TL.hit - 14, TL.hit) }}>
      <Stage cam={camAt(END_KEYS, f)}>
        <Floor cx={-9000} />
        {/* unlit pads lying about, sliding past at different depths */}
        {Array.from({ length: 10 }, (_, i) => (
          <Place
            key={i}
            at={[
              -9000 + (i % 2 ? 1 : -1) * (1150 + (i % 3) * 360),
              -1,
              500 - i * 330,
            ]}
            rx={90}
            rz={(i % 2 ? 1 : -1) * 8}
            o={0.75}
          >
            <Pad
              color={HUES[i % HUES.length]}
              lit={Math.max(0, 1 - Math.abs(f - (TL.hit + 6 + i * 9)) / 26)}
              w={320}
              h={200}
            />
          </Place>
        ))}
      </Stage>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          perspective: 1400,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 38,
            transform: `rotateY(${lin(f, TL.hit, TL.end, -11, 7)}deg) rotateX(${lin(f, TL.hit, TL.end, 5, -2)}deg) scale(${lin(f, TL.hit, TL.end, 0.94, 1.05)})`,
          }}
        >
          {ring > 0 && ring < 1 && (
            <div
              style={{
                position: "absolute",
                top: 20,
                width: 300,
                height: 300,
                borderRadius: "50%",
                border: `4px solid ${T.accent}`,
                scale: String(ring * 7),
                opacity: (1 - ring) * 0.6,
              }}
            />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 46 }}>
            <div
              style={{ scale: String(logo), opacity: Math.min(1, logo * 2) }}
            >
              <Meter
                size={160}
                live={f > TL.hit + 26}
                grow={Math.min(1, logo)}
              />
            </div>
            <Flip text="AudioBounty" at={TL.hit + 8} size={190} stagger={2} />
          </div>
          <Rise
            lines={["Kick sound alerts. Self-hosted, open source."]}
            at={TL.hit + 40}
            size={56}
            color={T.muted}
          />
          <div
            style={{
              marginTop: 14,
              opacity: lin(f, TL.hit + 62, TL.hit + 80),
              translate: `0 ${ease(f, TL.hit + 62, TL.hit + 92, 40, 0)}px`,
            }}
          >
            <Key primary size={40}>
              github.com/EmreSarikaya35/Audiobounty
            </Key>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Everything the lens sees. It runs on fractional frames, so the motion blur can sample between them. */
const Take: React.FC<{ bass: number }> = ({ bass }) => {
  const f = useCurrentFrame();
  const fold = ease(f, TL.stop, TL.stop + 22, 0, 1, IN); // the breath: the world folds into a point
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg }}>
      {f < TL.stop + 24 && (
        <Stage
          cam={camAt(KEYS, f)}
          style={{
            scale: String(1 - fold * 0.97),
            rotate: `${fold * 24}deg`,
            opacity: 1 - fold * fold,
          }}
        >
          <Floor />
          <Cable />
          {(f < TL.strip + 80 || f > TL.build - 10) && <Board bass={bass} />}
          {(f < TL.strip + 80 || f > TL.build - 10) && <Screen />}
          {f > TL.travel + 30 && <Dashboard bass={bass} />}
          {f > TL.layers[0] - 4 && f < TL.leave + 44 && <Layers />}
          {f > TL.bars - 4 && <Skyline />}
          {f > TL.obs - 4 && <ObsSet />}
        </Stage>
      )}
      {f > TL.hit - 16 && <Finale />}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The pads breathe with the low end of the soundtrack
  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: staticFile("music.m4a"),
    frame,
    fps,
    windowInSeconds: 10,
  });
  const spectrum = audioData
    ? visualizeAudio({
        fps,
        frame,
        audioData,
        numberOfSamples: 32,
        optimizeFor: "speed",
        dataOffsetInSeconds,
      })
    : [];
  const bass = Math.min(
    1,
    ((spectrum[0] ?? 0) + (spectrum[1] ?? 0) + (spectrum[2] ?? 0)) * 1.1,
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <CameraMotionBlur shutterAngle={200} samples={6}>
        <Take bass={bass} />
      </CameraMotionBlur>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: Math.max(
            lin(frame, 0, 16, 1, 0),
            lin(frame, TL.end - 26, TL.end - 1),
          ),
        }}
      />
      <Audio src={staticFile("music.m4a")} volume={0.7} />
      {[
        TL.travel - 6,
        TL.layers[0] - 20,
        TL.leave - 4,
        TL.obs - 30,
        TL.build,
      ].map((at) => (
        <Sequence
          key={at}
          from={Math.round(at)}
          durationInFrames={70}
          layout="none"
        >
          <Audio src={whoosh} volume={0.4} />
        </Sequence>
      ))}
      <Sequence from={Math.round(TL.card)} layout="none">
        <Audio src={ding} volume={0.55} />
      </Sequence>
      <Sequence
        from={Math.round(TL.click) - 2}
        durationInFrames={30}
        layout="none"
      >
        <Audio src={mouseClick} />
      </Sequence>
      <Sequence from={TL.copy - 2} durationInFrames={30} layout="none">
        <Audio src={mouseClick} />
      </Sequence>
      <Sequence from={TL.flip} durationInFrames={40} layout="none">
        <Audio src={uiSwitch} volume={0.5} />
      </Sequence>
    </AbsoluteFill>
  );
};
