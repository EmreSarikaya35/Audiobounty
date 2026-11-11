import { useCurrentFrame } from "remotion";
import { DISPLAY, ease, IN, sp, T } from "./ui";

type Common = {
  text: string;
  at: number;
  out?: number;
  size: number;
  color?: string;
  accent?: string[];
  align?: "left" | "center";
};

const base = (
  size: number,
  color: string,
  align: "left" | "center",
): React.CSSProperties => ({
  fontFamily: DISPLAY,
  fontSize: size,
  fontWeight: 700,
  letterSpacing: "-0.045em",
  lineHeight: 1.02,
  color,
  whiteSpace: "nowrap",
  textAlign: align,
});

/** Letters flip up out of the baseline one after another, sharpening as they land; they leave upward into blur. */
export const Flip: React.FC<Common & { stagger?: number }> = ({
  text,
  at,
  out,
  size,
  color = T.text,
  accent = [],
  align = "center",
  stagger = 1.6,
}) => {
  const f = useCurrentFrame();
  let n = 0;
  return (
    <div style={{ ...base(size, color, align), perspective: 1000 }}>
      {text.split(" ").map((word, w) => (
        <span
          key={w}
          style={{
            display: "inline-block",
            marginRight: w < text.split(" ").length - 1 ? size * 0.24 : 0,
            color: accent.includes(word.replace(/[.,!]/g, ""))
              ? T.accent
              : undefined,
          }}
        >
          {[...word].map((ch) => {
            const i = n++;
            const p = sp(f, at + i * stagger, true);
            const leave =
              out === undefined
                ? 0
                : ease(f, out + i * 0.7, out + i * 0.7 + 16, 0, 1, IN);
            const shown = Math.min(1, p) * (1 - leave);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, p * 1.6) * (1 - leave),
                  transform: `translateY(${(1 - p) * 0.6 - leave * 0.5}em) rotateX(${(1 - p) * -90 + leave * 50}deg)`,
                  transformOrigin: "50% 100%",
                  filter:
                    shown < 0.97
                      ? `blur(${((1 - shown) * size) / 12}px)`
                      : undefined,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

/** Words slam in from far too big and out of focus, one per beat of the stagger. */
export const Slam: React.FC<Common & { stagger?: number }> = ({
  text,
  at,
  out,
  size,
  color = T.text,
  accent = [],
  align = "center",
  stagger = 5,
}) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={base(size, color, align)}>
      {words.map((word, i) => {
        const p = sp(f, at + i * stagger, true);
        const leave =
          out === undefined
            ? 0
            : ease(f, out + i * 2, out + i * 2 + 16, 0, 1, IN);
        const shown = Math.min(1, p) * (1 - leave);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: i < words.length - 1 ? size * 0.24 : 0,
              color: accent.includes(word.replace(/[.,!]/g, ""))
                ? T.accent
                : undefined,
              opacity: Math.min(1, p * 2) * (1 - leave),
              scale: String(1 + (1 - p) * 1.5 + leave * 0.25),
              translate: `0 ${leave * -0.5}em`,
              filter:
                shown < 0.97
                  ? `blur(${((1 - shown) * size) / 7}px)`
                  : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Each line rises from behind its own baseline, like type coming up through a slot; it leaves the same way. */
export const Rise: React.FC<
  Omit<Common, "text"> & { lines: string[]; stagger?: number }
> = ({
  lines,
  at,
  out,
  size,
  color = T.text,
  accent = [],
  align = "center",
  stagger = 7,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={base(size, color, align)}>
      {lines.map((line, i) => {
        const p = sp(f, at + i * stagger);
        const leave =
          out === undefined
            ? 0
            : ease(f, out + i * 3, out + i * 3 + 18, 0, 1, IN);
        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              padding: `${size * 0.06}px ${size * 0.08}px ${size * 0.12}px`,
              margin: `0 ${-size * 0.08}px`,
            }}
          >
            <div
              style={{
                translate: `0 ${(1 - p) * 115 - leave * 115}%`,
                rotate: `${(1 - p) * 4}deg`,
                transformOrigin: "0 100%",
              }}
            >
              {line.split(" ").map((word, w) => (
                <span
                  key={w}
                  style={{
                    color: accent.includes(word.replace(/[.,!]/g, ""))
                      ? T.accent
                      : undefined,
                  }}
                >
                  {word}{" "}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
