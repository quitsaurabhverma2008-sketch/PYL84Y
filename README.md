<div align="center">

# 🔥 PYL84Y

### **Chat • Voice • Video — Instant Communication Platform**

A modern, mobile-friendly social media web app with temporary & permanent chat rooms, real-time messaging, voice/video calls, image sharing, 50+ dynamic color themes, chat backgrounds, and a powerful admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-DC382C?style=for-the-badge&logo=redis)
![Vercel Blob](https://img.shields.io/badge/Vercel-Blob-000?style=for-the-badge&logo=vercel)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B35?style=for-the-badge&logo=webrtc)
![Three.js](https://img.shields.io/badge/Three.js-3D-000?style=for-the-badge&logo=three.js)
![anime.js](https://img.shields.io/badge/anime.js-Animations-EA4C70?style=for-the-badge)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)

**🚀 Live App:** [pyl84y.vercel.app](https://pyl84y.vercel.app) &nbsp;|&nbsp; **🔧 Admin:** [pyl84y.vercel.app/admin](https://pyl84y.vercel.app/admin)

---

<img src="https://img.shields.io/badge/💬_Chat-Real--time Messaging-purple" alt="Chat"/> <img src="https://img.shields.io/badge/📞_Voice_Calls-WebRTC-green" alt="Voice"/> <img src="https://img.shields.io/badge/📹_Video_Calls-P2P-blue" alt="Video"/> <img src="https://img.shields.io/badge/🎨_50%2B_Themes-Dynamic_Combos-pink" alt="Themes"/> <img src="https://img.shields.io/badge/🖼️_Image_Sharing-Vercel_Blob-orange" alt="Images"/> <img src="https://img.shields.io/badge/📦_ZIP_Export-Admin_Dashboard-red" alt="Admin"/>

</div>

---

## ✨ Features

<div align="center">

| 💬 Chat | 📞 Voice & Video | 🎨 Themes & UI | 🔐 Rooms | 🛡️ Admin |
|---------|-----------------|----------------|----------|----------|
| Real-time messaging | Browser-based calls | 50+ color combos | Temporary (24h) | Password-protected |
| Emoji-free clean SVG icons | No app install needed | Dynamic CSS variables | Permanent (7 days) | Live countdown timer |
| Download chat logs | WebRTC P2P | Chat background images | 4-digit code join | ZIP data export |
| Image send & save | Video + Voice toggle | Three.js 3D backgrounds | Searchable codes | Full chat history |
| Custom chat backgrounds | WhatsApp-style layout | anime.js animations | Profile data | Theme change tracking |

</div>

---

## 🎨 Dynamic Theme System

<div align="center">

| Feature | Description |
|---------|-------------|
| **50+ Color Combos** | Deep Space, Neon Tokyo, Sakura Blossom, Vaporwave, Cyberpunk 2099, and more |
| **Chat Backgrounds** | Anime, Nature, Space, Abstract, Cute, Dark categories via Unsplash + Waifu APIs |
| **3D Backgrounds** | Three.js animated particle systems on login & chat pages |
| **Smooth Animations** | anime.js staggered entrances, message slide-in, counter animations |
| **Persistent Themes** | Saved per permanent user in Redis + localStorage fallback |
| **Combo History** | All theme changes tracked and visible in admin dashboard |

</div>

> Permanent users can access the theme picker from the chat room menu. Non-permanent users see a locked screen prompting them to upgrade.

---

## 🏗️ Architecture

<div align="center">

```
┌──────────────────────────────────────────────────────────┐
│                     PYL84Y App                            │
├────────────────────┬────────────────────┬─────────────────┤
│    🖥️ Frontend     │    ⚙️ Backend      │   💾 Storage    │
│                    │                    │                 │
│  Next.js 16        │  API Routes        │  Upstash        │
│  React 19          │  RESTful APIs      │  Redis (KV)     │
│  TypeScript 5      │  Serverless        │                 │
│  Tailwind CSS 4    │                    │  Vercel Blob    │
│  WebRTC            │                    │  (Images)       │
│  Three.js 3D       │                    │                 │
│  anime.js          │                    │  User Prefs     │
│  50+ Theme Combos  │                    │  (Theme History)│
├────────────────────┴────────────────────┴─────────────────┤
│               🌐 Deployed on Vercel                       │
└──────────────────────────────────────────────────────────┘
```

</div>

---

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **Login** | `/` | Choose room type, enter name, join/create, 3D particle background |
| 💬 **Chat Room** | `/room/[id]` | Real-time chat, voice/video calls, images, theme picker, chat BG |
| 🛡️ **Admin Dashboard** | `/admin` | All data, search, countdown timer, ZIP export, theme history |

---

## 🚀 Room Types

### ⚡ Non-Permanent Room
```
1. Click "Non-Permanent Room"
2. Enter your name
3. Get a 4-digit code
4. Share code with friends
5. Chat saved for 24 hours
```

### 🔒 Permanent Room
```
1. Click "Permanent Room"
2. Read the 7-day warning
3. Enter Name, Gmail, Phone
4. Get an 8-character code
5. Others can search & join
6. Valid for 7 days
7. Unlock 50+ color themes & chat backgrounds
```

---

## 📞 Voice & Video Calls

| Feature | Detail |
|---------|--------|
| **Protocol** | WebRTC P2P |
| **Video Layout** | WhatsApp-style — remote full screen, local PIP corner |
| **Voice Layout** | Gradient background + pulsing avatar + duration timer |
| **Call Signaling** | Server-mediated via `/api/calls` |
| **ICE Handling** | STUN servers (Google) with candidate exchange |
| **Call States** | Ringing → Answered/Declined → Active → Ended |

---

## 🛡️ Admin Dashboard

Password-protected dashboard with:

- 📊 **Live Stats** — Total rooms, users, messages (animated counters)
- 🔍 **Search** — By code, name, email, phone, message text
- ⏱️ **Countdown Timer** — Live timer showing when data auto-cleans
- 📦 **Download All (ZIP)** — All rooms in separate folders with chat logs
- 📥 **Download Room** — Individual room ZIP export
- 🟢 **Storage Status** — Upstash Redis connected indicator
- ⚠️ **Cleanup Warning** — Download data before 3-day auto-wipe
- 🎨 **Theme History** — View which themes each user has switched to

---

## 🧹 Auto-Cleanup System

| Feature | Detail |
|---------|--------|
| **Interval** | Every 3 days |
| **Timer** | Live countdown on admin dashboard |
| **Cleanup** | Expired rooms + old messages deleted |
| **Warning** | "Download before cleanup!" reminder |
| **Images** | Stored on Vercel Blob, cleaned after 3 days |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19 | UI & routing |
| **Styling** | Tailwind CSS 4 + CSS Variables | Dynamic theming |
| **Language** | TypeScript 5 | Type safety |
| **Storage** | Upstash Redis | Persistent data (rooms, users, messages, prefs) |
| **Images** | Vercel Blob | Server-side image storage |
| **Calls** | WebRTC | Browser-based P2P voice & video |
| **3D Graphics** | Three.js | Animated particle backgrounds |
| **Animations** | anime.js v4 | Staggered entrances, message animations |
| **Themes** | 50+ Color Combos | Dynamic CSS custom properties |
| **Chat BGs** | Unsplash + Waifu APIs | Background image picker |
| **Deployment** | Vercel | Serverless hosting |
| **ZIP Export** | JSZip | Client-side ZIP generation |
| **Runtime** | Node.js 24 | Server environment |

---

## 📁 Project Structure

```
PYL84Y/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Login / Home (3D particles)
│   │   ├── admin/page.tsx                # Admin Dashboard
│   │   ├── room/[id]/page.tsx            # Chat Room (calls, themes, bg)
│   │   └── api/
│   │       ├── rooms/                    # Room CRUD APIs
│   │       ├── messages/                 # Chat messages API
│   │       ├── calls/                    # WebRTC call signaling
│   │       ├── upload/                   # Image upload (Vercel Blob)
│   │       ├── user-preferences/         # Theme & chat BG persistence
│   │       └── admin/                    # Admin data & export
│   ├── components/
│   │   ├── ParticleBackground.tsx        # Three.js login background
│   │   ├── ChatBackground.tsx            # Three.js chat background
│   │   ├── ThemeProvider.tsx             # Dynamic theme context
│   │   ├── ThemePicker.tsx               # 50+ color combo picker
│   │   ├── ChatBgPicker.tsx              # Chat background image picker
│   │   └── ThemeProviderWrap.tsx         # App wrapper
│   ├── hooks/
│   │   └── useDevice.ts                  # Mobile/tablet/desktop detection
│   └── lib/
│       ├── db.ts                         # Upstash Redis + cleanup + prefs
│       └── themes.ts                     # 50+ ColorCombo definitions
├── server.js                             # Production server
├── package.json
└── tsconfig.json
```

---

## 🏃 Getting Started

```bash
# Clone
git clone https://github.com/quitsaurabhverma2008-sketch/PYL84Y.git
cd PYL84Y

# Install
npm install

# Development
npm run dev

# Production
npm run build
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Yes (prod) | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (prod) | Upstash Redis REST Token |
| `BLOB_READ_WRITE_TOKEN` | Yes (prod) | Vercel Blob storage token |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rooms` | Create non-permanent room |
| `POST` | `/api/rooms/join` | Join room with 4-digit code |
| `POST` | `/api/rooms/permanent` | Create permanent room |
| `POST` | `/api/rooms/join-permanent` | Join permanent room |
| `GET` | `/api/rooms/search?code=` | Search permanent room |
| `GET` | `/api/messages?roomId=` | Get room messages |
| `POST` | `/api/messages` | Send message |
| `POST` | `/api/upload` | Upload image (Blob) |
| `POST` | `/api/calls` | Call signaling (initiate/answer/decline/end/ice) |
| `GET` | `/api/calls?roomId=&userId=` | Poll call state |
| `GET/POST` | `/api/user-preferences` | Theme & chat BG persistence |
| `GET` | `/api/admin/all-data` | Admin: all data + theme history |
| `GET` | `/api/admin/export` | Admin: export data |
| `POST` | `/api/admin/cleanup` | Admin: manual cleanup |

---

## 👨‍💻 Author

**Quitsaurabh Verma**

[![GitHub](https://img.shields.io/badge/GitHub-quitsaurabhverma2008--sketch-181717?style=for-the-badge&logo=github)](https://github.com/quitsaurabhverma2008-sketch)

---

## 📜 License

MIT License — Free to use and modify.

---

<div align="center">

**Built with ❤️ using Next.js + Three.js + anime.js + Upstash Redis + Vercel**

[⬆ Back to Top](#-pyl84y)

</div>
