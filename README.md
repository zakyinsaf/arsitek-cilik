# 🏗️ Arsitek Cilik: Misi Pythagoras

**Game Edukasi Matematika Berbasis Web untuk Siswa SMP (Kelas VII & VIII)**  
Disusun untuk **Digital Mathematics Game Competition (DMGC) 2026**  
Diselenggarakan oleh **Himpunan Mahasiswa Matematika (HIMMAT) FKIP Universitas Syiah Kuala**

---

## 🚀 Cara Menjalankan Game

Game ini dibuat dengan teknologi murni web modern (**Vanilla HTML5, CSS3, JavaScript**) tanpa framework, build tool, ataupun dependensi online. Game dapat dijalankan secara langsung 100% offline di berbagai perangkat:

### 1. Cara Paling Mudah (Langsung dari File Explorer)
1. Buka folder proyek `lomba mobile app`.
2. Klik ganda file `index.html`.
3. Game akan langsung terbuka di browser bawaan Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, atau Opera).

### 2. Menjalankan Menggunakan Local HTTP Server (Direkomendasikan untuk Presentasi)
Jika ingin menjalankan melalui local development server:
- **Menggunakan Python**:
  ```bash
  # Buka terminal/PowerShell di folder ini, lalu jalankan:
  python -m http.server 8000
  ```
  Kemudian buka browser di: `http://localhost:8000`
- **Menggunakan Node.js / npx**:
  ```bash
  npx -y serve .
  ```
- **Menggunakan VS Code / Extension**:
  Klik kanan pada `index.html` lalu pilih **"Open with Live Server"**.

### 3. Menjalankan di Smartphone / HP
- **Metode A (Transfer file)**: Salin folder proyek ke penyimpanan ponsel, lalu buka file `index.html` menggunakan browser berkas atau Google Chrome for Android / Safari for iOS.
- **Metode B (Wi-Fi lokal)**: Jalankan local server di laptop (misal port 8000), sambungkan laptop & smartphone ke Wi-Fi yang sama, lalu buka `http://<IP-Laptop>:8000` di browser smartphone. Desain tampilan otomatis menyesuaikan layar sentuh smartphone secara responsif.

---

## 🎯 Konsep & Nilai Edukasi

Pemain berperan sebagai **Arsitek Muda Adi** yang bertugas merehabilitasi bangunan tradisional khas Aceh (*Rumoh Panggung*, atap pelana/trapesium, tangga pasak, dan perahu layar). Pemain menerapkan rumus-rumus geometri secara kontekstual untuk memastikan konstruksi kokoh dan akurat.

### Struktur 5 Dunia & 25 Level
1. **Dunia 1: "Fondasi" (Level 1-1 s.d. 1-5)**
   - Fokus: Keliling dan Luas Persegi, Persegi Panjang, serta Segitiga.
   - Puncak: Mini-Boss Tantangan Fondasi Terpadu (3 Soal berturut-turut, 3 Nyawa).
2. **Dunia 2: "Rangka & Atap" (Level 2-1 s.d. 2-5)**
   - Fokus: Luas Bangun Datar Lanjutan (Trapesium, Jajargenjang, Belah Ketupat, Layang-layang) dan Bangun Datar Gabungan.
   - Puncak: Mini-Boss Rekonstruksi Atap & Dinding Gabungan.
3. **Dunia 3: "Jembatan & Tangga" (Level 3-1 s.d. 3-5)**
   - Fokus: Teorema Pythagoras ($a^2 + b^2 = c^2$), Mencari Sisi Miring/Tegak, Pembuktian Visual Luas Persegi 3-4-5, Tripel Pythagoras, dan Soal Kontekstual Nyata.
   - Puncak: Grand Boss Pythagoras Master (Arsitektur Derek & Kawat Penopang).
4. **Dunia 4: "Taman & Kolam" (Level 4-1 s.d. 4-5)**
   - Fokus: Geometri Lingkaran (Keliling, Luas, Jari-jari & Diameter, Busur & Juring, Kombinasi Taman & Kolam).
   - Puncak: Mini-Boss Desain Lanskap Terpadu.
5. **Dunia 5: "Gudang & Menara" (Level 5-1 s.d. 5-5)**
   - Fokus: Geometri Bangun Ruang Sisi Datar (Kubus, Balok, Prisma Segitiga, Limas Persegi, Volume & Luas Permukaan).
   - Puncak: Grand Master Finale: Konstruksi Menara & Gudang Pusat.

---

## ✨ Fitur Unggulan

- **Mode Petualangan Utama (5 Dunia & 25 Level Bertingkat)**: Menjelajahi tantangan terstruktur dengan storyline inspiratif Arsitek Adi.
- **🔬 Studio Laboratorium Geometri (*Interactive Sandbox*)**: Mode manipulasi bebas di mana siswa dapat mengubah ukuran sisi segitiga siku-siku sembarang secara real-time dan menyaksikan pembuktian visual dinamis Teorema Pythagoras ($a^2 + b^2 = c^2$) serta eksplorasi bangun datar tanpa batas waktu.
- **⚡ Ujian Kilat: Tripel Pythagoras (*Time-Attack 60 Detik*)**: Mode latihan kelancaran numerasi dengan timer, sistem skor kombo beruntun (*streak combo*), dan pencatatan rekor tertinggi.
- **🗣️ Narasi Suara Aksesibel (*Web Speech API*)**: Tombol pembaca suara otomatis dalam Bahasa Indonesia untuk membantu siswa dengan gaya belajar auditori memahami soal secara mandiri (100% offline & zero-dependency).
- **4 Tipe Interaksi Soal**:
  1. *Interactive Slider*: Menggeser ukuran bangun secara real-time hingga luas/keliling tepat.
  2. *Numerik Input Terbimbing*: Mengisi angka dengan keyboard responsif, toleransi desimal, dan sanitasi input.
  3. *Visual MCQ*: Pilihan ganda dengan diagram ilustratif.
  4. *Visual Proof Drag/Puzzle*: Menghubungkan persegi pembuktian luas Teorema Pythagoras.
- **Umpan Balik Diagnostik Konseptual**: Jawaban salah tidak hanya bertuliskan "Salah", melainkan menjelaskan secara spesifik miskonsepsi yang terjadi (misal: membedakan konsep keliling vs luas, lupa membagi dua pada rumus segitiga/trapesium).
- **Sistem Petunjuk Bertahap (3 Tingkat Hint)**: Membimbing siswa tanpa langsung memberikan jawaban, dengan penyesuaian skor yang adil.
- **Prosedural Audio Synthesizer (Web Audio API)**: Efek suara (klik, benar, salah, bintang, fanfare) dihasilkan langsung oleh osilator audio browser tanpa memerlukan unduhan aset MP3/WAV.
- **Canvas Particle Confetti**: Efek animasi selebrasi yang memicu motivasi belajar intrinsik.
- **Penyimpanan Progres Lokal (`localStorage`)**: Progres level, bintang, skor tantangan kilat, dan pengaturan tersimpan aman di browser siswa.

---

## 📁 Struktur Berkas

```
lomba mobile app/
├── index.html          # Struktur antarmuka web, modal, dan layar router
├── flowchart.mmd       # Diagram alur logika permainan & arsitektur state
├── README.md           # Panduan instalasi dan petunjuk menjalankan game
├── DESKRIPSI.md        # Naskah deskripsi ilmiah, pedagogis, dan etnomatematika
├── SKENARIO_VIDEO.md   # Panduan & naskah rekaman video gameplay / trailer kompetisi
├── css/
│   └── style.css       # Design tokens, animasi, CSS Grid/Flexbox responsif
└── js/
    ├── audio.js        # Sintesis efek audio prosedural (Web Audio API)
    ├── levels.js       # Data konfigurasi 15 level, soal, kunci jawaban & narasi
    ├── engine.js       # Mesin logika verifikasi matematika, skor, hint & SVG builder
    └── main.js         # Pengendali router layar, state game, dan interaksi DOM
```

---

## 🏆 Kepatuhan Teknis DMGC 2026
- **Kemandirian (No External Dependency)**: 100% bebas CDN eksternal, font eksternal, atau gambar dari internet.
- **Keamanan & Kompatibilitas**: Menggunakan ES6 baku yang kompatibel di semua browser modern Android, iOS, Windows, macOS, dan Linux.
- **Aksesibilitas**: Touch-target tombol minimal 44×44 px, kontras warna ramah mata, teks terukur menggunakan CSS `clamp()`.
"# arsitek-cilik" 
