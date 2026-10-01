"use client";

import { PeaceCat } from "@/components/peace-cat";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight, BookOpen, CalendarDays, CloudSun, Flame, FolderHeart,
  Gauge, Goal, Home, Leaf, Link2, ListChecks, Milestone, Moon, NotebookPen,
  ImagePlus, LockKeyhole, LogOut, Plus, Search, Sparkles, Sun, Target, Trash2, Trophy, Volume2, VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger,
} from "@/components/ui/sidebar";

type View = "Home" | "Goals" | "Roadmap" | "Tasks" | "Notes" | "Progress" | "Resources" | "Journal";
type Task = { id: number; title: string; duration: string; milestone: string; done: boolean };
type Note = { id: number; title: string; body: string; date: string };
type Resource = { id: number; name: string; kind: string; url: string };
type GoalData = { title: string; target: string; intention: string };
type MilestoneData = { id: number; title: string; detail: string };
type JournalEntry = { id: number; body: string; date: string };
type SceneData = { kind: "default" | "image" | "video"; url: string };
type WorkspaceData = { tasks: Task[]; notes: Note[]; resources: Resource[]; goal: GoalData; milestones: MilestoneData[]; journal: JournalEntry[]; name: string; scene?: SceneData };
type AuthUser = { id: string; email: string; name: string };

const navItems = [
  { label: "Home" as View, icon: Home }, { label: "Goals" as View, icon: Goal },
  { label: "Roadmap" as View, icon: Milestone }, { label: "Tasks" as View, icon: ListChecks },
  { label: "Notes" as View, icon: NotebookPen }, { label: "Progress" as View, icon: Gauge },
  { label: "Resources" as View, icon: FolderHeart }, { label: "Journal" as View, icon: BookOpen },
];
const defaultMilestones: MilestoneData[] = [
  { id: 1, title: "Foundations", detail: "HTML, CSS & accessibility" },
  { id: 2, title: "JavaScript", detail: "Core language & the browser" },
  { id: 3, title: "React", detail: "Components, state & patterns" },
  { id: 4, title: "Portfolio", detail: "Three thoughtful projects" },
];
const defaultTasks: Task[] = [
  { id: 1, title: "Practice array methods", duration: "35 min", milestone: "JavaScript", done: true },
  { id: 2, title: "Build a filterable list", duration: "45 min", milestone: "JavaScript", done: true },
  { id: 3, title: "Review map, filter & reduce", duration: "25 min", milestone: "JavaScript", done: false },
  { id: 4, title: "Write learning notes", duration: "15 min", milestone: "JavaScript", done: false },
];
const defaultNotes: Note[] = [
  { id: 1, title: "Array methods", body: "map transforms, filter selects, reduce combines.", date: "Today" },
  { id: 2, title: "Weekly reflection", body: "Short examples help me understand faster than passive reading.", date: "Yesterday" },
];
const defaultResources: Resource[] = [
  { id: 1, name: "MDN JavaScript Guide", kind: "Documentation", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" },
  { id: 2, name: "You Don't Know JS", kind: "Book series", url: "https://github.com/getify/You-Dont-Know-JS" },
  { id: 3, name: "Frontend Mentor", kind: "Practice", url: "https://www.frontendmentor.io/" },
];
const defaultGoal: GoalData = { title: "Become a frontend developer", target: "2027-03-31", intention: "Build the skills and confidence to create thoughtful web products." };

function initialClock() {
  const value = new Date("2026-01-01T12:00:00Z");
  value.toLocaleTimeString = () => "--:--";
  return value;
}

function Daylight({ hour }: { hour: number }) {
  const daylight = hour >= 6 && hour < 19;
  const progress = Math.max(0, Math.min(1, (hour - 6) / 13));
  return <div className="daylight" aria-label={daylight ? "Daylight follows your local time" : "Evening mode follows your local time"}>
    <div className="daylight-path" />
    <span className={`daylight-orb ${daylight ? "is-sun" : "is-moon"}`} style={{ left: daylight ? `${8 + progress * 78}%` : "82%", top: daylight ? `${56 - Math.sin(progress * Math.PI) * 43}%` : "44%" }}>
      {daylight ? <Sun /> : <Moon />}
    </span>
    <span className="daylight-label">{daylight ? (hour < 12 ? "morning light" : hour < 17 ? "afternoon light" : "golden hour") : "quiet evening"}</span>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-3 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#77756f] sm:text-base">{description}</p></div>{action}</div>;
}

function LoginView({ onSignedIn }: { onSignedIn: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json() as { user?: AuthUser; error?: string };
      if (!response.ok || !result.user) throw new Error(result.error || "Something went wrong.");
      onSignedIn(result.user);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong."); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell"><section className="auth-story"><div className="auth-brand"><span><Leaf /></span> FocusFlow</div><div><p className="auth-kicker">YOUR SPACE TO GROW</p><h1>Small steps.<br /><em>Beautiful momentum.</em></h1><p>Goals, focus sessions, notes, and quiet reflection—all in one private space.</p></div><div className="auth-orbit"><span /><span /><span /></div><p className="auth-footnote">Built for calm progress, every day.</p></section><section className="auth-panel"><form onSubmit={submit} className="auth-card"><span className="auth-lock"><LockKeyhole /></span><p className="eyebrow">{mode === "login" ? "Welcome back" : "Start your space"}</p><h2>{mode === "login" ? "Sign in to FocusFlow" : "Create your account"}</h2><p className="auth-subtitle">{mode === "login" ? "Your goals are waiting for you." : "One account, one private workspace."}</p>{mode === "register" && <label><span>Name</span><Input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>}<label><span>Email</span><Input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label><label><span>Password</span><Input required type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={mode === "login" ? "Your password" : "At least 8 characters"} /></label>{error && <p className="auth-error" role="alert">{error}</p>}<Button disabled={busy} type="submit" className="auth-submit">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button><p className="auth-switch">{mode === "login" ? "New to FocusFlow?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></p></form></section></main>;
}

export default function HomePage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("Home");
  const [tasks, setTasks] = useState(defaultTasks);
  const [notes, setNotes] = useState(defaultNotes);
  const [resources, setResources] = useState(defaultResources);
  const [goal, setGoal] = useState(defaultGoal);
  const [milestones, setMilestones] = useState(defaultMilestones);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [scene, setScene] = useState<SceneData>({ kind: "default", url: "" });
  const [peacefulName, setPeacefulName] = useState("Aditya");
  const [minimal, setMinimal] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newNote, setNewNote] = useState({ title: "", body: "" });
  const [newResource, setNewResource] = useState({ name: "", url: "" });
  const [query, setQuery] = useState("");
  const [activeMilestone, setActiveMilestone] = useState("JavaScript");
  const [now, setNow] = useState(initialClock);
  const [saveStatus, setSaveStatus] = useState<"loading" | "saved" | "saving" | "offline">("loading");

  useEffect(() => {
    const workspaceRequested = new URLSearchParams(window.location.search).get("mode") === "workspace";
    const storedMinimal = window.localStorage.getItem("focusflow.minimal") === "true";
    queueMicrotask(() => setMinimal(workspaceRequested ? false : storedMinimal));
    if (workspaceRequested) window.history.replaceState({}, "", window.location.pathname);
    queueMicrotask(() => setNow(new Date()));
    fetch("/api/auth/session").then(async (response) => {
      if (!response.ok) throw new Error("Session unavailable");
      return await response.json() as { user: AuthUser | null };
    }).then(async (session) => {
      setAuthUser(session.user); setAuthLoading(false);
      if (!session.user) return;
      const response = await fetch("/api/state");
      if (!response.ok) throw new Error("load failed");
      const result = await response.json() as { data: WorkspaceData | null };
      if (result.data) {
        setTasks(result.data.tasks ?? defaultTasks); setNotes(result.data.notes ?? defaultNotes);
        setResources(result.data.resources ?? defaultResources); setGoal(result.data.goal ?? defaultGoal);
        setMilestones(result.data.milestones ?? defaultMilestones); setJournal(result.data.journal ?? []);
        setScene(result.data.scene ?? { kind: "default", url: "" });
        setPeacefulName(result.data.name ?? "Aditya");
      }
      setSaveStatus("saved"); setReady(true);
    }).catch(() => { setAuthLoading(false); setSaveStatus("offline"); setReady(false); });
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    window.localStorage.setItem("focusflow.minimal", String(minimal));
    if (!ready || !authUser) return;
    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      const data: WorkspaceData = { tasks, notes, resources, goal, milestones, journal, name: peacefulName, scene };
      fetch("/api/state", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(data) })
        .then((response) => { if (!response.ok) throw new Error("save failed"); setSaveStatus("saved"); })
        .catch(() => setSaveStatus("offline"));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [tasks, notes, resources, goal, milestones, journal, peacefulName, scene, minimal, ready, authUser]);

  const completed = tasks.filter((task) => task.done).length;
  const dailyPercent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const milestoneProgress = (title: string) => { const related = tasks.filter((task) => task.milestone === title); return related.length ? Math.round(related.filter((task) => task.done).length / related.length * 100) : 0; };
  const goalPercent = milestones.length ? Math.round(milestones.reduce((sum, item) => sum + milestoneProgress(item.title), 0) / milestones.length) : 0;
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(now);
  const searchResults = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    return [...tasks.map((x) => ({ name: x.title, type: "Task", view: "Tasks" as View })), ...notes.map((x) => ({ name: x.title, type: "Note", view: "Notes" as View })), ...resources.map((x) => ({ name: x.name, type: "Resource", view: "Resources" as View })), ...milestones.map((x) => ({ name: x.title, type: "Milestone", view: "Roadmap" as View }))].filter((x) => x.name.toLowerCase().includes(term)).slice(0, 7);
  }, [query, tasks, notes, resources, milestones]);

  function toggleTask(id: number) { setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task)); }
  function addTask(event: FormEvent) { event.preventDefault(); const title = newTask.trim(); if (!title) return; setTasks((current) => [...current, { id: Date.now(), title, duration: "20 min", milestone: activeMilestone, done: false }]); setNewTask(""); setDialogOpen(false); }
  function addNote(event: FormEvent) { event.preventDefault(); if (!newNote.title.trim()) return; setNotes((current) => [{ id: Date.now(), title: newNote.title.trim(), body: newNote.body.trim(), date: "Just now" }, ...current]); setNewNote({ title: "", body: "" }); }
  function addResource(event: FormEvent) { event.preventDefault(); if (!newResource.name.trim()) return; setResources((current) => [...current, { id: Date.now(), name: newResource.name.trim(), kind: "Saved link", url: newResource.url.trim() || "#" }]); setNewResource({ name: "", url: "" }); }
  function openView(next: View) { setView(next); setQuery(""); }

  const taskDialog = <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger asChild><Button className="rounded-xl bg-[#284f43]"><Plus /> Add task</Button></DialogTrigger><DialogContent className="rounded-[1.5rem] border-[#dedbd2] bg-[#fbfaf6] sm:max-w-md"><form onSubmit={addTask}><DialogHeader><DialogTitle className="font-serif text-2xl">Add a small next step</DialogTitle><DialogDescription>Connected to the {activeMilestone} milestone.</DialogDescription></DialogHeader><Input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="What is the next small action?" className="my-6 h-11 rounded-xl bg-white" /><DialogFooter><Button type="submit" className="rounded-xl bg-[#284f43]">Add task</Button></DialogFooter></form></DialogContent></Dialog>;

  async function signOut() { await fetch("/api/auth/logout", { method: "POST" }); setAuthUser(null); setReady(false); }
  if (authLoading) return <div className="auth-loading"><Leaf /> FocusFlow</div>;
  if (!authUser) return <LoginView onSignedIn={(user) => { setAuthUser(user); window.location.reload(); }} />;

  return <div className={`focusflow-stage ${minimal ? "is-peaceful" : ""}`}>
    <div className="focusflow-workspace"><SidebarProvider style={{ "--sidebar-width": "15.5rem" } as React.CSSProperties}>
    <Sidebar collapsible="offcanvas" className="glass-sidebar border-r">
      <SidebarHeader className="px-5 pb-4 pt-6"><button onClick={() => openView("Home")} className="flex items-center gap-3 text-left"><span className="grid size-9 place-items-center rounded-xl bg-[#264c41] text-white"><Leaf className="size-5" /></span><span><span className="block text-[1.05rem] font-semibold">FocusFlow</span><span className="block text-xs text-[#73716b]">Make progress gently</span></span></button></SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup><SidebarGroupLabel className="px-3 text-[0.7rem] uppercase tracking-[0.14em] text-[#8a877f]">Workspace</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{navItems.map(({ label, icon: Icon }) => <SidebarMenuItem key={label}><SidebarMenuButton onClick={() => openView(label)} isActive={view === label} className="h-10 rounded-xl px-3 text-[0.9rem] data-[active=true]:bg-white data-[active=true]:text-[#24483e] data-[active=true]:shadow-[0_5px_18px_rgba(66,71,59,0.08)]"><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>
        <SidebarSeparator className="my-2 bg-[#dfddd5]" />
        <SidebarGroup><SidebarGroupLabel className="px-3 text-[0.7rem] uppercase tracking-[0.14em] text-[#8a877f]">Peaceful space</SidebarGroupLabel><div className="mx-1 space-y-3 rounded-2xl border border-[#dedbd2] bg-white/60 p-3">
          <label className="block"><span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[#5d5c56]"><Leaf className="size-3.5" /> Peaceful name</span><Input value={peacefulName} onChange={(event) => setPeacefulName(event.target.value.slice(0, 24))} aria-label="Peaceful name" className="h-9 rounded-xl border-[#dedbd2] bg-white px-3 text-sm shadow-none" /></label>
          <button onClick={() => setMinimal((value) => !value)} className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left"><span className="flex items-center gap-2 text-xs font-semibold text-[#5d5c56]"><Moon className="size-3.5" /> Peaceful mode</span><span className={`relative h-5 w-9 rounded-full transition-colors ${minimal ? "bg-[#4e786c]" : "bg-[#d9d6cd]"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${minimal ? "translate-x-[18px]" : "translate-x-0.5"}`} /></span></button>
        </div></SidebarGroup>
        {!minimal && <SidebarGroup><SidebarGroupLabel className="px-3 text-[0.7rem] uppercase tracking-[0.14em] text-[#8a877f]">Current goal</SidebarGroupLabel><button onClick={() => openView("Goals")} className="mx-1 block rounded-2xl border border-[#dedbd2] bg-white/60 p-4 text-left"><div className="mb-3 flex items-center justify-between"><Trophy className="size-4 text-[#315d50]" /><span className="text-xs font-semibold text-[#315d50]">{goalPercent}%</span></div><p className="text-sm font-semibold leading-snug">{goal.title}</p><p className="mt-1 text-xs text-[#77756e]">Target · {new Date(`${goal.target}T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p><Progress value={goalPercent} className="mt-4 h-1.5 bg-[#deddd6] [&_[data-slot=progress-indicator]]:bg-[#4d7b6d]" /></button></SidebarGroup>}
      </SidebarContent>
      <SidebarFooter className="px-5 pb-6"><div className="rounded-2xl bg-[#284d42] p-4 text-white"><div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="size-4 text-[#efd69f]" /> Small steps count</div><p className="text-xs leading-relaxed text-white/70">{completed} meaningful steps completed.</p></div><button onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#6f6883] hover:bg-white/60"><LogOut className="size-4" /> Sign out</button></SidebarFooter>
    </Sidebar>
    <SidebarInset className="glass-inset min-w-0">
      <header className="glass-header sticky top-0 z-20 flex h-20 items-center gap-3 px-4 sm:px-7 lg:px-10"><SidebarTrigger className="size-10 rounded-xl border bg-white/65 md:hidden" /><div className="relative max-w-xl flex-1"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8a8984]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your workspace…" aria-label="Search your workspace" className="h-11 rounded-2xl bg-white/55 pl-11 shadow-none" />{query && <div className="glass-popover absolute top-13 z-30 w-full rounded-2xl p-2">{searchResults.length ? searchResults.map((result) => <button key={`${result.type}-${result.name}`} onClick={() => openView(result.view)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/50"><span>{result.name}</span><span className="text-xs text-[#8a8881]">{result.type}</span></button>) : <p className="px-3 py-4 text-sm text-[#77756f]">Nothing found yet.</p>}</div>}</div><div className="hidden text-right sm:block"><p className="text-sm font-medium tabular-nums">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p><p className="text-[0.65rem] uppercase tracking-[0.12em] text-[#8c8980]">{saveStatus === "saved" ? "saved" : saveStatus === "saving" ? "saving…" : saveStatus === "offline" ? "save unavailable" : "loading…"}</p></div><Button variant="outline" size="icon" className="rounded-xl bg-white/60" onClick={() => openView("Tasks")}><CalendarDays /><span className="sr-only">Open tasks</span></Button><div className="glass-avatar grid size-10 place-items-center rounded-full text-sm font-semibold text-[#264c41]">{peacefulName.slice(0, 2).toUpperCase() || "FF"}</div></header>
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-7 lg:px-10 lg:py-8">
          {view === "Home" && <HomeView name={peacefulName || "friend"} greeting={greeting} dateLabel={dateLabel} hour={now.getHours()} tasks={tasks} toggleTask={toggleTask} completed={completed} dailyPercent={dailyPercent} goal={goal} goalPercent={goalPercent} activeMilestone={activeMilestone} setActiveMilestone={setActiveMilestone} openView={openView} taskDialog={taskDialog} notes={notes} resources={resources} milestones={milestones} milestoneProgress={milestoneProgress} />}
          {view === "Goals" && <GoalsView goal={goal} setGoal={setGoal} percent={goalPercent} />}
          {view === "Roadmap" && <RoadmapView milestones={milestones} setMilestones={setMilestones} progress={milestoneProgress} active={activeMilestone} setActive={setActiveMilestone} openTasks={() => openView("Tasks")} />}
          {view === "Tasks" && <TasksView tasks={tasks} toggleTask={toggleTask} removeTask={(id) => setTasks((items) => items.filter((item) => item.id !== id))} taskDialog={taskDialog} />}
          {view === "Notes" && <NotesView notes={notes} newNote={newNote} setNewNote={setNewNote} addNote={addNote} remove={(id) => setNotes((items) => items.filter((item) => item.id !== id))} />}
          {view === "Progress" && <ProgressView tasks={tasks} percent={goalPercent} milestones={milestones} progress={milestoneProgress} />}
          {view === "Resources" && <ResourcesView resources={resources} newResource={newResource} setNewResource={setNewResource} addResource={addResource} remove={(id) => setResources((items) => items.filter((item) => item.id !== id))} />}
          {view === "Journal" && <JournalView entries={journal} setEntries={setJournal} />}
      </main>
    </SidebarInset>
    </SidebarProvider></div>
    <PeacefulView name={peacefulName || "friend"} now={now} active={minimal} onExit={() => setMinimal(false)} scene={scene} setScene={setScene} />
  </div>;
}

function PeacefulView({ name, now, active, onExit, scene, setScene }: { name: string; now: Date; active: boolean; onExit: () => void; scene: SceneData; setScene: (scene: SceneData) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<{ context: AudioContext; gain: GainNode; source: AudioBufferSourceNode } | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hour = now.getHours();
  const minutes = hour * 60 + now.getMinutes();
  const daylightProgress = Math.max(0, Math.min(1, (minutes - 360) / 720));
  const solarElevation = Math.sin(daylightProgress * Math.PI);
  const sunLeft = 9 + daylightProgress * 82;
  const sunTop = 57 - Math.sin(daylightProgress * Math.PI) * 43;
  const isDay = minutes >= 360 && minutes < 1080;
  const horizonWarmth = isDay ? 1 - solarElevation : 0;
  const sceneStyle = {
    "--sun-x": `${sunLeft}%`,
    "--solar-elevation": solarElevation.toFixed(3),
    "--scene-brightness": (isDay ? 0.76 + solarElevation * 0.3 : 0.46).toFixed(3),
    "--horizon-warmth": horizonWarmth.toFixed(3),
  } as React.CSSProperties;
  const time = `${((hour + 11) % 12) + 1}:${String(now.getMinutes()).padStart(2, "0")}`;
  const period = hour >= 12 ? "PM" : "AM";
  const message = hour < 6 ? "The world is quiet. You can be, too." : hour < 12 ? "Let the morning arrive slowly." : hour < 18 ? "There is nowhere else you need to be." : "Set the day down. It has been enough.";
  function toggleSound() {
    if (audioRef.current) {
      const { context, gain } = audioRef.current;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.linearRampToValueAtTime(soundOn ? 0 : 0.055, context.currentTime + 0.7);
      setSoundOn(!soundOn); return;
    }
    const context = new AudioContext();
    const duration = 5; const buffer = context.createBuffer(2, context.sampleRate * duration, context.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const values = buffer.getChannelData(channel); let brown = 0; for (let i = 0; i < values.length; i++) { brown = (brown + (Math.random() * 2 - 1) * .055) / 1.052; values[i] = brown * 2.8; } }
    const source = context.createBufferSource(); const low = context.createBiquadFilter(); const high = context.createBiquadFilter(); const gain = context.createGain();
    source.buffer = buffer; source.loop = true; low.type = "lowpass"; low.frequency.value = 1300; high.type = "highpass"; high.frequency.value = 110; gain.gain.value = 0;
    source.connect(low).connect(high).connect(gain).connect(context.destination); source.start(); gain.gain.linearRampToValueAtTime(.055, context.currentTime + 1.2);
    audioRef.current = { context, gain, source }; setSoundOn(true);
  }
  async function chooseScene(file?: File) {
    if (!file) return; setUploading(true);
    const body = new FormData(); body.append("scene", file);
    try { const response = await fetch("/api/scene", { method: "POST", body }); if (!response.ok) throw new Error(); setScene(await response.json() as SceneData); }
    catch { window.alert("That scene could not be uploaded. Choose an image or video under 60 MB."); }
    finally { setUploading(false); }
  }
  async function resetScene() { await fetch("/api/scene", { method: "DELETE" }); setScene({ kind: "default", url: "" }); }
  return <section aria-hidden={!active} style={sceneStyle} className={`peace-room ${active ? "peace-active" : ""} ${isDay ? "peace-day" : "peace-night"}`}>
    {scene.kind === "video" ? <video className="peace-scene-media" src={scene.url} autoPlay muted loop playsInline /> : <div className="peace-landscape" style={scene.kind === "image" ? { backgroundImage: `url(${scene.url})` } : undefined} aria-hidden="true" />}
    <button className="workspace-return" onClick={onExit}><Home className="size-4" /> Workspace</button>
    <div className="peace-controls">
      <button onClick={toggleSound}>{soundOn ? <Volume2 /> : <VolumeX />} {soundOn ? "Water on" : "Water off"}</button>
      <button onClick={() => inputRef.current?.click()} disabled={uploading}><ImagePlus /> {uploading ? "Uploading…" : "Change scene"}</button>
      {scene.kind !== "default" && <button onClick={resetScene}>Use original</button>}
      <input ref={inputRef} className="sr-only" type="file" accept="image/*,video/*" onChange={(event) => chooseScene(event.target.files?.[0])} />
    </div>
    <div className="peace-sky-tint" />
    <div className="peace-mist peace-mist-one" aria-hidden="true" />
    <div className="peace-mist peace-mist-two" aria-hidden="true" />
    <div className="peace-water-light" aria-hidden="true"><span /></div>
    <div className="peace-breathe" aria-hidden="true" />
    <div className={`peace-celestial ${isDay ? "peace-sun" : "peace-moon"}`} style={{ left: isDay ? `${sunLeft}%` : "78%", top: isDay ? `${sunTop}%` : "18%" }} aria-label={isDay ? "Sun position follows local time" : "Moonlit evening"}>{isDay ? <Sun /> : <Moon />}</div>
    {isDay && <div className="peace-sun-path" aria-hidden="true" />}
    <div className="peace-content">
      <p className="peace-kicker"><Leaf className="size-4" /> peaceful space</p>
      <div className="peace-clock"><span>{time}</span><small>{period}</small></div>
      <p className="peace-message">{message}</p>
      <p className="peace-name">Take your time, {name}.</p>
    </div>
    <PeaceCat active={active} />
    <p className="peace-footer">Stay for a while · the landscape keeps breathing</p>
  </section>;
}

type HomeViewProps = { name: string; greeting: string; dateLabel: string; hour: number; tasks: Task[]; toggleTask: (id: number) => void; completed: number; dailyPercent: number; goal: GoalData; goalPercent: number; activeMilestone: string; setActiveMilestone: (value: string) => void; openView: (view: View) => void; taskDialog: React.ReactNode; notes: Note[]; resources: Resource[]; milestones: MilestoneData[]; milestoneProgress: (title: string) => number };
function HomeView({ name, greeting, dateLabel, hour, tasks, toggleTask, completed, dailyPercent, goal, goalPercent, activeMilestone, setActiveMilestone, openView, taskDialog, notes, resources, milestones, milestoneProgress }: HomeViewProps) {
  return <><div className="dashboard-intro"><div><h1>Your space to grow.</h1><p>A clear mind. A small step. A little closer.</p></div><span className="studio-date"><CalendarDays className="size-4" />{dateLabel}</span></div><section className="mb-6 grid gap-5 xl:grid-cols-[1.65fr_1fr]"><div className="studio-hero relative overflow-hidden rounded-[1.75rem] bg-[#294f43] px-6 py-7 text-white shadow-[0_20px_50px_rgba(36,70,60,0.16)] sm:px-8 sm:py-8"><Daylight hour={hour} /><div className="relative max-w-2xl"><p className="mb-5 flex items-center gap-2 text-sm text-white/65"><CloudSun className="size-4" /> YOUR DAILY RESET</p><h1 className="studio-greeting font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">{greeting},<br /><span className="text-[#e8d6a7]">{name}.</span></h1><p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">One focused session is enough to keep the bigger goal moving.</p><div className="mt-7 flex flex-wrap gap-3"><Button className="h-11 rounded-xl bg-[#f4efe3] px-5 text-[#24463d] hover:bg-white" onClick={() => document.getElementById("today-focus")?.scrollIntoView({ behavior: "smooth" })}>Continue today’s focus</Button><Button variant="outline" className="h-11 rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white" onClick={() => openView("Roadmap")}>View roadmap</Button></div></div></div><div className="studio-goal card p-6"><p className="eyebrow">Long-term goal</p><h2 className="mt-3 text-xl font-semibold">{goal.title}</h2><p className="mt-2 text-sm leading-relaxed text-[#77756f]">{goal.intention}</p><div className="mt-7 flex items-center gap-5"><ProgressRing value={goalPercent} /><div className="space-y-3 text-sm"><p><span className="text-[#77756f]">Target</span><br /><strong>{new Date(`${goal.target}T00:00:00`).toLocaleDateString("en-IN")}</strong></p><Button variant="ghost" className="-ml-3 text-[#426a5e]" onClick={() => openView("Goals")}>Edit goal <ArrowUpRight /></Button></div></div></div></section>
    <section className="grid gap-5 xl:grid-cols-[1.4fr_.75fr_.85fr]" id="today-focus"><article className="card p-6 sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="eyebrow"><Target className="size-4 text-[#c75340]" /> Today’s priority</p><h2 className="mt-3 text-2xl font-semibold">{activeMilestone}</h2><p className="mt-2 text-sm text-[#77756f]">Finish one useful step and leave the workspace clearer than you found it.</p></div><span className="rounded-full bg-[#eef2ef] px-3 py-1.5 text-xs text-[#41685c]">{completed}/{tasks.length}</span></div><Progress value={dailyPercent} className="h-2 bg-[#e7e5de] [&_[data-slot=progress-indicator]]:bg-[#4d7b6d]" /><div className="mt-5 divide-y">{tasks.filter((task) => task.milestone === activeMilestone).slice(0, 4).map((task) => <label key={task.id} className="flex cursor-pointer items-center gap-3 py-3"><Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} /><span className={`flex-1 text-sm ${task.done ? "text-[#99968e] line-through" : ""}`}>{task.title}</span><span className="text-xs text-[#88867f]">{task.duration}</span></label>)}</div><div className="mt-4 flex gap-3">{taskDialog}<Button variant="outline" className="rounded-xl" onClick={() => openView("Tasks")}>All tasks</Button></div></article>
    <article className="studio-completion card p-6"><p className="eyebrow"><Flame className="size-4 text-[#d87537]" /> Completion</p><div className="my-5 flex items-end gap-2"><strong className="font-serif text-4xl">{dailyPercent}%</strong><span className="pb-1 text-sm text-[#77756f]">of planned tasks</span></div><Progress value={dailyPercent} className="[&_[data-slot=progress-indicator]]:bg-[#5d8e80]" /><p className="mt-5 text-xs leading-relaxed text-[#77756f]">A factual view of progress—no artificial streak pressure.</p></article>
    <article className="studio-quote card bg-[#efe7d7] p-6"><Sparkles className="size-5 text-[#9a7037]" /><blockquote className="mt-12 font-serif text-[1.65rem] italic leading-tight">“A little progress each day adds up to something remarkable.”</blockquote></article></section>
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]"><article className="card p-6"><div className="mb-5 flex items-center justify-between"><p className="eyebrow"><Milestone className="size-4" /> Roadmap</p><Button variant="ghost" onClick={() => openView("Roadmap")}>View all</Button></div><div className="grid gap-3 sm:grid-cols-2">{milestones.map((item) => { const percent = milestoneProgress(item.title); return <button key={item.id} onClick={() => setActiveMilestone(item.title)} className={`rounded-2xl border p-4 text-left ${activeMilestone === item.title ? "border-[#638a7f] bg-[#eef3f0]" : "bg-[#fbfaf7]"}`}><div className="mb-3 flex justify-between"><strong className="text-sm">{item.title}</strong><span className="text-xs">{percent}%</span></div><Progress value={percent} className="h-1 [&_[data-slot=progress-indicator]]:bg-[#5c8579]" /></button>; })}</div></article><article className="card p-6"><p className="eyebrow"><NotebookPen className="size-4" /> Latest note</p><h3 className="mt-5 font-serif text-2xl">{notes[0]?.title || "A quiet place to think"}</h3><p className="mt-3 text-sm leading-relaxed text-[#77756f]">{notes[0]?.body || "Write your first note when you are ready."}</p><Button variant="ghost" className="mt-5 -ml-3 text-[#426a5e]" onClick={() => openView("Notes")}>Open notes</Button></article></section>
    <section className="mt-5 card p-6"><div className="mb-5 flex items-center justify-between"><p className="eyebrow"><Link2 className="size-4" /> Saved resources</p><Button variant="ghost" onClick={() => openView("Resources")}>See all</Button></div><div className="grid gap-3 md:grid-cols-3">{resources.slice(0,3).map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="rounded-2xl border bg-[#fbfaf7] p-4 hover:border-[#8ea89f]"><strong className="block text-sm">{resource.name}</strong><span className="mt-1 block text-xs text-[#817f78]">{resource.kind}</span></a>)}</div></section></>;
}

function ProgressRing({ value }: { value: number }) { const radius = 47, circumference = 2 * Math.PI * radius; return <div className="relative grid size-32 place-items-center" aria-label={`${value}% complete`}><svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112"><circle cx="56" cy="56" r={radius} fill="none" stroke="#e8e4dc" strokeWidth="8" /><circle cx="56" cy="56" r={radius} fill="none" stroke="#477669" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} /></svg><div className="text-center"><strong className="block text-2xl">{value}%</strong><span className="text-xs text-[#74746f]">complete</span></div></div>; }
function GoalsView({ goal, setGoal, percent }: { goal: GoalData; setGoal: (goal: GoalData) => void; percent: number }) { return <><PageHeading eyebrow="Long-term direction" title="Your goal" description="Keep the destination clear enough to guide you, but gentle enough to evolve." /><div className="grid gap-5 lg:grid-cols-[1fr_.75fr]"><form className="card space-y-5 p-6" onSubmit={(e) => e.preventDefault()}><label className="block"><span className="field-label">Goal name</span><Input value={goal.title} onChange={(e) => setGoal({ ...goal, title: e.target.value })} /></label><label className="block"><span className="field-label">Why it matters</span><Textarea value={goal.intention} onChange={(e) => setGoal({ ...goal, intention: e.target.value })} rows={5} /></label><label className="block"><span className="field-label">Target date</span><Input type="date" value={goal.target} onChange={(e) => setGoal({ ...goal, target: e.target.value })} /></label><p className="text-xs text-[#77756f]">Changes are saved automatically to this private workspace.</p></form><article className="card grid place-items-center p-8 text-center"><ProgressRing value={percent} /><h2 className="mt-5 font-serif text-2xl">Moving with intention</h2><p className="mt-2 text-sm text-[#77756f]">Your roadmap averages {percent}% complete.</p></article></div></>; }
function RoadmapView({ milestones, setMilestones, progress, active, setActive, openTasks }: { milestones: MilestoneData[]; setMilestones: React.Dispatch<React.SetStateAction<MilestoneData[]>>; progress: (title: string) => number; active: string; setActive: (value: string) => void; openTasks: () => void }) { const add = () => { const item = { id: Date.now(), title: `Milestone ${milestones.length + 1}`, detail: "Describe what success looks like" }; setMilestones((items) => [...items, item]); setActive(item.title); }; return <><PageHeading eyebrow="The path ahead" title="Roadmap" description="Edit each phase, then connect concrete tasks to it." action={<Button onClick={add} className="rounded-xl bg-[#284f43]"><Plus /> Add milestone</Button>} /><div className="grid gap-4 lg:grid-cols-2">{milestones.map((item, index) => { const percent = progress(item.title); return <article key={item.id} onClick={() => setActive(item.title)} className={`card p-6 ${active === item.title ? "ring-2 ring-[#61877b]" : ""}`}><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-full bg-[#e8efeb] font-serif text-lg text-[#315d50]">{index + 1}</span><span className="text-sm font-semibold">{percent}%</span></div><Input aria-label="Milestone title" value={item.title} onChange={(event) => setMilestones((items) => items.map((value) => value.id === item.id ? { ...value, title: event.target.value } : value))} className="mt-6 text-lg font-semibold" /><Input aria-label="Milestone description" value={item.detail} onChange={(event) => setMilestones((items) => items.map((value) => value.id === item.id ? { ...value, detail: event.target.value } : value))} className="mt-2" /><Progress value={percent} className="mt-5 [&_[data-slot=progress-indicator]]:bg-[#5c8579]" /></article>; })}</div><Button className="mt-5 rounded-xl bg-[#284f43]" onClick={openTasks}>Plan tasks for {active}</Button></>; }
function TasksView({ tasks, toggleTask, removeTask, taskDialog }: { tasks: Task[]; toggleTask: (id: number) => void; removeTask: (id: number) => void; taskDialog: React.ReactNode }) { return <><PageHeading eyebrow="Small next steps" title="Tasks" description="Keep actions concrete, finishable, and connected to the larger goal." action={taskDialog} /><div className="card divide-y p-3 sm:p-6">{tasks.length ? tasks.map((task) => <div key={task.id} className="flex items-center gap-3 px-2 py-4"><Checkbox checked={task.done} onCheckedChange={() => toggleTask(task.id)} /><div className="min-w-0 flex-1"><p className={`text-sm font-medium ${task.done ? "text-[#99968e] line-through" : ""}`}>{task.title}</p><p className="mt-1 text-xs text-[#85827b]">{task.milestone} · {task.duration}</p></div><Button variant="ghost" size="icon-sm" onClick={() => removeTask(task.id)}><Trash2 /><span className="sr-only">Delete task</span></Button></div>) : <p className="p-8 text-center text-sm text-[#77756f]">No tasks yet. Add one small next step.</p>}</div></>; }
function NotesView({ notes, newNote, setNewNote, addNote, remove }: { notes: Note[]; newNote: { title: string; body: string }; setNewNote: React.Dispatch<React.SetStateAction<{ title: string; body: string }>>; addNote: (event: FormEvent) => void; remove: (id: number) => void }) { return <><PageHeading eyebrow="Capture what matters" title="Notes" description="Write ideas in your own words so they remain useful later." /><div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]"><form onSubmit={addNote} className="card h-fit space-y-4 p-6"><Input aria-label="Note title" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} placeholder="Note title" /><Textarea aria-label="Note body" value={newNote.body} onChange={(e) => setNewNote({ ...newNote, body: e.target.value })} placeholder="What do you want to remember?" rows={7} /><Button type="submit" className="rounded-xl bg-[#284f43]">Save note</Button></form><div className="grid gap-4 sm:grid-cols-2">{notes.map((note) => <article key={note.id} className="card p-5"><div className="flex justify-between gap-3"><span className="text-xs text-[#89867f]">{note.date}</span><button aria-label={`Delete ${note.title}`} onClick={() => remove(note.id)}><Trash2 className="size-4 text-[#9b9890]" /></button></div><h2 className="mt-6 font-serif text-2xl">{note.title}</h2><p className="mt-3 text-sm leading-relaxed text-[#77756f]">{note.body}</p></article>)}</div></div></>; }
function ProgressView({ tasks, percent, milestones, progress }: { tasks: Task[]; percent: number; milestones: MilestoneData[]; progress: (title: string) => number }) { const done = tasks.filter((t) => t.done).length; const remaining = tasks.length - done; return <><PageHeading eyebrow="See the movement" title="Progress" description="A calm record of effort—not pressure, just evidence that you are moving." /><div className="grid gap-5 md:grid-cols-3"><article className="card p-6"><p className="eyebrow">Goal completion</p><strong className="mt-6 block font-serif text-5xl">{percent}%</strong><Progress value={percent} className="mt-5 [&_[data-slot=progress-indicator]]:bg-[#5c8579]" /></article><article className="card p-6"><p className="eyebrow">Tasks completed</p><strong className="mt-6 block font-serif text-5xl">{done}</strong><p className="mt-3 text-sm text-[#77756f]">out of {tasks.length} planned actions</p></article><article className="card bg-[#2e5147] p-6 text-white"><p className="eyebrow !text-white/60">Next steps</p><strong className="mt-6 block font-serif text-5xl">{remaining}</strong><p className="mt-3 text-sm text-white/65">tasks still open</p></article></div><article className="card mt-5 p-6"><p className="eyebrow">Milestone progress</p><div className="mt-6 space-y-5">{milestones.map((item) => { const value = progress(item.title); return <div key={item.id}><div className="mb-2 flex justify-between text-sm"><span>{item.title}</span><span>{value}%</span></div><Progress value={value} className="[&_[data-slot=progress-indicator]]:bg-[#5c8579]" /></div>; })}</div></article></>; }
function ResourcesView({ resources, newResource, setNewResource, addResource, remove }: { resources: Resource[]; newResource: { name: string; url: string }; setNewResource: React.Dispatch<React.SetStateAction<{ name: string; url: string }>>; addResource: (event: FormEvent) => void; remove: (id: number) => void }) { return <><PageHeading eyebrow="Your reference shelf" title="Resources" description="Keep the few links that genuinely help you learn and make progress." /><form onSubmit={addResource} className="card mb-5 grid gap-3 p-5 md:grid-cols-[1fr_1.3fr_auto]"><Input aria-label="Resource name" value={newResource.name} onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} placeholder="Resource name" /><Input aria-label="Resource URL" type="url" value={newResource.url} onChange={(e) => setNewResource({ ...newResource, url: e.target.value })} placeholder="https://…" /><Button type="submit" className="rounded-xl bg-[#284f43]">Save link</Button></form><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <article key={resource.id} className="card p-5"><div className="flex justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f0ed] text-[#31584c]"><Link2 /></span><button aria-label={`Delete ${resource.name}`} onClick={() => remove(resource.id)}><Trash2 className="size-4 text-[#9b9890]" /></button></div><h2 className="mt-6 text-lg font-semibold">{resource.name}</h2><p className="mt-1 text-sm text-[#77756f]">{resource.kind}</p><a href={resource.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#426a5e]">Open resource <ArrowUpRight className="size-4" /></a></article>)}</div></>; }
function JournalView({ entries, setEntries }: { entries: JournalEntry[]; setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>> }) { const [draft, setDraft] = useState(""); const save = () => { const body = draft.trim(); if (!body) return; setEntries((items) => [{ id: Date.now(), body, date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) }, ...items]); setDraft(""); }; return <><PageHeading eyebrow="Pause and notice" title="Journal" description="Reflect on what worked, what felt difficult, and what deserves your attention next." /><div className="grid gap-5 lg:grid-cols-[1fr_.7fr]"><article className="card p-6"><p className="eyebrow">Today’s prompt</p><h2 className="mt-6 font-serif text-3xl">What felt a little easier today?</h2><Textarea aria-label="Journal reflection" value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-6 min-h-52" placeholder="Write without judging the words…" /><Button onClick={save} className="mt-4 rounded-xl bg-[#284f43]">Save reflection</Button></article><aside className="space-y-4">{entries.length ? entries.map((entry) => <article key={entry.id} className="card p-5"><div className="flex justify-between"><span className="text-xs text-[#89867f]">{entry.date}</span><button aria-label="Delete reflection" onClick={() => setEntries((items) => items.filter((item) => item.id !== entry.id))}><Trash2 className="size-4" /></button></div><p className="mt-3 text-sm leading-relaxed text-[#77756f]">{entry.body}</p></article>) : <p className="card p-6 text-sm text-[#77756f]">Your saved reflections will appear here.</p>}</aside></div></>; }
