# PYL84Y

**Chat • Voice • Video** — A real-time social media web app with temporary and permanent chat rooms, voice/video calls, and an admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

---

## Features

### Chat Rooms
- **Non-Permanent Rooms** — Quick 4-digit code, chats saved for 24 hours
- **Permanent Rooms** — 8-character code, valid for 7 days, searchable by others
- **Image Sharing** — Send pics, auto-delete after 30 minutes
- **Chat Download** — Export full chat log as `.txt`
- **Image Save** — Download any shared image with one click

### Voice & Video Calls
- Browser-based **WebRTC** voice calls
- Browser-based **WebRTC** video calls
- No app install required — works directly in browser

### Admin Dashboard
- View all rooms, users, and messages in real-time
- Search by room code, name, email, phone, or message content
- **Download All** — Export every room as a ZIP with separate folders
- **Download Room** — Export a single room's data as ZIP
- Each folder contains `room-info.txt`, `chat.txt`, and `room.json`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Real-time | Polling (upgradeable to Socket.io) |
| Calls | WebRTC (browser native) |
| Storage | In-memory (upgradeable to database) |
| ZIP Export | JSZip |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/quitsaurabhverma2008-sketch/PYL84Y.git
cd PYL84Y
npm install
```

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
PYL84Y/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Login / Home page
│   │   ├── admin/page.tsx        # Admin Dashboard
│   │   ├── room/[id]/page.tsx    # Chat Room
│   │   ├── api/
│   │   │   ├── rooms/            # Room CRUD
│   │   │   ├── messages/         # Chat messages
│   │   │   ├── upload/           # Image upload
│   │   │   └── admin/            # Admin data & export
│   │   └── globals.css
│   ├── lib/
│   │   └── db.ts                 # Shared data store
│   └── types/
│       └── index.ts              # TypeScript types
├── server.js                     # Production server
├── public/uploads/               # Uploaded images (auto-cleaned)
├── package.json
└── tsconfig.json
```

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Login — choose Non-Permanent or Permanent room |
| `/room/[id]` | Chat room with calls, images, downloads |
| `/admin` | Admin dashboard — all data, search, ZIP export |

---

## License

MIT
