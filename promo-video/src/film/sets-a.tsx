import { evolvePath, getLength } from "@remotion/paths";
import { useCurrentFrame } from "remotion";
import { Place } from "./rig";
import { beat, SCREEN_Z, TL } from "./timeline";
import { Flip, Rise } from "./type";
import { Card, ease, HUES, lin, Meter, MONO, Pad, rnd, sp, T, UI } from "./ui";

/** The floor: a perforated plane that gives every camera move something to slide over. */
export const Floor: React.FC<{ cx?: number }> = ({ cx = 4400 }) => (
  <>
    {/* tiles, because one plane this size is more than the compositor will rasterize */}
    {[-2, -1, 0, 1, 2].flatMap((i) =>
      [-1, 0, 1].map((j) => (
        <Place
          key={`${i} ${j}`}
          at={[cx + i * 3600, 2, -1000 + j * 3600]}
          rx={90}
          keep
        >
          <div
            style={{
              width: 3600,
              height: 3600,
              backgroundImage:
                "radial-gradient(circle, rgba(238,240,232,.16) 3px, transparent 4.5px)",
              backgroundSize: "90px 90px",
            }}
          />
        </Place>
      )),
    )}
  </>
);

// The signal's route on the floor, from the stream screen to the dashboard, the statistics and OBS.
// Local coordinates of a 9200 x 2400 plane centred on world (4400, -1000).
const CABLE =
  "M960 1680 C1900 1680 2100 820 3200 820 S4700 1500 5800 1500 S7200 820 8200 820";
const CABLE_LEN = getLength(CABLE);

/** The cable draws itself ahead of the camera, and pulses of signal run along the part that exists. */
export const Cable: React.FC = () => {
  const f = useCurrentFrame();
  const drawn =
    f < TL.leave
      ? ease(f, TL.travel - 10, TL.strip + 30, 0, 0.36)
      : f < TL.obs - 40
        ? ease(f, TL.leave, TL.bars + 60, 0.36, 0.69)
        : ease(f, TL.obs - 40, TL.obs + 60, 0.69, 1);
  if (drawn <= 0) return null;
  const reveal = evolvePath(drawn, CABLE);
  return (
    <>
      {/* printed on the floor beside the cable, read as the camera skims over it */}
      <Place at={[1950, -1, -1010]} rx={90} rz={-24}>
        <Flip
          text="Kick to OBS, in a blink."
          at={TL.travel + 14}
          out={TL.strip + 40}
          size={150}
          accent={["blink"]}
          stagger={1.2}
        />
      </Place>
      <Place at={[4400, 0, -1000]} rx={90} keep>
        <svg
          width={9200}
          height={2400}
          viewBox="0 0 9200 2400"
          style={{ overflow: "visible" }}
        >
          <path
            d={CABLE}
            fill="none"
            stroke={T.accent}
            strokeOpacity={0.4}
            strokeWidth={40}
            strokeLinecap="round"
            strokeDasharray={reveal.strokeDasharray}
            strokeDashoffset={reveal.strokeDashoffset}
          />
          {[0, 1, 2].map((k) => {
            const head =
              ((f * 26 + (k * CABLE_LEN) / 3) % CABLE_LEN) / CABLE_LEN;
            if (head > drawn) return null;
            return (
              <path
                key={k}
                d={CABLE}
                fill="none"
                stroke="#c8ffb0"
                strokeWidth={58}
                strokeLinecap="round"
                strokeDasharray={`${CABLE_LEN * 0.035} ${CABLE_LEN}`}
                strokeDashoffset={-head * CABLE_LEN}
              />
            );
          })}
        </svg>
      </Place>
    </>
  );
};

const NAMES = [
  "Rimshot",
  "Bruh",
  "Vine boom",
  "Drum roll",
  "Sad trombone",
  "Air horn",
  "Read my message",
  "Oof",
  "Crickets",
  "Applause",
  "Wow",
  "GG",
];
const COSTS = [50, 150, 200, 250, 200, 100, 500, 80, 120, 300, 150, 60];
const PW = 320;
const PH = 200;
export const HERO = 5; // the pad the film opens on
const padAt = (i: number): [number, number] => [
  ((i % 4) - 1.5) * (PW + 24),
  (Math.floor(i / 4) - 1) * (PH + 24),
];

/** A pulse that snaps on at `at` and decays. */
const hit = (f: number, at: number, len = 44) =>
  f < at - 2 ? 0 : Math.max(0, 1 - (f - at) / len) ** 2;

/**
 * The board: twelve pads lying on the floor. The film opens pressed against one of them; when it is hit
 * the others ripple out from it, and from then on they flash with the beat.
 */
export const Board: React.FC<{ bass: number }> = ({ bass }) => {
  const f = useCurrentFrame();
  const [hx, hy] = padAt(HERO);
  return (
    <>
      {NAMES.map((title, i) => {
        const [x, y] = padAt(i);
        const hero = i === HERO;
        const reach = Math.hypot(x - hx, y - hy) / 26; // the ripple reaches far pads later
        const up = hero ? 1 : sp(f, TL.words[0] + 4 + reach, true);
        let lit = hero ? Math.max(hit(f, TL.words[0], 80), 0) : 0;
        for (let k = 1; k <= 5; k++)
          if ((i * 7 + k * 3) % 5 === 0) lit = Math.max(lit, hit(f, beat(k)));
        if (f > TL.build - 4 && f < TL.stop + 30) {
          const step = Math.floor((f - TL.build) / 8.49);
          if (rnd(i * 31 + step) > 0.55)
            lit = Math.max(lit, 1 - ((f - TL.build) % 8.49) / 8.49);
        }
        lit = Math.min(1, lit + (f > TL.words[0] ? bass * 0.28 : 0));
        return (
          <Place
            key={i}
            at={[x, -1 - lit * 10, y]}
            rx={90}
            s={0.2 + 0.8 * up}
            o={Math.min(1, up * 2)}
          >
            <Pad
              title={title}
              cost={COSTS[i]}
              color={HUES[i % HUES.length]}
              lit={lit}
              w={PW}
              h={PH}
            />
          </Place>
        );
      })}
      {/* the ring of the first hit */}
      {[0, 14].map((d) => {
        const r = lin(f, TL.words[0] + d, TL.words[0] + d + 50);
        return r > 0 && r < 1 ? (
          <Place
            key={d}
            at={[hx, -3, hy]}
            rx={90}
            s={1 + r * 2.4}
            o={(1 - r) * 0.7}
          >
            <div
              style={{
                width: PW,
                height: PH,
                borderRadius: 22,
                border: `4px solid ${HUES[HERO % HUES.length]}`,
              }}
            />
          </Place>
        ) : null;
      })}
      {/* the opening line, one word per beat, leaning back to face the camera as it rises */}
      {["Chat", "spends", "points."].map((word, k) => (
        <Place key={word} at={[0, -250, -350]} rx={44}>
          <Flip
            text={word}
            at={TL.words[k] - 6}
            out={k < 2 ? TL.words[k + 1] - 22 : 200}
            size={250}
            accent={["points"]}
          />
        </Place>
      ))}
    </>
  );
};

const SW = 1500;
const SH = 844;
const VW = 1140; // the stream picture; the rest is chat
const CHAT: [string, string][] = [
  ["kaan_tv", "that clutch"],
  ["selin", "GG"],
  ["ozzy", "play the horn"],
  ["deniz77", "lmao"],
  ["vortex", "again again"],
  ["ece", "W stream"],
  ["bora", "no way"],
  ["elif", "HORN"],
];

/** What is on stream: a made-up game, a neon road running to the horizon. */
const Game: React.FC<{ f: number }> = ({ f }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background:
        "linear-gradient(180deg, #0b1020 0%, #1a1436 46%, #2a1238 58%, #0c0a14 58%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 250,
        width: 300,
        height: 300,
        marginLeft: -150,
        borderRadius: "50%",
        background: "linear-gradient(180deg, #ffb547, #eb2f96)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "58%",
        bottom: 0,
        perspective: 300,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-50%",
          width: "200%",
          top: 0,
          height: 900,
          transformOrigin: "50% 0",
          transform: "rotateX(72deg)",
          backgroundImage:
            "linear-gradient(rgba(19,194,194,.8) 3px, transparent 3px), linear-gradient(90deg, rgba(19,194,194,.8) 3px, transparent 3px)",
          backgroundSize: "120px 120px",
          backgroundPosition: `0 ${(f * 5) % 120}px`,
        }}
      />
    </div>
    <div
      style={{
        position: "absolute",
        left: 30,
        bottom: 30,
        width: 230,
        height: 146,
        borderRadius: 12,
        background: "radial-gradient(60% 70% at 50% 40%, #6b5a52, #2b2522 70%)",
        boxShadow: "0 0 0 3px rgba(255,255,255,.14)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 30,
          width: 58,
          height: 58,
          marginLeft: -29,
          borderRadius: "50%",
          background: "#c9a48a",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          width: 124,
          height: 52,
          marginLeft: -62,
          borderRadius: "62px 62px 0 0",
          background: "#3b3f52",
        }}
      />
    </div>
  </div>
);

/**
 * The stream screen. It lies face up behind the board until the groove starts, then swings up on its
 * bottom edge like a lid. A viewer redeems in chat and the card lands on stream.
 */
export const Screen: React.FC = () => {
  const f = useCurrentFrame();
  const open = sp(f, TL.drop - 4, true);
  const power = lin(f, TL.drop + 6, TL.drop + 26);
  const land = sp(f, TL.card, true);
  const said = sp(f, TL.redeem);
  const scroll = lin(f, TL.drop, TL.travel + 60, 0, 1);
  return (
    <>
      <Place
        at={[0, 0, SCREEN_Z]}
        rx={88 * (1 - open)}
        anchor="bottom"
        o={lin(f, TL.drop - 26, TL.drop - 6)}
      >
        <div
          style={{
            width: SW,
            height: SH,
            borderRadius: 22,
            overflow: "hidden",
            background: "#050605",
            boxShadow: `0 0 0 3px ${T.lineStrong}`,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "relative",
              width: VW,
              height: SH,
              opacity: power,
            }}
          >
            <Game f={f} />
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 24,
                padding: "5px 14px",
                borderRadius: 6,
                background: "#e5322d",
                color: "#fff",
                fontFamily: UI,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              LIVE
            </div>
            {[0, 18, 36].map((d) => {
              const r = lin(f, TL.card + 6 + d, TL.card + 70 + d);
              return r > 0 && r < 1 ? (
                <div
                  key={d}
                  style={{
                    position: "absolute",
                    left: VW / 2,
                    top: 150,
                    width: 430,
                    height: 124,
                    marginLeft: -215,
                    marginTop: -62,
                    borderRadius: 16,
                    border: `3px solid ${T.accent}`,
                    scale: String(1 + r * 1.7),
                    opacity: (1 - r) * 0.6,
                  }}
                />
              ) : null;
            })}
            <div
              style={{
                position: "absolute",
                left: VW / 2,
                top: 150,
                translate: `-50% calc(-50% + ${(1 - land) * -150}px)`,
                scale: String(0.8 + land * 0.2),
                opacity: Math.min(1, land * 2),
              }}
            >
              <Card
                scale={1.5}
                user="mert_42"
                nth={12}
                reward="Air horn"
                message="Hello stream"
                progress={lin(f, TL.card + 6, TL.travel + 30)}
              />
            </div>
          </div>
          <div
            style={{
              width: SW - VW,
              height: SH,
              background: T.bg,
              borderLeft: `2px solid ${T.line}`,
              fontFamily: UI,
              padding: 22,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              opacity: power,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 15,
                translate: `0 ${(1 - scroll) * 150 + (1 - said) * 100}px`,
              }}
            >
              {CHAT.map(([u, t], k) => (
                <div
                  key={u}
                  style={{
                    fontSize: 22,
                    color: "rgba(238,240,232,.85)",
                    opacity: lin(f, TL.drop + 10 + k * 5, TL.drop + 22 + k * 5),
                  }}
                >
                  <b
                    style={{
                      color: HUES[(k + 2) % HUES.length],
                      fontWeight: 600,
                    }}
                  >
                    {u}
                  </b>{" "}
                  {t}
                </div>
              ))}
              <div
                style={{
                  fontSize: 22,
                  padding: "13px 15px",
                  borderRadius: 9,
                  background: "rgba(83,252,24,.1)",
                  boxShadow: "inset 0 0 0 2px rgba(83,252,24,.4)",
                  opacity: said,
                  scale: String(0.9 + said * 0.1),
                  transformOrigin: "0 100%",
                }}
              >
                <b style={{ color: T.accent }}>mert_42</b> redeemed{" "}
                <b>Air horn</b>
                <div
                  style={{
                    color: T.muted,
                    fontFamily: MONO,
                    fontSize: 18,
                    marginTop: 3,
                  }}
                >
                  100 points
                </div>
              </div>
            </div>
          </div>
        </div>
      </Place>
      {/* its status line stands on the floor in front of it */}
      <Place
        at={[-430, -34, SCREEN_Z + 60]}
        o={power * (1 - lin(f, TL.travel + 40, TL.travel + 70))}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: MONO,
            fontSize: 26,
            color: f > TL.card ? T.accent : T.muted,
            whiteSpace: "nowrap",
          }}
        >
          <Meter
            size={24}
            live={f > TL.card}
            color={f > TL.card ? T.accent : T.muted}
          />
          {f > TL.card ? "now playing · Air horn" : "listening for redemptions"}
        </div>
      </Place>
      <Place at={[0, -1010, SCREEN_Z]} dof={6}>
        <Rise
          lines={["Your stream plays it."]}
          at={TL.card + 14}
          out={TL.travel - 26}
          size={150}
          accent={["plays"]}
        />
      </Place>
    </>
  );
};
