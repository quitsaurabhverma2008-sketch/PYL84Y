<div align="center">

# 🔥 PYL84Y

### **Chat • Voice • Video — Instant Communication Platform**

A modern, mobile-friendly social media web app with temporary & permanent chat rooms, real-time messaging, voice/video calls, image sharing, and a powerful admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Upstash Redis](https://img.shields.io/badge/Upstash-Redis-DC382C?style=for-the-badge&logo=redis)
![Vercel Blob](https://img.shields.io/badge/Vercel-Blob-000?style=for-the-badge&logo=vercel)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-FF6B35?style=for-the-badge&logo=webrtc)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel)

**🚀 Live App:** [pyl84y.vercel.app](https://pyl84y.vercel.app) &nbsp;|&nbsp; **🔧 Admin:** [pyl84y.vercel.app/admin](https://pyl84y.vercel.app/admin)

---

<img src="https://img.shields.io/badge/💬_Chat-Real--time Messaging-purple" alt="Chat"/> <img src="https://img.shields.io/badge/📞_Voice_Calls-WebRTC-green" alt="Voice"/> <img src="https://img.shields.io/badge/📹_Video_Calls-P2P-blue" alt="Video"/> <img src="https://img.shields.io/badge/🖼️_Image_Sharing-Vercel_Blob-orange" alt="Images"/> <img src="https://img.shields.io/badge/📦_ZIP_Export-Admin_Dashboard-red" alt="Admin"/>

</div>

---

## ✨ Features

<div align="center">

| 💬 Chat | 📞 Voice & Video | 🖼️ Media | 🔐 Rooms | 🛡️ Admin |
|---------|-----------------|----------|---------|----------|
| Real-time messaging | Browser-based calls | Image sharing | Temporary (24h) | Password-protected |
| Emoji-free clean UI | No app install needed | Server-side storage | Permanent (7 days) | Live countdown timer |
| Download chat logs | WebRTC P2P | Save & download | 4-digit code join | ZIP data export |
| Image send & save | Video + Voice toggle | Auto-cleanup | Searchable codes | Full chat history |

</div>

---

## 🏗️ Architecture

<div align="center">

```
┌─────────────────────────────────────────────────────┐
│                   PYL84Y App                        │
├──────────────────┬──────────────────┬───────────────┤
│   🖥️ Frontend    │   ⚙️ Backend     │  💾 Storage   │
│                  │                  │               │
│  Next.js 16      │  API Routes      │  Upstash      │
│  React 19        │  RESTful APIs    │  Redis (KV)   │
│  TypeScript 5    │  Serverless      │               │
│  Tailwind CSS 4  │                  │  Vercel Blob  │
│  WebRTC          │                  │  (Images)     │
├──────────────────┴──────────────────┴───────────────┤
│              🌐 Deployed on Vercel                  │
└─────────────────────────────────────────────────────┘
```

</div>

---

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| 🏠 **Login** | `/` | Choose room type, enter name, join/create |
| 💬 **Chat Room** | `/room/[id]` | Real-time chat, voice/video calls, images |
| 🛡️ **Admin Dashboard** | `/admin` | All data, search, countdown timer, ZIP export |

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
```

---

## 🛡️ Admin Dashboard

Password-protected dashboard with:

- 📊 **Live Stats** — Total rooms, users, messages
- 🔍 **Search** — By code, name, email, phone, message text
- ⏱️ **Countdown Timer** — Live timer showing when data auto-cleans
- 📦 **Download All (ZIP)** — All rooms in separate folders
- 📥 **Download Room** — Individual room ZIP export
- 🟢 **Storage Status** — Upstash Redis connected indicator
- ⚠️ **Cleanup Warning** — Download data before 3-day auto-wipe

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
| **Styling** | Tailwind CSS 4 | Dark mobile-first design |
| **Language** | TypeScript 5 | Type safety |
| **Storage** | Upstash Redis | Persistent data (rooms, users, messages) |
| **Images** | Vercel Blob | Server-side image storage |
| **Calls** | WebRTC | Browser-based P2P voice & video |
| **Deployment** | Vercel | Serverless hosting |
| **ZIP Export** | JSZip | Client-side ZIP generation |
| **Runtime** | Node.js 24 | Server environment |

---

## 📁 Project Structure

```
PYL84Y/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Login / Home page
│   │   ├── admin/page.tsx            # Admin Dashboard
│   │   ├── room/[id]/page.tsx        # Chat Room
│   │   └── api/
│   │       ├── rooms/                # Room CRUD APIs
│   │       ├── messages/             # Chat messages API
│   │       ├── upload/               # Image upload (Vercel Blob)
│   │       └── admin/                # Admin data & export
│   ├── lib/
│   │   └── db.ts                     # Upstash Redis + cleanup system
│   └── types/
│       └── index.ts                  # TypeScript interfaces
├── server.js                         # Production server
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
| `GET` | `/api/admin/all-data` | Admin: all data |
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

**Built with ❤️ using Next.js + Upstash Redis + Vercel**

[⬆ Back to Top](#-pyl84y)

</div>
