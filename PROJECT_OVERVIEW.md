# Vetted — Project Overview

**Status:** Live · **URL:** https://vetted-peach.vercel.app · **Repo:** https://github.com/wealthy-org/Vetted

## Apa ini

Vetted adalah dashboard intelijen trading crypto. Idenya: trader sering ikut
"call" dari KOL (influencer) di X tanpa tahu apakah token yang dipromosikan
itu aman atau rug pull. Vetted men-track call itu, langsung validasi risikonya
lewat data on-chain (likuiditas, pajak beli/jual, honeypot, konsentrasi
holder), dan menyandingkannya dengan aktivitas "smart money" (wallet yang
punya rekam jejak profit) — semua dalam satu dashboard.

## Fitur yang sudah jalan

| Fitur | Deskripsi |
|---|---|
| **Live Feed** | Semua call KOL, auto-tervalidasi begitu terdeteksi, bisa difilter per chain & skor risiko, ada pagination |
| **Risk Score Engine** | Skor 0–100 per token berdasarkan aturan nyata (likuiditas, pajak, honeypot, jumlah holder) |
| **KOL Leaderboard** | Ranking KOL berdasarkan win-rate & rata-rata return — dihitung dari data harga asli, bukan angka hardcode |
| **Smart Money Watch** | Tracking wallet-wallet dengan win-rate tinggi dan aktivitas beli/jual mereka |
| **Narrative Tracker** | Kategori/tren token yang lagi naik (meme, AI agent, dog coin, dll) |
| **Personal Watchlist** | User bisa simpan token yang mau dipantau |
| **Token Detail Page** | Breakdown risiko, tren harga (sparkline), riwayat call, link explorer |
| **Public API** | 2 endpoint publik (skor risiko token, statistik KOL) — dipakai juga di halaman `/docs` |

## Chain yang didukung

Solana, Ethereum, BNB Chain, Optimism, dan **Robinhood** (chain baru yang
lagi ramai — ditambahkan atas saran leader tim). Contoh datanya sengaja
diambil dari token nyata yang mendemonstrasikan risiko: $757K likuiditas
tapi cuma 11 holder — persis kasus yang produk ini dibuat untuk menangkap.

## Cara kerja teknis (ringkas)

- **Next.js 14** — dashboard di-deploy ke Vercel
- **Neon Postgres** — database, semua statistik dihitung real dari data harga
- **Login pakai wallet Phantom** (Solana) — tanpa email/password
- Data token/harga ditarik live dari **Dexscreener** dan **GoPlus Security**
  (bukan data fiktif — setiap alamat token diverifikasi sebelum dipakai)
- Job terjadwal (cron eksternal via cron-job.org) refresh harga & hitung
  ulang win-rate tiap jam

## Yang belum selesai (gap yang perlu diketahui)

- **Live scraping dari X belum tersambung.** Ini bagian tersulit: RSSHub
  mati, 9+ instance Nitter mati/diblokir, scraper tanpa login cuma dapat
  data basi, scraper dengan login diblokir Cloudflare dari environment dev.
  Semua pipeline di belakangnya (risk scoring, cross-reference, dsb) sudah
  jadi dan jalan dengan data real — tinggal sumber tweet live-nya yang
  belum ada solusi gratis.
- **Autentikasi wallet baru sebatas connect**, belum ada verifikasi
  signature — cukup untuk demo, perlu diperkuat sebelum dipakai user asli.
- **Halaman pricing** sengaja belum dibuat.
- Data demo yang ditampilkan sekarang sebagian sintetis (harga historis
  interpolasi) karena scraping live belum jalan — tapi jujur ditandai di UI
  (tidak ditampilkan sebagai harga dolar asli).

## Kalau mau coba

Buka https://vetted-peach.vercel.app, klik **Get Started**, connect wallet
Phantom (extension browser), langsung masuk ke dashboard dengan data demo
yang sudah terisi (53+ token nyata, 28 KOL, 8 smart wallet).
