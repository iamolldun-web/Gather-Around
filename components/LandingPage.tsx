import React from 'react';
import { ArrowRight, BookOpen, Compass, Globe2, Mountain, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const paperLayers = [
  {
    color: 'bg-gradient-to-b from-[#f7f1e6] to-[#efe3d4]',
    clip: 'polygon(0 0, 100% 0, 100% 80%, 65% 90%, 40% 82%, 0 88%)'
  },
  {
    color: 'bg-gradient-to-b from-[#f2e7d7] to-[#e6d9c5]',
    clip: 'polygon(0 8%, 100% 3%, 100% 86%, 70% 95%, 35% 86%, 0 93%)'
  },
  {
    color: 'bg-gradient-to-b from-[#e8dcc9] to-[#d7c6b1]',
    clip: 'polygon(0 15%, 100% 12%, 100% 88%, 75% 94%, 32% 88%, 0 92%)'
  },
  {
    color: 'bg-gradient-to-b from-[#d7c8b2] to-[#c4b29c]',
    clip: 'polygon(0 20%, 100% 18%, 100% 85%, 72% 92%, 28% 86%, 0 90%)'
  },
  {
    color: 'bg-gradient-to-b from-[#b49f86] to-[#9c8569]',
    clip: 'polygon(0 25%, 100% 24%, 100% 82%, 70% 90%, 25% 84%, 0 88%)'
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eadfcb] text-[#2f1e14]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff9ec]/80 via-[#f1e3cd]/60 to-[#e3d2b6]/40" aria-hidden />
      <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #ffffff 0, transparent 35%), radial-gradient(circle at 80% 10%, #f5dec0 0, transparent 40%), radial-gradient(circle at 60% 70%, #f3e4d1 0, transparent 35%)' }} />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12 md:px-10 lg:py-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d0b89a] shadow-[0_10px_0_rgba(62,42,26,0.2)]">
              <BookOpen className="h-6 w-6 text-[#2f1e14]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#7d5b3d]">Paper-cut tales</p>
              <h1 className="font-serif text-2xl font-black leading-tight">Gather Around</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 text-sm font-semibold text-[#7d5b3d] md:flex">
            <span className="rounded-full bg-white/60 px-3 py-1 shadow">No ads</span>
            <span className="rounded-full bg-white/60 px-3 py-1 shadow">Family cozy</span>
            <span className="rounded-full bg-white/60 px-3 py-1 shadow">Global voices</span>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#7d5b3d] shadow">
              <Sparkles className="h-4 w-4" />
              A hand-cut world of stories
            </div>
            <div className="space-y-4">
              <p className="font-serif text-5xl font-black leading-tight text-[#2b1b12] md:text-6xl">Share folktales that feel like layers of paper and light.</p>
              <p className="max-w-2xl text-lg text-[#5d4330] md:text-xl">
                Wander through mountain silhouettes, lantern-lit towers, and rivers of parchment. Gather Around curates family-friendly stories with guided narration, cultural notes, and shared rituals.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onStart}
                className="group inline-flex items-center justify-center rounded-2xl bg-[#cb3f2e] px-7 py-4 text-lg font-black tracking-wide text-[#fff9ec] shadow-[0_14px_0_rgba(80,33,24,0.4)] transition-transform duration-150 hover:-translate-y-1 active:translate-y-1 active:shadow-[0_8px_0_rgba(80,33,24,0.35)]"
              >
                Begin the journey
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-[#5d4330] shadow">
                <Globe2 className="h-5 w-5 text-[#cb3f2e]" />
                18+ curated regions
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[{
                label: 'Layered tales',
                value: 'Short & cozy'
              }, {
                label: 'Guided audio',
                value: 'Whisper-soft'
              }, {
                label: 'Keepsake badges',
                value: 'Crafted art'
              }].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#d9c6aa] bg-white/70 p-4 shadow">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#7d5b3d]">{stat.label}</p>
                  <p className="mt-2 text-lg font-bold text-[#2f1e14]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-[#fefbf5] via-[#f1e7d5] to-[#ddc7ab] shadow-[0_24px_60px_rgba(47,30,20,0.25)]" aria-hidden />
            <div className="relative overflow-hidden rounded-[32px] border border-[#e2d4bf] bg-[#fdf7ed]/80 backdrop-blur">
              <div className="relative h-[420px]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#3a5f8a] via-[#7796b5] to-[#fdf7ed]" />
                <div className="absolute inset-0" aria-hidden>
                  {paperLayers.map((layer, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-0 ${layer.color}`}
                      style={{
                        clipPath: layer.clip,
                        transform: `translateY(${idx * 8}px)`
                      }}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col justify-between px-8 py-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="rounded-full bg-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]">Sky path</div>
                    <div className="flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-xs font-semibold">
                      <Mountain className="h-4 w-4" />
                      Layered ridges
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f8efe1]/90 p-5 text-[#2f1e14] shadow">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#7d5b3d]">Tonight&apos;s paper city</p>
                    <h2 className="mt-2 font-serif text-3xl font-black">Lanterns Above Alhambra</h2>
                    <p className="mt-2 text-sm text-[#5d4330]">
                      Follow three cranes gliding over lantern-lit towers and mountain folds. Each chapter reveals a layer of craft and a whisper of courage.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <span className="rounded-full bg-[#cb3f2e] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#fff9ec]">8 min read</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7d5b3d]">Guided prompts</span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7d5b3d]">Soft narration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-[28px] border border-[#e2d4bf] bg-white/70 p-6 shadow lg:grid-cols-3">
          {[{
            title: 'Handcrafted atmosphere',
            body: 'Layered gradients, soft paper shadows, and illustrated accents make bedtime feel like stepping into a diorama.',
            icon: <Sparkles className="h-6 w-6 text-[#cb3f2e]" />
          }, {
            title: 'Guided by culture',
            body: 'Context notes, pronunciations, and gentle prompts highlight the meaning behind every folktale moment.',
            icon: <Compass className="h-6 w-6 text-[#cb3f2e]" />
          }, {
            title: 'Together from anywhere',
            body: 'Sync progress, share narration, and let family members leave keepsake reactions on favorite pages.',
            icon: <Globe2 className="h-6 w-6 text-[#cb3f2e]" />
          }].map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3 rounded-2xl bg-[#fdf7ed] p-6 shadow-inner">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eddcc4] text-[#2f1e14] shadow">{feature.icon}</div>
              <h3 className="text-xl font-black">{feature.title}</h3>
              <p className="text-sm text-[#5d4330]">{feature.body}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-10 rounded-[28px] border border-[#e2d4bf] bg-white/80 p-8 shadow lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-[#7d5b3d]">How it flows</p>
            <h2 className="font-serif text-4xl font-black leading-tight text-[#2b1b12]">A ritual with soft edges and steady glow.</h2>
            <p className="text-[#5d4330]">
              Select a region, choose a length, and we wrap it in cozy narration, gentle haptics, and reflection prompts so the whole family can settle in.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {[{
                title: 'Pick the backdrop',
                detail: 'Mountains, coasts, markets, or forests — choose the vibe and we layer matching tales.'
              }, {
                title: 'Listen together',
                detail: 'Whispered narration with highlighted lines and soft page turns for calm nights.'
              }, {
                title: 'Keep a keepsake',
                detail: 'Collect badges styled like paper stamps that echo the art of each culture.'
              }].map((item, index) => (
                <div key={item.title} className="rounded-2xl border border-[#e2d4bf] bg-[#fdf7ed] p-4 shadow">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#cb3f2e] text-sm font-black text-[#fff9ec] shadow-inner">{index + 1}</div>
                  <h4 className="text-lg font-bold">{item.title}</h4>
                  <p className="mt-1 text-sm text-[#5d4330]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] bg-gradient-to-b from-[#fefbf5] to-[#ecd8be] p-6 shadow-inner">
            <div className="flex items-center gap-3 text-[#7d5b3d]">
              <Compass className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Tonight&apos;s route</p>
            </div>
            <div className="rounded-2xl border border-[#e2d4bf] bg-white p-4 shadow">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7d5b3d]">Journey</p>
              <h3 className="mt-1 font-serif text-2xl font-black text-[#2f1e14]">Moonlit Courtyards</h3>
              <p className="mt-2 text-sm text-[#5d4330]">Four chapters that move from bustling plazas to silent mountain passes. Perfect for a weekend wind-down.</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[#5d4330]">
                <span className="rounded-xl bg-[#f6e9d5] px-3 py-2 font-semibold">12 minutes</span>
                <span className="rounded-xl bg-[#f6e9d5] px-3 py-2 font-semibold">Family-safe</span>
                <span className="rounded-xl bg-[#f6e9d5] px-3 py-2 font-semibold">Offline ready</span>
                <span className="rounded-xl bg-[#f6e9d5] px-3 py-2 font-semibold">Guided pause</span>
              </div>
            </div>
            <div className="rounded-2xl border border-[#e2d4bf] bg-white p-4 shadow">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7d5b3d]">Keepsake</p>
              <h3 className="mt-1 text-lg font-bold text-[#2f1e14]">Papercraft cranes badge</h3>
              <p className="mt-2 text-sm text-[#5d4330]">Unlock a layered crane badge when you finish — a memento ready for your family shelf.</p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center gap-6 rounded-[28px] border border-[#e2d4bf] bg-gradient-to-b from-[#fdf7ed] to-[#eddcc4] px-6 py-10 text-center shadow">
          <p className="text-sm uppercase tracking-[0.3em] text-[#7d5b3d]">Turn the page</p>
          <h2 className="font-serif text-4xl font-black leading-tight text-[#2b1b12] md:text-5xl">Gather in the glow of paper cities and mountain silhouettes.</h2>
          <p className="max-w-3xl text-[#5d4330]">
            Every tale is layered like the scene above — crafted with warmth, ready for little listeners and big imaginations. Let&apos;s build a nightly ritual that feels handmade.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="group inline-flex items-center justify-center rounded-2xl bg-[#cb3f2e] px-8 py-4 text-lg font-black tracking-wide text-[#fff9ec] shadow-[0_12px_0_rgba(80,33,24,0.35)] transition-transform duration-150 hover:-translate-y-1 active:translate-y-1 active:shadow-[0_8px_0_rgba(80,33,24,0.28)]"
            >
              Start reading together
              <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-[#5d4330] shadow">
              <BookOpen className="h-5 w-5 text-[#cb3f2e]" />
              New chapters weekly
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
