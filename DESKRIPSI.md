# DOKUMEN DESKRIPSI GAME EDUKASI MATEMATIKA

## JUDUL KARYA:
**ARSITEK CILIK: MISI PYTHAGORAS**  
*Petualangan Geometri & Rekonstruksi Arsitektur Bangunan Modern*

**Kategori Kompetisi:** Digital Mathematics Game Competition (DMGC) 2026  
**Penyelenggara:** Himpunan Mahasiswa Matematika (HIMMAT) FKIP Universitas Syiah Kuala  
**Sasaran Pengguna:** Siswa Sekolah Menengah Pertama (SMP / MTs) Fase D (Kelas VII - VIII)  
**Media Implementasi:** Web Application Responsif (HTML5 / CSS3 / JavaScript ES6+)

---

## 1. LATAR BELAKANG & TUJUAN PENGEMBANGAN

### 1.1 Permasalahan Pembelajaran
Materi Geometri Bangun Datar dan Teorema Pythagoras sering kali dipahami oleh peserta didik SMP hanya sebatas hafalan rumus tanpa memahami makna spasial serta aplikasi kontekstualnya. Temuan di lapangan menunjukkan beberapa miskonsepsi umum, antara lain:
1. Tertukar antara konsep keliling (penjumlahan panjang sisi terluar) dan luas (daerah bidang tertutup).
2. Kesalahan kalkulasi luas segitiga dan trapesium karena lupa membagi dua ($/ 2$).
3. Pemahaman keliru mengenai Teorema Pythagoras yang menganggap $c = a + b$ alih-alih $c^2 = a^2 + b^2$, serta kesulitan mengidentifikasi sisi miring (hipotenusa) pada posisi orientasi segitiga yang bervariasi.

### 1.2 Inovasi Pendekatan Kontekstual Arsitektur Bangunan
Game **"Arsitek Cilik: Misi Pythagoras"** mengintegrasikan konsep matematika kurikulum nasional dengan aplikasi kontekstual dunia teknik sipil dan arsitektur bangunan:
- **Fondasi Bangunan Bertingkat**: Pemahaman luas dan keliling persegi serta persegi panjang.
- **Rangka Atap & Fasad Dinding**: Penerapan trapesium, jajargenjang, dan ornamen belah ketupat.
- **Tangga Konstruksi & Tiang Penyangga**: Aplikasi esensial Teorema Pythagoras untuk menentukan panjang tangga miring dan tinggi tiang penopang.
- **Tiang Derek (Crane) & Menara**: Aplikasi perhitungan tripel Pythagoras pada tiang dan tali baja penguat.

Dengan pendekatan ini, siswa diajak melihat matematika bukan sekadar angka abstrak di papan tulis, melainkan instrumen esensial yang nyata, bermakna, dan aplikatif dalam rancang bangun peradaban.

---

## 2. SPESIFIKASI DAN STRUKTUR GAMEPLAY

### 2.1 Narasi & Alur Game (5 Dunia x 5 Level = 25 Level)

| Dunia | Tema Arsitektur | Fokus Kompetensi Matematika | Tantangan Mini-Boss |
|---|---|---|---|
| **Dunia 1: Fondasi** | Penataan tiang pancang & denah lantai bangunan | Keliling & Luas Persegi, Persegi Panjang, Segitiga Siku-siku | Level 1-5: 3 Soal Komprehensif (Taman persegi, luas segitiga, kebutuhan ubin) |
| **Dunia 2: Rangka & Atap** | Rekonstruksi rangka atap & fasad dinding | Luas Trapesium, Jajargenjang, Belah Ketupat, Layang-layang, dan Luas Bangun Gabungan | Level 2-5: 3 Soal Gabungan (Dinding rumah kombinasi persegi + segitiga, pengurangan area kolam) |
| **Dunia 3: Jembatan & Tangga** | Konstruksi tangga lantai, kawat penopang & tiang crane | Teorema Pythagoras ($a^2 + b^2 = c^2$), Mencari hipotenusa, Mencari sisi tegak, Pembuktian Visual Luas Persegi, Tripel Pythagoras | Level 3-5: 3 Soal Pythagoras Master (Tiang crane, identifikasi tripel, tinggi kawat penopang) |
| **Dunia 4: Taman & Kolam** | Lanskap taman terbuka, kolam air mancur & lintasan melingkar | Keliling & Luas Lingkaran, Jari-jari & Diameter, Busur & Juring, Area Cincin Lingkaran | Level 4-5: 3 Soal Lanskap Kolam & Taman Lingkaran Terpadu |
| **Dunia 5: Gudang & Menara** | Konstruksi gudang penyimpanan logistik & menara observasi | Volume & Luas Permukaan Bangun Ruang Sisi Datar (Kubus, Balok, Prisma, Limas) | Level 5-5: 3 Soal Grand Master: Rekonstruksi Kompleks Gudang & Menara Arsitek |

### 2.2 Desain Interaksi & Mekanik Edukatif

1. **Slider Manipulatif Interaktif**:
   Siswa menggeser nilai sisi/tinggi pada bangun geometri dinamis (SVG) dan melihat bagaimana perubahan dimensi berdampak langsung pada bentuk geometris secara proporsional.
2. **Studio Laboratorium Geometri (*Interactive Sandbox*)**:
   Ruang eksperimen manipulasi bebas di mana siswa dapat mengatur ukuran segitiga siku-siku sembarang dengan slider dan melihat pembuktian visual dinamis luas persegi tiga sisi $a^2 + b^2 = c^2$, indikator Tripel Pythagoras otomatis, serta kalkulator visual bangun datar.
3. **Mode Ujian Kilat: Tripel Pythagoras (*Time-Attack 60 Detik*)**:
   Mode latihan kelancaran kognitif (*mathematical fluency*) untuk menguji kecepatan dan ketepatan siswa dalam mengenali tripel Pythagoras dengan sistem multiplier combo streak.
4. **Aksesibilitas Narasi Suara (*Web Speech API*)**:
   Dukungan Text-to-Speech bawaan browser dalam Bahasa Indonesia yang membacakan teks soal untuk memfasilitasi siswa dengan gaya belajar auditori secara 100% luring.
5. **Sistem Umpan Balik Diagnostik**:
   Jika siswa menjawab salah, sistem menyajikan pesan diagnostik yang menjelaskan mengapa jawaban tersebut salah (misal: *"Kamu menghitung $p \times l$ (luas), sedangkan yang diminta adalah pagar keliling $2 \times (p + l)$"*). Ini memfasilitasi *self-regulated learning* tanpa rasa frustrasi.
6. **Scaffolding Hint Bertingkat**:
   Tersedia 3 tingkat petunjuk (Hint Konseptual $\rightarrow$ Hint Prosedural $\rightarrow$ Hint Terarah) yang dapat dibuka jika siswa mengalami kebuntuan, dengan konsekuensi penyesuaian skor bintang yang mendidik siswa untuk berusaha mandiri terlebih dahulu.
7. **Buku Panduan Rumus Interaktif**:
   Disediakan menu referensi rumus dengan akordion interaktif dan visualisasi SVG beranotasi variabel lengkap.

---

## 3. ASPEK TEKNIS & KEUNGGULAN ARSITEKTUR PERANGKAT LUNAK

1. **Zero External Dependencies (100% Mandiri)**:
   Aplikasi tidak menggunakan CDN eksternal, library pihak ketiga, maupun font berbayar. Seluruh aset grafis dibangun menggunakan vektor SVG inline dan canvas murni, menjamin kehandalan akses meski berada di lingkungan sekolah tanpa koneksi internet.
2. **Sintesis Audio Prosedural (Web Audio API)**:
   Efek suara dihasilkan secara komputasi melalui gelombang osilator (*sine, square, sawtooth*) dan generator noise, menghilangkan beban ukuran berkas suara serta menjamin responsivitas instan tanpa jeda *buffering*.
3. **Web Speech API Narasi Luring**:
   Memanfaatkan antarmuka `speechSynthesis` lokal perangkat untuk membacakan soal dalam Bahasa Indonesia tanpa memerlukan server pihak ketiga.
   Efek suara dihasilkan secara komputasi melalui gelombang osilator (*sine, square, sawtooth*) dan generator noise, menghilangkan beban ukuran berkas suara serta menjamin responsivitas instan tanpa jeda *buffering*.
3. **Desain Mobile-First & Aksesibilitas**:
   - Layout fleksibel berbasis CSS Grid dan Flexbox.
   - Ukuran elemen tombol ramah sentuhan (touch target $\ge 44 \times 44$ px).
   - Tipografi dinamis dengan fungsi `clamp()` sehingga tetap proporsional dari smartphone 360px hingga layar desktop 4K.
4. **Penyimpanan Lokal State Ringan**:
   Menggunakan `localStorage` dengan penanganan galat (*error boundary*), mencatat riwayat perolehan bintang (1-3 bintang per level), skor tertinggi, dan status pembukaan level secara otomatis.

---

## 4. KESIMPULAN & NILAI LEBIH UNTUK DMGC 2026

Game **"Arsitek Cilik: Misi Pythagoras"** memadukan keunggulan estetika visual, stabilitas teknis berstandar kompetisi, serta kedalaman pedagogis matematika. Siswa tidak sekadar bermain, melainkan berproses membangun pemahaman spasial-geometris yang utuh dan kontekstual.
