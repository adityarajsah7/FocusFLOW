"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Mood = "cozy" | "fun" | "angry" | "tantrum";
const moods: Mood[] = ["cozy", "fun", "angry", "tantrum"];
const lines: Record<Mood, string[]> = {
  cozy: ["My calendar says nap. All day.", "Currently buffering a purr…", "I put the rest in forest.", "Productivity? I knead a minute.", "This meeting could have been a cuddle.", "Charging. Please supply sunshine."],
  fun: ["One brain cell. Unlimited zoomies.", "I caught a thought! It escaped.", "My cardio is chasing absolutely nothing.", "Professional keyboard dancer. No refunds.", "That was my warm-up. For my nap.", "Tiny paws. Suspiciously big plans."],
  angry: ["I have filed a complaint with the sofa.", "Your apology needs more tuna.", "I’m not judging. My eyebrows are.", "Do not disturb. I’m disturbing myself.", "The bowl is half empty. A catastrophe.", "I demand a quieter loud silence."],
  tantrum: ["I asked for a snack, not character development.", "My dramatic exit is three steps long.", "Nobody understands my empty bowl.", "I shall recover… on your keyboard.", "This is my tiny villain origin story.", "Five cuddles. Final offer. Okay, six."],
};
const moves: Record<Mood, string[]> = { cozy: ["stretch", "cuddle", "knead", "snooze"], fun: ["double-hop", "wiggle", "twirl", "hop"], angry: ["huff", "stomp", "peek", "huff"], tantrum: ["flop", "wobble", "stomp", "dramatic"] };
const idleMoves: Record<Mood, string[]> = { cozy: ["settle", "stretch", "snooze"], fun: ["peek", "wiggle", "double-hop"], angry: ["peek", "huff", "settle"], tantrum: ["wobble", "peek", "flop"] };

export function PeaceCat({ active }: { active: boolean }) {
  const [mood, setMood] = useState<Mood>("cozy");
  const [reaction, setReaction] = useState("idle");
  const [message, setMessage] = useState("Saved you a spot.");
  const [bubble, setBubble] = useState(false);
  const [burst, setBurst] = useState(0);
  const clicks = useRef(0);
  const finish = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      if (document.hidden) return;
      setReaction((current) => current === "idle" ? idleMoves[mood][tick % 3] : current);
    }, 6500);
    return () => clearInterval(timer);
  }, [active, mood]);
  useEffect(() => () => { if (finish.current) clearTimeout(finish.current); if (hide.current) clearTimeout(hide.current); }, []);

  function react(next = mood) {
    if (finish.current) clearTimeout(finish.current);
    if (hide.current) clearTimeout(hide.current);
    setMood(next);
    const turn = clicks.current++;
    setMessage(lines[next][turn % lines[next].length]);
    setBubble(true);
    setBurst((value) => value + 1);
    setReaction(moves[next][turn % moves[next].length]);
    finish.current = setTimeout(() => setReaction("idle"), 2900);
    hide.current = setTimeout(() => setBubble(false), 5200);
  }

  return <aside className={`companion mood-${mood} doing-${reaction} ${active ? "companion-active" : ""}`} aria-label="Your cat companion">
    <div className={`companion-speech ${bubble ? "is-visible" : ""}`} role="status">{message}</div>
    <button ref={button} type="button" className="companion-touch" aria-label={`Pet your ${mood} cat`} onClick={() => react()}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--lean", `${((event.clientX - bounds.left) / bounds.width - .5) * 8}deg`);
      }}
      onPointerLeave={() => button.current?.style.setProperty("--lean", "0deg")}>
      <span className="companion-glow" aria-hidden="true" />
      <span className="companion-ground" aria-hidden="true" />
      <span className="companion-comic" aria-hidden="true">{reaction === "snooze" ? "z z Z" : reaction === "knead" ? "purr…" : reaction === "stomp" ? "hmph!" : reaction === "double-hop" ? "boing!" : reaction === "dramatic" ? "WHY." : reaction === "twirl" ? "ta-da!" : ""}</span>
      <span className="companion-lean"><span key={burst} className={`companion-motion reaction-${reaction}`} onAnimationEnd={(event) => { if (event.target === event.currentTarget) setReaction("idle"); }}>
        {moods.map((pose) => <span key={pose} className={`companion-pose ${pose === mood ? "is-current" : ""}`}><Image src={`/cat-${pose}.png`} width={1221} height={1289} alt="" draggable={false} /></span>)}
      </span></span>
      {burst > 0 && <span key={`hearts-${burst}`} className="companion-burst" aria-hidden="true">{[0,1,2,3].map((i) => <i key={i} style={{ "--i": i } as React.CSSProperties}>{mood === "angry" ? "✦" : mood === "tantrum" ? "✧" : "♥"}</i>)}</span>}
    </button>
    <p className="companion-hint">a little company · tap to pet</p>
    <div className="companion-moods" aria-label="Cat mood">{moods.map((item) => <button key={item} type="button" aria-pressed={mood === item} onClick={() => react(item)}>{item === "angry" ? "Grumpy" : item === "tantrum" ? "Dramatic" : item === "fun" ? "Playful" : "Cozy"}</button>)}</div>
  </aside>;
}
