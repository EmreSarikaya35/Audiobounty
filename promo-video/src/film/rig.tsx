import { noise2D } from "@remotion/noise";
import { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";

// One world, one camera. The camera orbits a target point: `t` is what it looks at, yaw and pitch are
// where it stands around that point (pitch 90 looks straight down at the floor), dolly is how far it
// has backed away. World axes: x right, y down (the floor is y = 0, up is negative), z towards the viewer.
export type V3 = [number, number, number];
export type CamKey = {
  f: number;
  t: V3;
  yaw: number;
  pitch: number;
  roll?: number;
  dolly: number;
};
export type Cam = {
  t: V3;
  yaw: number;
  pitch: number;
  roll: number;
  dolly: number;
};

export const PERSPECTIVE = 1400;
const RAD = Math.PI / 180;

/**
 * A smooth curve through keyframes (monotone cubic Hermite): velocity is continuous, so the camera never
 * stops and restarts between keys, and it never overshoots a key either.
 */
const curve = (f: number, ks: number[], vs: number[]) => {
  const n = ks.length;
  if (f <= ks[0]) return vs[0];
  if (f >= ks[n - 1]) return vs[n - 1];
  let i = 0;
  while (f > ks[i + 1]) i++;
  const slope = (j: number) => (vs[j + 1] - vs[j]) / (ks[j + 1] - ks[j]);
  const tangent = (j: number) => {
    if (j === 0) return slope(0);
    if (j === n - 1) return slope(n - 2);
    const a = slope(j - 1);
    const b = slope(j);
    if (a * b <= 0) return 0;
    const m = (a + b) / 2;
    return (
      Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(a), 3 * Math.abs(b))
    );
  };
  const h = ks[i + 1] - ks[i];
  const s = (f - ks[i]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * vs[i] +
    (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * vs[i + 1] +
    (s3 - s2) * h * tangent(i + 1)
  );
};

/** The camera at frame f (fractional frames welcome), with a little handheld drift so it is never still. */
export const camAt = (keys: CamKey[], f: number): Cam => {
  const ks = keys.map((k) => k.f);
  const ch = (get: (k: CamKey) => number) => curve(f, ks, keys.map(get));
  const drift = (seed: string, amp: number) => noise2D(seed, f / 150, 0) * amp;
  return {
    t: [
      ch((k) => k.t[0]) + drift("x", 16),
      ch((k) => k.t[1]) + drift("y", 11),
      ch((k) => k.t[2]),
    ],
    yaw: ch((k) => k.yaw) + drift("yaw", 1.3),
    pitch: ch((k) => k.pitch) + drift("pitch", 0.8),
    roll: ch((k) => k.roll ?? 0) + drift("roll", 0.6),
    dolly: ch((k) => k.dolly),
  };
};

/** How far a world point is in front of the lens, along the view axis. */
export const eyeDist = (c: Cam, p: V3) => {
  const x = p[0] - c.t[0];
  let y = p[1] - c.t[1];
  let z = p[2] - c.t[2];
  const a = -c.yaw * RAD;
  z = -x * Math.sin(a) + z * Math.cos(a);
  const b = -c.pitch * RAD;
  [y, z] = [
    y * Math.cos(b) - z * Math.sin(b),
    y * Math.sin(b) + z * Math.cos(b),
  ];
  return PERSPECTIVE + c.dolly - z;
};

const CamCtx = createContext<Cam>({
  t: [0, 0, 0],
  yaw: 0,
  pitch: 0,
  roll: 0,
  dolly: 0,
});
export const useCam = () => useContext(CamCtx);

/** The world as seen through the camera. */
export const Stage: React.FC<{
  cam: Cam;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ cam, children, style }) => (
  <AbsoluteFill
    style={{ perspective: PERSPECTIVE, overflow: "hidden", ...style }}
  >
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        transformStyle: "preserve-3d",
        transform: `translateZ(${-cam.dolly}px) rotateZ(${cam.roll}deg) rotateX(${-cam.pitch}deg) rotateY(${-cam.yaw}deg) translate3d(${-cam.t[0]}px, ${-cam.t[1]}px, ${-cam.t[2]}px)`,
      }}
    >
      <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>
    </div>
  </AbsoluteFill>
);

/**
 * Something placed in the world. It fades out before it would pass through the lens, and with `dof` it
 * goes soft when it is off the focal plane (the camera's target), which is what gives the shot its depth.
 * `anchor` is the point of the content that sits at `at`: its centre, or the middle of its bottom edge
 * (a hinge on the floor). `solid` keeps 3D children intact (no fade, no blur); `keep` is for things so big
 * the camera can stand on them (the floor), which must not vanish when their centre is behind the lens.
 */
export const Place: React.FC<{
  at: V3;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
  o?: number;
  dof?: number;
  anchor?: "center" | "bottom";
  solid?: boolean;
  keep?: boolean;
  children: React.ReactNode;
}> = ({
  at,
  rx = 0,
  ry = 0,
  rz = 0,
  s = 1,
  o = 1,
  dof = 0,
  anchor = "center",
  solid = false,
  keep = false,
  children,
}) => {
  const cam = useCam();
  const d = eyeDist(cam, at);
  if ((!keep && d < 90) || o <= 0.002) return null;
  const near = keep ? 1 : Math.min(1, Math.max(0, (d - 90) / 300));
  const focus = PERSPECTIVE + cam.dolly;
  const soft = dof ? Math.min(18, (Math.abs(d - focus) / focus) * dof) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transformStyle: "preserve-3d",
        transform: `translate3d(${at[0]}px, ${at[1]}px, ${at[2]}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translate(-50%, ${anchor === "bottom" ? "-100%" : "-50%"})`,
        ...(solid
          ? {}
          : {
              opacity: o * near,
              filter: soft > 0.5 ? `blur(${soft.toFixed(1)}px)` : undefined,
            }),
      }}
    >
      {children}
    </div>
  );
};
