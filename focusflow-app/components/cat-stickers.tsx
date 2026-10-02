export type StickerFace = "sleepy" | "love" | "smug" | "laugh" | "shock" | "angry" | "cry" | "plead";
export type StickerMood = "cozy" | "fun" | "angry" | "tantrum";
export type CatSticker = { line: string; face: StickerFace; mood: StickerMood; badge: string };
const pack: Record<StickerFace, { mood: StickerMood; badge: string; lines: string[] }> = {
  sleepy: { mood: "cozy", badge: "☁", lines: ["Bas 5 minute aur…", "Aaj ka plan: chai aur nap.", "Battery low. Cuddle lagao.", "Main busy hoon. Sone mein.", "Duniya fast hai, main soft hoon."] },
  love: { mood: "cozy", badge: "♥", lines: ["Tu aa gaya? Ab sab cozy hai.", "Ek hug toh banta hai!", "Tere liye purr-sonal support.", "Chhota step bhi progress hai, yaar.", "Aaj khud se thoda pyaar kar."] },
  smug: { mood: "fun", badge: "✦", lines: ["Cute hoon. Discount nahi milega.", "Main nahi, meri vibe kaam karti hai.", "Attitude? Complimentary hai.", "Meri entry, tumhari productivity exit.", "Chai pe charcha, snacks pe kabza."] },
  laugh: { mood: "fun", badge: "✿", lines: ["Ek brain cell, full entertainment!", "Kaam bhi hoga, masti bhi hogi.", "Zoomies ka koi syllabus nahi.", "Aaj toh paws-itive rehna padega!", "Task done? Party meri taraf se: meow!"] },
  shock: { mood: "fun", badge: "?!", lines: ["Itne tabs?! Bhai saans le!", "Deadline kal thi?!", "Snack khatam? Breaking mews!", "Focus mil gaya?! Screenshot lo!", "Tu productive tha? Main witness hoon!"] },
  angry: { mood: "angry", badge: "💢", lines: ["Meri chai kisne pi?!", "Mood off. Biscuit on.", "Permission li thi pet karne ki?", "Meeting nahi. Meow-ting karo.", "Main gussa nahi. Spicy hoon."] },
  cry: { mood: "tantrum", badge: "☂", lines: ["Snack chahiye, life lesson nahi!", "Meri dramatic entry cancel kisne ki?", "Main ro nahi raha. Face rain hai.", "Itna kaam? Main toh baby hoon.", "Dil toota… bowl bhi khaali."] },
  plead: { mood: "tantrum", badge: "✧", lines: ["Ek treat? Bas ek… packet.", "Mujhe attention ka recharge chahiye.", "Mat jaa, abhi toh cozy hue the.", "Thoda break le le, mere liye?", "Please? Meri aankhein dekho na."] },
};
export const catStickers: CatSticker[] = Object.entries(pack).flatMap(([face, entry]) => entry.lines.map((line) => ({ line, face: face as StickerFace, mood: entry.mood, badge: entry.badge })));

export function StickerCat({ face, badge = "✦" }: { face: StickerFace; badge?: string }) {
  const closed = face === "sleepy" || face === "laugh";
  return <svg viewBox="0 0 220 220" className={`sticker-cat face-${face}`} aria-hidden="true">
    <g className="kitten-tail" fill="none" strokeLinecap="round"><path d="M154 183Q205 195 196 146" stroke="#fffdf6" strokeWidth="25"/><path d="M154 183Q205 195 196 146" stroke="#efb27f" strokeWidth="17"/><path d="M196 146v7" stroke="#fff0d8" strokeWidth="17"/></g>
    <ellipse cx="110" cy="170" rx="49" ry="34" fill="#ffcfa0" stroke="#fffdf6" strokeWidth="10"/>
    <ellipse cx="110" cy="176" rx="29" ry="24" fill="#fff0d8"/>
    <g className="kitten-head">
    <path d="M43 91Q30 23 48 30L85 56Q110 47 137 56L174 30Q191 23 178 91Q201 124 178 151Q156 174 110 172Q64 174 42 151Q19 124 43 91Z" fill="#ffd5a9" stroke="#fffdf6" strokeWidth="10" strokeLinejoin="round" />
    <path className="kitten-ear ear-left" d="M47 43 53 79 75 60Q58 48 47 43" fill="#f3a8ac" />
    <path className="kitten-ear ear-right" d="M173 43 167 79 145 60Q162 48 173 43" fill="#f3a8ac" />
    <path d="M96 55q-7-17 5-12q1-12 10-2q10-10 13 11" fill="#ffd5a9" stroke="#fffdf6" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="110" cy="132" rx="64" ry="35" fill="#fff2dc" />
    <path d="m98 59 4 12m10-14v15m12-12-4 11" stroke="#e9b284" strokeWidth="5" strokeLinecap="round" />
    <path d="M66 82q13-7 23-2M133 80q12-5 23 2" stroke="#bc8a69" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <g className="sticker-eyes" stroke="#543b36" strokeWidth="5" fill="#543b36" strokeLinecap="round">
      {closed ? <><path d={face === "sleepy" ? "M68 113q12 9 24 0M128 113q12 9 24 0" : "M68 116q12-18 24 0M128 116q12-18 24 0"} fill="none" /></> : face === "smug" || face === "angry" ? <><path d={face === "angry" ? "m65 101 28 10m34 0 28-10" : "M65 108h28m34 0h28"} /><ellipse cx="81" cy="120" rx="5" ry="9" /><ellipse cx="140" cy="120" rx="5" ry="9" /></> : <>{[79,141].map((x) => <g key={x} className="kitten-pupil"><ellipse cx={x} cy="110" rx="18" ry={face === "shock" ? 23 : 21} fill="#493a42" stroke="none"/><ellipse cx={x+2} cy="120" rx="11" ry="8" fill="#9d7264" stroke="none"/><circle cx={x-6} cy="103" r="7" fill="white" stroke="none" /><circle cx={x+7} cy="115" r="3.5" fill="white" stroke="none" /></g>)}</>}
    </g>
    <g className="kitten-blush"><ellipse cx="56" cy="134" rx="16" ry="10" fill="#f59f9f" opacity=".65" /><ellipse cx="165" cy="134" rx="16" ry="10" fill="#f59f9f" opacity=".65" /><path d="m49 131-2 5m9-5-2 5m105-5-2 5m9-5-2 5" stroke="#e18791" strokeWidth="2" strokeLinecap="round"/></g>
    <ellipse cx="100" cy="140" rx="11" ry="9" fill="#fffaf0"/><ellipse cx="120" cy="140" rx="11" ry="9" fill="#fffaf0"/>
    <path d="M104 128q0-5 6-2q6-3 6 2q-1 4-6 6q-5-2-6-6Z" fill="#ce8994" />
    {face === "shock" ? <ellipse cx="110" cy="150" rx="10" ry="14" fill="#63453b" /> : face === "laugh" ? <><path d="M91 139q19 35 38 0Z" fill="#63453b" /><ellipse cx="110" cy="152" rx="10" ry="5" fill="#ee9b9d" /></> : <path d={face === "cry" || face === "angry" ? "M97 150q13-13 26 0" : "M97 139q6 12 13 0q7 12 13 0"} fill="none" stroke="#63453b" strokeWidth="4" strokeLinecap="round" />}
    {face === "cry" && <g fill="#8bd9fa" className="sticker-tears"><path d="M66 130q-14 24 0 25q14-1 0-25Z" /><path d="M154 130q-14 24 0 25q14-1 0-25Z" /></g>}
    {face === "love" && <path className="kitten-blep" d="M106 145h9v5q-5 9-9 0Z" fill="#ed9ca9"/>}
    <path d="m46 132-21-4m22 13-23 6m149-15 21-4m-22 13 23 6" stroke="#b78165" strokeWidth="3" strokeLinecap="round" />
    </g>
    <g className="kitten-bow" fill="#eab0c1" stroke="#fff1f4" strokeWidth="2"><path d="M110 176q-25-18-22 0q-3 16 22 0q25-18 22 0q3 16-22 0Z"/><circle cx="110" cy="176" r="5" fill="#f6cfdb"/></g>
    {[80,140].map((x,i)=><g key={x} className={`kitten-paw paw-${i}`}><ellipse cx={x} cy="188" rx="20" ry="14" fill="#fff0d8" stroke="#e0af8c" strokeWidth="2"/><g className="kitten-beans" fill="#edaaba"><path d={`M${x} 196q-13-7-7-11q4-3 7 1q3-4 7-1q6 4-7 11Z`}/><circle cx={x-9} cy="181" r="2.5"/><circle cx={x} cy="179" r="2.5"/><circle cx={x+9} cy="181" r="2.5"/></g></g>)}
    <text x="185" y="25" textAnchor="middle" fontSize="23" fill="#ffe5a4" stroke="#ffffff" strokeWidth="1">{face === "sleepy" ? "zZ" : badge}</text>
  </svg>;
}
