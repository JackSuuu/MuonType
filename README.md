# ZenType

A typing speed test web app inspired by the aesthetics of Japanese ukiyo-e art and tea room culture. Built with React, TypeScript, and Vite.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-4-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

![](./zentype.png)

## Features

**Test Modes**
- **Time** (15 / 30 / 60 / 120 seconds)
- **Words** (10 / 25 / 50 / 100 words)
- **Quote** (random passages)
- **Zen** (endless, no pressure)

**Live Stats**
- Real-time WPM and accuracy display
- Per-second WPM history chart (Recharts)
- Keyboard error heatmap on results screen
- Personal best tracking

**5 Japanese-Inspired Themes**

| Theme | Name | Description |
|-------|------|-------------|
| Matcha | 抹茶 | Tea Room Green |
| Sumi | 墨染 | Ink Wash Black |
| Ukiyo | 浮世 | Ukiyo-e Blue |
| Shu | 朱砂 | Vermilion Red |
| Yuki | 雪月 | Snow White |

**Sound Profiles** (Web Audio API, no audio files)
- Wood (bamboo), Mechanical, Soft, Typewriter, Silent

**Word Lists**
- English 200, English 1k, Code keywords, Japanese romaji

**Other**
- Sakura petal particle effect on test completion
- Seigaiha wave pattern background
- Blind mode toggle
- All data persisted to LocalStorage (no backend required)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 4 |
| Styling | Tailwind CSS 3, CSS custom properties |
| State | Zustand (3 stores: typing, settings, history) |
| Animation | Framer Motion |
| Charts | Recharts |
| Sound | Web Audio API (procedural synthesis) |
| Routing | React Router v6 |
| Storage | LocalStorage |

## Getting Started

### Prerequisites

- Node.js >= 18

### Install

```bash
git clone git@github.com:JackSuuu/ZenType.git
cd ZenType
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── types/index.ts              # TypeScript types and theme config
├── data/wordlists.ts           # Word lists and quote data
├── stores/
│   ├── typingStore.ts          # Test state machine, WPM calc, results
│   ├── settingsStore.ts        # User preferences (persisted)
│   └── historyStore.ts         # Test history (persisted, last 100)
├── hooks/
│   ├── useTypingEngine.ts      # Core typing logic (useRef-based perf)
│   ├── useTimer.ts             # 1s interval timer
│   ├── useSound.ts             # Web Audio API sound synthesis
│   └── useTheme.ts             # CSS variable theme switching
├── components/
│   ├── Header/Header.tsx       # Navigation, theme dots, PB badge
│   ├── TypingArea/TypingArea.tsx   # Windowed word rendering, cursor
│   ├── Stats/StatsPanel.tsx    # Live WPM / accuracy / timer
│   ├── Results/Results.tsx     # WPM chart, error heatmap, stats
│   ├── Settings/SettingsPanel.tsx  # Theme, sound, display settings
│   └── ui/                     # Modal, Button, Tabs, BackgroundPattern
└── pages/
    ├── Home.tsx                # Typing test page
    └── History.tsx             # Past results and progress charts
```

## Architecture Notes

### Performance

The typing engine (`useTypingEngine`) uses `useRef` for all per-keystroke state to avoid React re-renders on every keypress. Zustand store is only updated on **word boundaries** (space key), not per character. The `TypingArea` uses windowed rendering (3 visible lines) and memoized word components.

### Sound System

All sounds are generated procedurally via the Web Audio API using oscillator nodes and noise buffers. No audio files are loaded. Four distinct profiles shape the oscillator parameters to produce wood, mechanical, soft, and typewriter textures.

### Theme System

Themes are driven by CSS custom properties (`--bg`, `--primary`, `--secondary`, etc.) set on `<html>` via the `data-theme` attribute. Tailwind utilities reference these variables. Switching themes triggers a smooth 0.4s CSS transition.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Restart test |
| `Esc` | Close settings modal |

## License

MIT
