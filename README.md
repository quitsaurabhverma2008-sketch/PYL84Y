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

## 🖼️ App Preview

<div align="center">

### 💬 Real-Time Chat with 3D Background

<svg width="380" height="280" viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="chatBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="ownMsg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#6366F1"/>
    </linearGradient>
    <linearGradient id="glowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="blur1"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="shadow1"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#2563EB" flood-opacity="0.3"/></filter>
  </defs>
  <!-- Background -->
  <rect width="380" height="280" rx="16" fill="url(#chatBg)"/>
  <!-- Floating orbs (3D bg) -->
  <circle cx="80" cy="60" r="50" fill="#2563EB" opacity="0.12" filter="url(#blur1)"/>
  <circle cx="300" cy="220" r="60" fill="#6366F1" opacity="0.1" filter="url(#blur1)"/>
  <circle cx="200" cy="40" r="30" fill="#059669" opacity="0.08" filter="url(#blur1)"/>
  <!-- Grid lines -->
  <line x1="0" y1="70" x2="380" y2="70" stroke="#334155" stroke-width="0.3" opacity="0.3"/>
  <line x1="0" y1="140" x2="380" y2="140" stroke="#334155" stroke-width="0.3" opacity="0.3"/>
  <line x1="0" y1="210" x2="380" y2="210" stroke="#334155" stroke-width="0.3" opacity="0.3"/>
  <!-- Header -->
  <rect x="0" y="0" width="380" height="48" fill="#0F172A" opacity="0.92"/>
  <circle cx="28" cy="24" r="14" fill="#2563EB"/>
  <text x="50" y="20" fill="#F8FAFC" font-family="sans-serif" font-size="13" font-weight="700">PYL84Y</text>
  <text x="50" y="34" fill="#94A3B8" font-family="sans-serif" font-size="9">Permanent · ABCD · 2 online</text>
  <circle cx="350" cy="18" r="10" fill="#059669" opacity="0.15"/>
  <text x="346" y="22" fill="#22C55E" font-family="sans-serif" font-size="8" font-weight="700">🎤</text>
  <circle cx="368" cy="18" r="10" fill="#2563EB" opacity="0.15"/>
  <text x="364" y="22" fill="#2563EB" font-family="sans-serif" font-size="8" font-weight="700">📹</text>
  <!-- Other message -->
  <rect x="20" y="70" width="180" height="36" rx="14" fill="rgba(30,41,59,0.6)" stroke="rgba(51,65,85,0.5)" stroke-width="1"/>
  <text x="30" y="84" fill="#818cf8" font-family="sans-serif" font-size="9" font-weight="700">Rahul</text>
  <text x="30" y="98" fill="#F8FAFC" font-family="sans-serif" font-size="11">Hey! What's up? 👋</text>
  <!-- Own message -->
  <rect x="200" y="116" width="160" height="36" rx="14" fill="url(#ownMsg)" filter="url(#shadow1)"/>
  <text x="212" y="138" fill="#FFFFFF" font-family="sans-serif" font-size="11">Hey! All good bro 🚀</text>
  <!-- Another other message -->
  <rect x="20" y="162" width="200" height="36" rx="14" fill="rgba(30,41,59,0.6)" stroke="rgba(51,65,85,0.5)" stroke-width="1"/>
  <text x="30" y="176" fill="#818cf8" font-family="sans-serif" font-size="9" font-weight="700">Rahul</text>
  <text x="30" y="190" fill="#F8FAFC" font-family="sans-serif" font-size="11">Check out the new theme! 🎨</text>
  <!-- Image message -->
  <rect x="210" y="208" width="150" height="40" rx="12" fill="url(#ownMsg)" filter="url(#shadow1)"/>
  <text x="230" y="225" fill="#FFFFFF" font-family="sans-serif" font-size="10">🖼️ Image</text>
  <text x="230" y="238" fill="rgba(255,255,255,0.7)" font-family="sans-serif" font-size="8">Click to save</text>
  <!-- Input bar -->
  <rect x="0" y="252" width="380" height="28" fill="#0F172A" opacity="0.95"/>
  <rect x="10" y="256" width="320" height="20" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <text x="20" y="270" fill="#475569" font-family="sans-serif" font-size="10">Type a message...</text>
  <circle cx="350" cy="266" r="10" fill="url(#ownMsg)"/>
  <text x="347" y="270" fill="#FFF" font-family="sans-serif" font-size="8">▶</text>
</svg>

### 📞 WhatsApp-Style Video Calls

<svg width="380" height="280" viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="callBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#000"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="redBtn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <linearGradient id="greenBtn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
    <filter id="glow2"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="380" height="280" rx="16" fill="url(#callBg)"/>
  <!-- Remote video (full screen simulation) -->
  <rect x="0" y="0" width="380" height="280" rx="16" fill="#1a1a2e"/>
  <circle cx="190" cy="110" r="50" fill="#334155" opacity="0.5"/>
  <text x="175" y="118" fill="#94A3B8" font-family="sans-serif" font-size="30">👤</text>
  <text x="160" y="175" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="600">Incoming Video Call</text>
  <text x="155" y="192" fill="#94A3B8" font-family="sans-serif" font-size="10">Rahul is calling...</text>
  <!-- Local video PIP -->
  <rect x="260" y="20" width="100" height="130" rx="12" fill="#2563EB" opacity="0.3" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
  <text x="290" y="90" fill="#FFF" font-family="sans-serif" font-size="20">👤</text>
  <text x="285" y="108" fill="rgba(255,255,255,0.7)" font-family="sans-serif" font-size="8">You</text>
  <!-- Timer -->
  <rect x="10" y="10" width="60" height="24" rx="12" fill="rgba(0,0,0,0.5)"/>
  <text x="22" y="26" fill="#FFF" font-family="monospace" font-size="11" font-weight="600">05:32</text>
  <!-- Decline button -->
  <circle cx="140" cy="240" r="28" fill="url(#redBtn)"/>
  <text x="133" y="247" fill="#FFF" font-family="sans-serif" font-size="18">📞</text>
  <!-- End call button -->
  <circle cx="240" cy="240" r="28" fill="url(#redBtn)"/>
  <text x="232" y="247" fill="#FFF" font-family="sans-serif" font-size="18">📱</text>
</svg>

### 🎨 50+ Dynamic Color Themes

<svg width="380" height="180" viewBox="0 0 380 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tpBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="380" height="180" rx="16" fill="url(#tpBg)"/>
  <text x="20" y="30" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="800">Color Themes</text>
  <text x="20" y="46" fill="#64748B" font-family="sans-serif" font-size="10">50+ dynamic combos for permanent users</text>
  <!-- Theme cards -->
  <rect x="20" y="60" width="70" height="50" rx="10" fill="#0F172A" stroke="#2563EB" stroke-width="2"/>
  <circle cx="35" cy="75" r="6" fill="#2563EB"/><circle cx="50" cy="75" r="6" fill="#6366F1"/><circle cx="65" cy="75" r="6" fill="#059669"/>
  <text x="35" y="98" fill="#94A3B8" font-family="sans-serif" font-size="8">Deep Space</text>

  <rect x="100" y="60" width="70" height="50" rx="10" fill="#0A000A" stroke="#FF00FF" stroke-width="2"/>
  <circle cx="115" cy="75" r="6" fill="#FF00FF"/><circle cx="130" cy="75" r="6" fill="#00FFFF"/><circle cx="145" cy="75" r="6" fill="#FF3366"/>
  <text x="112" y="98" fill="#94A3B8" font-family="sans-serif" font-size="8">Neon Pulse</text>

  <rect x="180" y="60" width="70" height="50" rx="10" fill="#FFF0F3" stroke="#FFB7C5" stroke-width="2"/>
  <circle cx="195" cy="75" r="6" fill="#FFB7C5"/><circle cx="210" cy="75" r="6" fill="#FF69B4"/><circle cx="225" cy="75" r="6" fill="#DB7093"/>
  <text x="191" y="98" fill="#64748B" font-family="sans-serif" font-size="8">Sakura</text>

  <rect x="260" y="60" width="70" height="50" rx="10" fill="#0D0221" stroke="#FFD700" stroke-width="2"/>
  <circle cx="275" cy="75" r="6" fill="#FFD700"/><circle cx="290" cy="75" r="6" fill="#4B0082"/><circle cx="305" cy="75" r="6" fill="#FFA500"/>
  <text x="269" y="98" fill="#94A3B8" font-family="sans-serif" font-size="8">Royal Gold</text>

  <rect x="20" y="120" width="70" height="50" rx="10" fill="#252A34" stroke="#FF2E63" stroke-width="2"/>
  <circle cx="35" cy="135" r="6" fill="#FF2E63"/><circle cx="50" cy="135" r="6" fill="#08D9D6"/><circle cx="65" cy="135" r="6" fill="#EAEAEA"/>
  <text x="29" y="158" fill="#94A3B8" font-family="sans-serif" font-size="8">Neon Tokyo</text>

  <rect x="100" y="120" width="70" height="50" rx="10" fill="#0D0221" stroke="#FF71CE" stroke-width="2"/>
  <circle cx="115" cy="135" r="6" fill="#FF71CE"/><circle cx="130" cy="135" r="6" fill="#01CDFE"/><circle cx="145" cy="135" r="6" fill="#B967FF"/>
  <text x="109" y="158" fill="#94A3B8" font-family="sans-serif" font-size="8">Vaporwave</text>

  <rect x="180" y="120" width="70" height="50" rx="10" fill="#1A1B26" stroke="#7AA2F7" stroke-width="2"/>
  <circle cx="195" cy="135" r="6" fill="#7AA2F7"/><circle cx="210" cy="135" r="6" fill="#BB9AF7"/><circle cx="225" cy="135" r="6" fill="#9ECE6A"/>
  <text x="186" y="158" fill="#94A3B8" font-family="sans-serif" font-size="8">Tokyo Night</text>

  <rect x="260" y="120" width="70" height="50" rx="10" fill="#0A0A12" stroke="#FCEE09" stroke-width="2"/>
  <circle cx="275" cy="135" r="6" fill="#FCEE09"/><circle cx="290" cy="135" r="6" fill="#00F0FF"/><circle cx="305" cy="135" r="6" fill="#FF2A6D"/>
  <text x="264" y="158" fill="#94A3B8" font-family="sans-serif" font-size="8">Cyberpunk 2099</text>

  <!-- Lock icon for non-permanent -->
  <rect x="340" y="60" width="20" height="110" rx="0" fill="none"/>
  <text x="342" y="120" fill="#64748B" font-family="sans-serif" font-size="24">🔒</text>
</svg>

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

<svg width="520" height="300" viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="archBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="feGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#6366F1" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="beGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="stGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DC382C" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="520" height="300" rx="16" fill="url(#archBg)"/>
  <text x="260" y="30" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">PYL84Y Architecture</text>
  
  <!-- Frontend -->
  <rect x="20" y="50" width="150" height="200" rx="12" fill="url(#feGrad)" stroke="#2563EB" stroke-width="1" opacity="0.8"/>
  <text x="95" y="75" fill="#2563EB" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle">🖥️ Frontend</text>
  <text x="95" y="100" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Next.js 16</text>
  <text x="95" y="118" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">React 19</text>
  <text x="95" y="136" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">TypeScript 5</text>
  <text x="95" y="154" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Three.js 3D</text>
  <text x="95" y="172" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">anime.js</text>
  <text x="95" y="190" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">WebRTC</text>
  <text x="95" y="208" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">50+ Themes</text>
  <text x="95" y="226" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Chat BGs</text>
  
  <!-- Backend -->
  <rect x="185" y="50" width="150" height="200" rx="12" fill="url(#beGrad)" stroke="#059669" stroke-width="1" opacity="0.8"/>
  <text x="260" y="75" fill="#059669" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle">⚙️ Backend</text>
  <text x="260" y="100" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">API Routes</text>
  <text x="260" y="118" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">RESTful APIs</text>
  <text x="260" y="136" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Serverless</text>
  <text x="260" y="154" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Call Signaling</text>
  <text x="260" y="172" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Room CRUD</text>
  <text x="260" y="190" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Cleanup System</text>
  <text x="260" y="208" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">User Prefs</text>
  
  <!-- Storage -->
  <rect x="350" y="50" width="150" height="200" rx="12" fill="url(#stGrad)" stroke="#DC382C" stroke-width="1" opacity="0.8"/>
  <text x="425" y="75" fill="#DC382C" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle">💾 Storage</text>
  <text x="425" y="100" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Upstash Redis</text>
  <text x="425" y="118" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Vercel Blob</text>
  <text x="425" y="136" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Rooms Data</text>
  <text x="425" y="154" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Messages</text>
  <text x="425" y="172" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">User Profiles</text>
  <text x="425" y="190" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Theme History</text>
  <text x="425" y="208" fill="#94A3B8" font-family="sans-serif" font-size="10" text-anchor="middle">Image Files</text>
  
  <!-- Arrows -->
  <line x1="170" y1="150" x2="185" y2="150" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="335" y1="150" x2="350" y2="150" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#475569"/></marker></defs>
  
  <!-- Deployed on Vercel -->
  <rect x="140" y="265" width="240" height="28" rx="14" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="260" y="283" fill="#F8FAFC" font-family="sans-serif" font-size="11" font-weight="600" text-anchor="middle">🌐 Deployed on Vercel</text>
</svg>

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
