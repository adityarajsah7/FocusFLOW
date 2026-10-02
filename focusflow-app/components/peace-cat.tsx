"use client";

import { catStickers, StickerCat, type CatSticker } from "./cat-stickers";
import "./cat-stickers.css";
import { useEffect, useRef, useState } from "react";

type Mood = "cozy" | "fun" | "angry" | "tantrum";
const moods: Mood[] = ["cozy", "fun", "angry", "tantrum"];
const moves: Record<Mood, string[]> = { cozy: ["stretch", "cuddle", "knead", "snooze"], fun: ["double-hop", "wiggle", "twirl", "hop"], angry: ["huff", "stomp", "peek", "huff"], tantrum: ["flop", "wobble", "stomp", "dramatic"] };
const idleMoves: Record<Mood, string[]> = { cozy: ["settle", "stretch", "snooze"], fun: ["peek", "wiggle", "double-hop"], angry: ["peek", "huff", "settle"], tantrum: ["wobble", "peek", "flop"] };

export function PeaceCat({ active }: { active: boolean }) {
  const [mood, setMood] = useState<Mood>("cozy");
  const [reaction, setReaction] = useState("idle");
  const [message, setMessage] = useState("Saved you a spot.");
  const [bubble, setBubble] = useState(false);
  const [burst, setBurst] = useState(0);
  const [sticker, setSticker] = useState<CatSticker>(catStickers[5]);
  const [packOpen, setPackOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [activity, setActivity] = useState<"pet" | "treat" | "play" | "nap">("pet");
  const audio = useRef<AudioContext | null>(null);
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
  useEffect(() => () => { if (finish.current) clearTimeout(finish.current); if (hide.current) clearTimeout(hide.current); void audio.current?.close(); }, []);

  function chirp(next: Mood) {
    if (!sound) return;
    try {
      const context = audio.current ?? new AudioContext(); audio.current = context;
      void context.resume().catch(() => undefined);
      const tune = next === "cozy" ? [330, 440, 392] : next === "fun" ? [523, 784, 1047, 784] : next === "angry" ? [185, 155, 110] : [660, 440, 330, 220];
      tune.forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain(); const at = context.currentTime + index * .085;
        oscillator.type = next === "angry" ? "triangle" : "sine"; oscillator.frequency.setValueAtTime(frequency, at); oscillator.frequency.exponentialRampToValueAtTime(frequency * .8, at + .12);
        gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.035, at + .01); gain.gain.exponentialRampToValueAtTime(.001, at + .16);
        oscillator.connect(gain).connect(context.destination); oscillator.start(at); oscillator.stop(at + .18); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { setSound(false); }
  }

  function react(next = mood, selected?: CatSticker) {
    if (!active) return;
    if (finish.current) clearTimeout(finish.current);
    if (hide.current) clearTimeout(hide.current);
    setMood(next);
    const turn = clicks.current++;
    const choices = catStickers.filter((item) => item.mood === next);
    const chosen = selected ?? choices[turn % choices.length];
    setSticker(chosen);
    setMessage(chosen.line);
    chirp(next);
    setBubble(true);
    setBurst((value) => value + 1);
    setReaction(moves[next][turn % moves[next].length]);
    finish.current = setTimeout(() => setReaction("idle"), 2900);
    hide.current = setTimeout(() => setBubble(false), 5200);
  }

  function playWith(action: typeof activity) {
    const options = {
      pet: { face: "love", mood: "cozy", badge: "♥", line: ["Head scratches? Best. Day. Ever.", "Tum + main = purrfect company.", "Bas, yahin. Aur thoda sa…"] },
      treat: { face: "laugh", mood: "fun", badge: "✦", line: ["Nom nom… chef's kiss, yaar!", "Treat accepted. Tiny happy dance!", "Biscuit mila. Dil khil gaya."] },
      play: { face: "love", mood: "fun", badge: "✧", line: ["Tiny paws. BIG hunter energy!", "Yarn ko bolo: main aa rahi hoon!", "Caught it! Main genius hoon na?"] },
      nap: { face: "sleepy", mood: "cozy", badge: "☁", line: ["A little nap, a little peace.", "Shhh… dreaming of soft clouds.", "Tum focus karo. Main yahin hoon."] },
    } as const;
    const choice = options[action];
    setActivity(action);
    react(choice.mood, { ...choice, line: choice.line[clicks.current % choice.line.length] });
    setReaction(action === "play" ? "double-hop" : action === "treat" ? "wiggle" : action === "nap" ? "snooze" : "knead");
  }

  return <aside className={`companion mood-${mood} doing-${reaction} activity-${activity} ${active ? "companion-active" : ""}`} aria-label="Your cat companion">
    <div className={`companion-speech ${bubble ? "is-visible" : ""}`} role="status">{message}</div>
    <button ref={button} type="button" className="companion-touch" aria-label={`Pet your ${mood} cat`} onClick={() => playWith("pet")}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const bounds = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--lean", `${((event.clientX - bounds.left) / bounds.width - .5) * 8}deg`);
        event.currentTarget.style.setProperty("--gaze-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 5}px`);
        event.currentTarget.style.setProperty("--gaze-y", `${((event.clientY - bounds.top) / bounds.height - .5) * 4}px`);
      }}
      onPointerLeave={() => { button.current?.style.setProperty("--lean", "0deg"); button.current?.style.setProperty("--gaze-x", "0px"); button.current?.style.setProperty("--gaze-y", "0px"); }}>
      <span className="companion-glow" aria-hidden="true" />
      <span className="companion-ground" aria-hidden="true" />
      <span key={`toy-${burst}`} className="kitten-toy" aria-hidden="true">{activity === "play" ? "🧶" : activity === "treat" ? "🐟" : activity === "nap" ? "☁" : "♡"}</span>
      <span className="companion-comic" aria-hidden="true">{reaction === "snooze" ? "z z Z" : reaction === "knead" ? "purr…" : reaction === "stomp" ? "hmph!" : reaction === "double-hop" ? "boing!" : reaction === "dramatic" ? "WHY." : reaction === "twirl" ? "ta-da!" : ""}</span>
      <span className="companion-lean"><span key={burst} className={`companion-motion reaction-${reaction}`} onAnimationEnd={(event) => { if (event.target === event.currentTarget) setReaction("idle"); }}>
        <span className="companion-pose is-current"><StickerCat face={sticker.face} badge={sticker.badge} /></span>
      </span></span>
      {burst > 0 && <span key={`hearts-${burst}`} className="companion-burst" aria-hidden="true">{[0,1,2,3].map((i) => <i key={i} style={{ "--i": i } as React.CSSProperties}>{mood === "angry" ? "✦" : mood === "tantrum" ? "✧" : "♥"}</i>)}</span>}
    </button>
    <p className="companion-hint">your tiny comfort cat · tap for love</p>
    <div className="kitten-actions" aria-label="Play with your cat">{(["pet", "treat", "play", "nap"] as const).map((action, i) => <button type="button" key={action} onClick={() => playWith(action)} aria-label={["Cuddle cat", "Give cat a treat", "Play with yarn", "Let cat nap"][i]}><span aria-hidden="true">{["♡", "🐟", "🧶", "☾"][i]}</span>{["Cuddle", "Treat", "Play", "Nap"][i]}</button>)}</div>
    <div className="companion-moods" aria-label="Cat mood">{moods.map((item) => <button key={item} type="button" aria-pressed={mood === item} onClick={() => react(item)}>{item === "angry" ? "Grumpy" : item === "tantrum" ? "Dramatic" : item === "fun" ? "Playful" : "Cozy"}</button>)}</div>
    <div className="sticker-controls"><button type="button" aria-expanded={packOpen} aria-controls="cat-sticker-pack" onClick={() => setPackOpen(!packOpen)}>✦ Stickers · {catStickers.length}</button><button type="button" aria-pressed={sound} onClick={() => { setSound(!sound); if (sound) void audio.current?.suspend(); }}>{sound ? "♫ Sound on" : "♫ Muted"}</button></div>
    {packOpen && <div id="cat-sticker-pack" className="cat-sticker-pack"><div className="sticker-pack-title"><span>CHATPATA CLUB <small>pick your vibe</small></span><button type="button" aria-label="Close sticker pack" onClick={() => setPackOpen(false)}>×</button></div><div className="sticker-pack-grid">{catStickers.map((item) => <button key={item.line} type="button" className={`sticker-tile sticker-${item.mood}`} aria-label={item.line} aria-pressed={sticker.line === item.line} onClick={() => { react(item.mood, item); setPackOpen(false); }}><StickerCat face={item.face} badge={item.badge} /><span>{item.line}</span></button>)}</div></div>}
  </aside>;
}
