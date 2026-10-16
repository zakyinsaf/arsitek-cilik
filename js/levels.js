/* ======================================
   LEVEL DATA — 25 Level (5 Dunia × 5)
   Data soal terpisah dari logika
   ====================================== */
const GAME_DATA = (() => {

  /* --- Cerita Pembuka Dunia --- */
  const worldStories = [
    {
      title: 'Dunia 1: Fondasi',
      icon: '🏗️',
      subtitle: 'Keliling & Luas Bangun Dasar',
      color: '#1B6B4A',
      story: 'Selamat datang, Arsitek Muda! Sebuah kawasan perumahan baru membutuhkan bantuanmu. Berbagai bangunan rumah tinggal dan gedung memerlukan rancangan fondasi baru. Gunakan ilmu geometrimu untuk mengukur dan membangun fondasi yang kokoh!'
    },
    {
      title: 'Dunia 2: Rangka & Atap',
      icon: '🏠',
      subtitle: 'Luas Bangun Datar Lanjutan',
      color: '#E8A838',
      story: 'Hebat! Fondasi sudah kokoh. Sekarang saatnya membangun rangka dinding dan atap bangunan. Struktur atap memiliki bentuk unik—trapesium, jajargenjang, bahkan belah ketupat. Ayo hitung dengan teliti!'
    },
    {
      title: 'Dunia 3: Jembatan & Tangga',
      icon: '🌉',
      subtitle: 'Teorema Pythagoras',
      color: '#D94F3B',
      story: 'Luar biasa! Bangunan semakin lengkap. Tantangan berikutnya: membangun jembatan penghubung antar gedung dan tangga konstruksi. Di sinilah kamu butuh kekuatan Teorema Pythagoras! Ingat: dalam segitiga siku-siku, a² + b² = c².'
    },
    {
      title: 'Dunia 4: Taman & Kolam',
      icon: '🌺',
      subtitle: 'Lingkaran & Busur',
      color: '#9B59B6',
      story: 'Bangunan utama sudah berdiri megah! Sekarang, mari kita percantik halaman luar dengan taman melingkar dan kolam air mancur modern. Kamu perlu menguasai rumus lingkaran untuk merancang lanskap impian!'
    },
    {
      title: 'Dunia 5: Gudang & Menara',
      icon: '🏰',
      subtitle: 'Bangun Ruang Sisi Datar',
      color: '#2980B9',
      story: 'Tantangan terakhir! Desa membutuhkan gudang penyimpanan dan menara pengawas. Kamu harus menghitung volume dan luas permukaan bangun ruang. Siap menjadi Master Arsitek?'
    }
  ];

  /* --- 25 Level --- */
  const levels = [

    // ========== DUNIA 1: FONDASI ==========

    // Level 1-1: Fondasi Persegi (Slider)
    {
      id: '1-1',
      world: 0,
      level: 0,
      title: 'Fondasi Persegi',
      type: 'slider',
      isBoss: false,
      learningGoal: 'Menghitung keliling dan luas persegi',
      question: 'Geser slider untuk mengubah panjang sisi persegi sehingga luasnya tepat <b>36 cm²</b>.',
      shape: 'square',
      sliderConfig: { min: 1, max: 12, step: 1, unit: 'cm' },
      targetLabel: 'Luas = 36 cm²',
      answer: 6,
      answerCheck: (val) => val * val === 36,
      displayCalc: (val) => `Sisi = ${val} cm → Luas = ${val} × ${val} = ${val * val} cm²`,
      hints: [
        { tier: 'Konsep', text: 'Persegi memiliki 4 sisi sama panjang. Luasnya dihitung dari sisi × sisi.' },
        { tier: 'Rumus', text: 'Rumus: Luas persegi = s × s = s²' },
        { tier: 'Langkah', text: 'Substitusi: s² = 36 → s = √36. Berapa √36?' }
      ],
      feedbackWrong: (val) => `Coba perhatikan: Jika s = ${val}, maka luas = ${val} × ${val} = ${val * val}. Apakah itu sama dengan 36? Apa yang perlu diubah?`,
      reflectionCard: {
        question: 'Apa hubungan antara panjang sisi persegi dengan luas bidang fondasinya?',
        options: [
          { text: 'Luas didapat dari menjumlahkan keempat sisi, sehingga panjang sisi = Luas dibagi empat', correct: false },
          { text: 'Luas didapat dari perkalian sisi berulang (s²), sehingga panjang sisi = akar kuadrat Luas', correct: true },
          { text: 'Luas didapat dari separuh kuadrat sisi, sehingga panjang sisi = akar dari dua kali Luas', correct: false }
        ],
        conclusion: 'Benar! Luas persegi = s². Jika diketahui luasnya, maka sisi = √Luas. Kamu baru saja membuktikannya pada fondasi bangunan! 🏗️'
      }
    },

    // Level 1-2: Pondasi Persegi Panjang (Input)
    {
      id: '1-2',
      world: 0,
      level: 1,
      title: 'Pondasi Persegi Panjang',
      type: 'input',
      isBoss: false,
      learningGoal: 'Menghitung luas persegi panjang',
      question: 'Sebuah fondasi bangunan bertingkat berbentuk persegi panjang dengan panjang <b>12 m</b> dan lebar <b>8 m</b>. Berapa luas fondasi tersebut?',
      shape: 'rectangle',
      shapeParams: { width: 12, height: 8, labels: { p: '12 m', l: '8 m' } },
      answer: 96,
      unit: 'm²',
      hints: [
        { tier: 'Konsep', text: 'Persegi panjang punya 2 ukuran: panjang dan lebar. Luas mengukur bidang di dalamnya.' },
        { tier: 'Rumus', text: 'Rumus: Luas persegi panjang = panjang × lebar' },
        { tier: 'Langkah', text: 'Substitusi: L = 12 × 8 = ? Kalikan kedua angka tersebut!' }
      ],
      feedbackWrong: () => 'Perhatikan: Luas mengukur bidang di dalam bangun. Apa rumus yang menghubungkan panjang dan lebar? Coba hitung lagi!',
      reflectionCard: {
        question: 'Mengapa arsitek wajib menghitung luas bidang fondasi sebelum mendirikan bangunan?',
        options: [
          { text: 'Menghitung total panjang pagar pelindung yang akan dipasang mengelilingi batas terluar tanah', correct: false },
          { text: 'Menentukan batas ketinggian lantai gedung agar tidak miring saat terjadi pergeseran tanah', correct: false },
          { text: 'Mengetahui daya tampung ruang dasar serta menghitung kebutuhan material lantai bangunan', correct: true }
        ],
        conclusion: 'Tepat! Luas fondasi menentukan seberapa besar bangunan yang bisa didirikan di atasnya. Dalam arsitektur, menghitung luas adalah langkah awal perencanaan! 📐'
      }
    },

    // Level 1-3: Keliling Halaman (MCQ)
    {
      id: '1-3',
      world: 0,
      level: 2,
      title: 'Keliling Halaman',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menghitung keliling persegi panjang',
      question: 'Halaman sebuah rumah tinggal berbentuk persegi panjang berukuran panjang <b>15 m</b> dan lebar <b>10 m</b>. Pak Arsitek ingin memasang pagar keliling. Berapa meter pagar yang dibutuhkan?',
      shape: 'rectangle',
      shapeParams: { width: 15, height: 10, labels: { p: '15 m', l: '10 m' }, showPerimeter: true },
      options: [
        { text: '25 m', value: 25 },
        { text: '50 m', value: 50 },
        { text: '150 m', value: 150 },
        { text: '30 m', value: 30 }
      ],
      answer: 50,
      correctIndex: 1,
      hints: [
        { tier: 'Konsep', text: 'Keliling adalah total panjang garis batas luar bangun. Bayangkan kamu berjalan mengelilingi halaman.' },
        { tier: 'Rumus', text: 'Rumus: Keliling persegi panjang = 2 × (panjang + lebar)' },
        { tier: 'Langkah', text: 'K = 2 × (15 + 10). Hitung isi kurung dulu: 15 + 10 = 25, lalu kalikan 2.' }
      ],
      feedbackByOption: [
        'Kamu baru menjumlahkan p + l. Pagar mengelilingi semua sisi — ada 2 sisi panjang dan 2 sisi lebar. Berapa totalnya?',
        '',
        'Itu hasil perkalian p × l, yang merupakan luas, bukan keliling. Keliling menghitung garis tepi, bukan bidang di dalam.',
        'Kamu baru menghitung 2 × p saja. Halaman juga punya sisi lebar, kan? Jangan lupa ditambahkan!'
      ],
      reflectionCard: {
        question: 'Apa perbedaan mendasar antara konsep keliling dan luas dalam pengukuran tanah?',
        options: [
          { text: 'Keliling adalah total lintasan garis batas luar, sedangkan luas adalah besaran bidang di dalamnya', correct: true },
          { text: 'Keliling mengukur bidang tanah yang tertutup, sedangkan luas adalah garis pembatas pagar tepi luar', correct: false },
          { text: 'Keliling dihitung dari perkalian sisi tanah, sedangkan luas dihitung dari penjumlahan rusuk terluar', correct: false }
        ],
        conclusion: 'Tepat! Keliling = garis luar (misal: pagar), Luas = daerah di dalamnya (misal: rumput/ubin). Jangan tertukar lagi ya! 📏'
      }
    },

    // Level 1-4: Atap Segitiga (Slider)
    {
      id: '1-4',
      world: 0,
      level: 3,
      title: 'Atap Segitiga',
      type: 'slider',
      isBoss: false,
      learningGoal: 'Menghitung luas segitiga',
      question: 'Rangka atap bangunan berbentuk segitiga dengan alas <b>10 m</b>. Geser slider untuk mengatur tinggi segitiga sehingga luasnya tepat <b>30 m²</b>.',
      shape: 'triangle',
      shapeParams: { base: 10 },
      sliderConfig: { min: 1, max: 12, step: 1, unit: 'm' },
      targetLabel: 'Luas = 30 m²',
      answer: 6,
      answerCheck: (val) => 0.5 * 10 * val === 30,
      displayCalc: (val) => `${val} m`,
      hints: [
        { tier: 'Konsep', text: 'Segitiga bisa dianggap setengah dari persegi panjang. Makanya ada faktor ½ di rumusnya.' },
        { tier: 'Rumus', text: 'Rumus: Luas segitiga = ½ × alas × tinggi' },
        { tier: 'Langkah', text: 'Substitusi: ½ × 10 × t = 30 → 5 × t = 30 → t = 30 ÷ 5. Berapa hasilnya?' }
      ],
      feedbackWrong: () => 'Luas belum sesuai target. Ingat bahwa segitiga = setengah persegi panjang. Coba pikirkan: ½ × 10 × berapa = 30?',
      reflectionCard: {
        question: 'Mengapa pada rumus luas segitiga selalu terdapat faktor pengali ½?',
        options: [
          { text: 'Karena segitiga siku-siku memiliki tepat dua buah sisi tegak yang saling berhadapan satu sama lain', correct: false },
          { text: 'Karena satu bidang segitiga dapat dibentuk dari separuh bidang persegi panjang berukuran sama', correct: true },
          { text: 'Karena garis tinggi selalu membagi sudut puncak segitiga menjadi dua bagian yang sama besar', correct: false }
        ],
        conclusion: 'Tepat! Jika kamu menggabungkan 2 segitiga yang sama, hasilnya membentuk persegi panjang. Makanya luas segitiga = ½ × alas × tinggi. Bidang atap segitiga ini sebenarnya setengah dari bidang persegi panjang! ⛺'
      }
    },

    // Level 1-5: BOSS — Fondasi Kompleks
    {
      id: '1-5',
      world: 0,
      level: 4,
      title: 'Boss: Fondasi Kompleks',
      type: 'boss',
      isBoss: true,
      learningGoal: 'Menerapkan keliling dan luas persegi, persegi panjang, segitiga',
      lives: 3,
      bossQuestions: [
        {
          type: 'input',
          question: 'Sebuah taman berbentuk persegi dengan keliling <b>48 m</b>. Berapa luas taman itu?',
          shape: 'square',
          shapeParams: { side: 12, labels: { k: 'K = 48 m' } },
          answer: 144,
          unit: 'm²',
          hints: [
            'Langkah 1: Cari sisi dulu. Rumus keliling persegi = 4 × s, maka s = K ÷ 4',
            'Langkah 2: Setelah dapat sisi, hitung luas = s × s'
          ],
          feedbackWrong: () => 'Keliling persegi = 4s, jadi s = 48 ÷ 4. Setelah dapat sisi, hitung luas = s × s.'
        },
        {
          type: 'mcq',
          question: 'Sebuah segitiga siku-siku memiliki alas <b>8 cm</b> dan tinggi <b>6 cm</b>. Berapa luasnya?',
          shape: 'triangle',
          shapeParams: { base: 8, height: 6 },
          options: [
            { text: '48 cm²', value: 48 },
            { text: '24 cm²', value: 24 },
            { text: '14 cm²', value: 14 },
            { text: '28 cm²', value: 28 }
          ],
          answer: 24,
          correctIndex: 1,
          hints: [
            'Rumus: Luas segitiga = ½ × alas × tinggi',
            'Substitusi: L = ½ × 8 × 6. Hitung hasilnya!'
          ],
          feedbackByOption: [
            '48 itu alas × tinggi tanpa dibagi 2. Luas segitiga = ½ × a × t.',
            '',
            'Coba hitung lagi: ½ × 8 × 6.',
            'Coba hitung lagi: ½ × 8 × 6.'
          ]
        },
        {
          type: 'input',
          question: 'Lantai ruangan berbentuk persegi panjang <b>9 m × 7 m</b> akan dipasangi ubin persegi berukuran <b>1 m × 1 m</b>. Berapa ubin yang dibutuhkan?',
          shape: 'rectangle',
          shapeParams: { width: 9, height: 7, labels: { p: '9 m', l: '7 m' }, showGrid: true },
          answer: 63,
          unit: 'ubin',
          hints: [
            'Jumlah ubin = luas lantai ÷ luas satu ubin',
            'Luas lantai = p × l. Luas ubin = 1 × 1. Hitung hasilnya!'
          ],
          feedbackWrong: () => 'Jumlah ubin = luas lantai ÷ luas ubin = (p × l) ÷ (1 × 1). Coba hitung!'
        }
      ],
      reflectionCard: {
        question: 'Mengapa ketepatan perhitungan keliling dan luas fondasi sangat krusial bagi keselamatan gedung?',
        options: [
          { text: 'Memastikan bentuk denah bangunan terlihat simetris dari tampak depan dan mudah digambar arsitek', correct: false },
          { text: 'Menjamin garis batas bangunan tidak bergeser dari patok tanah yang telah disetujui pemerintah', correct: false },
          { text: 'Memastikan distribusi beban ke tanah merata stabil serta memprediksi kebutuhan bahan dengan presisi', correct: true }
        ],
        conclusion: 'Hebat, Arsitek! Fondasi yang kokoh adalah penentu utama keselamatan dan kestabilan seluruh bangunan. Dengan menguasai keliling & luas, fondasimu siap menopang struktur bangunan bertingkat! 🏗️'
      }
    },

    // ========== DUNIA 2: RANGKA & ATAP ==========

    // Level 2-1: Atap Trapesium (Input)
    {
      id: '2-1',
      world: 1,
      level: 0,
      title: 'Atap Trapesium',
      type: 'input',
      isBoss: false,
      learningGoal: 'Menghitung luas trapesium',
      question: 'Atap kanopi bangunan berbentuk trapesium dengan sisi sejajar atas <b>6 m</b>, sisi sejajar bawah <b>10 m</b>, dan tinggi <b>4 m</b>. Berapa luas atap tersebut?',
      shape: 'trapezoid',
      shapeParams: { topSide: 6, bottomSide: 10, height: 4, labels: { a: '6 m', b: '10 m', t: '4 m' } },
      answer: 32,
      unit: 'm²',
      hints: [
        { tier: 'Konsep', text: 'Trapesium memiliki 2 sisi sejajar (atas dan bawah) serta tinggi di antaranya.' },
        { tier: 'Rumus', text: 'Rumus: Luas trapesium = ½ × (sisi sejajar atas + sisi sejajar bawah) × tinggi' },
        { tier: 'Langkah', text: 'Substitusi: L = ½ × (6 + 10) × 4. Jumlahkan dulu isi kurungnya, lalu kalikan!' }
      ],
      feedbackWrong: () => 'Perhatikan: trapesium punya 2 sisi sejajar yang berbeda panjang. Sudahkah kamu menjumlahkan keduanya sebelum dikalikan?',
      reflectionCard: {
        question: 'Mengapa rumus luas trapesium menjumlahkan panjang kedua sisi yang sejajar?',
        options: [
          { text: 'Karena trapesium dapat ditransformasikan menjadi bentuk persegi panjang melalui nilai rata-rata kedua sisi sejajarnya', correct: true },
          { text: 'Karena kedua sisi sejajar merupakan rusuk terpanjang yang menopang seluruh beban rangka atap kanopi secara vertikal', correct: false },
          { text: 'Karena penjumlahan kedua sisi sejajar akan menghasilkan panjang garis tinggi trapesium jika diukur secara diagonal', correct: false }
        ],
        conclusion: 'Tepat! Trapesium bisa dibayangkan sebagai peralihan antara persegi panjang kecil (sisi atas) dan besar (sisi bawah). Bentuk trapesium sering diterapkan pada atap kanopi modern! 🏠'
      }
    },

    // Level 2-2: Dinding Jajargenjang (Slider)
    {
      id: '2-2',
      world: 1,
      level: 1,
      title: 'Dinding Jajargenjang',
      type: 'slider',
      isBoss: false,
      learningGoal: 'Menghitung luas jajargenjang',
      question: 'Dinding samping bangunan berbentuk jajargenjang dengan alas <b>8 m</b>. Geser slider untuk mengatur tinggi agar luasnya tepat <b>40 m²</b>.',
      shape: 'parallelogram',
      shapeParams: { base: 8 },
      sliderConfig: { min: 1, max: 10, step: 1, unit: 'm' },
      targetLabel: 'Luas = 40 m²',
      answer: 5,
      answerCheck: (val) => 8 * val === 40,
      displayCalc: (val) => `${val} m`,
      hints: [
        { tier: 'Konsep', text: 'Jajargenjang seperti persegi panjang yang "digeser". Luasnya bukan sisi × sisi miring, tapi alas × tinggi tegak.' },
        { tier: 'Rumus', text: 'Rumus: Luas jajargenjang = alas × tinggi' },
        { tier: 'Langkah', text: 'Substitusi: 8 × t = 40. Berapa nilai t agar persamaan ini benar?' }
      ],
      feedbackWrong: () => 'Luas belum sesuai target. Jajargenjang dihitung dari alas × tinggi tegak (bukan sisi miring). Berapa yang harus dikali 8 agar hasilnya 40?',
      reflectionCard: {
        question: 'Mengapa tinggi jajargenjang harus diukur tegak lurus terhadap alas, bukan sepanjang sisi miringnya?',
        options: [
          { text: 'Karena sisi miring selalu berukuran lebih pendek dibandingkan jarak vertikal antara dua garis sejajar alasnya', correct: false },
          { text: 'Karena jarak tegak lurus merepresentasikan jarak terpendek antar sisi sejajar untuk membentuk persegi panjang ekuivalen', correct: true },
          { text: 'Karena sisi miring dipengaruhi oleh sudut lancip jajargenjang sehingga hanya boleh dipakai untuk mencari kelilingnya', correct: false }
        ],
        conclusion: 'Benar! Luas = alas × tinggi. Tinggi HARUS tegak lurus terhadap alas! Jika memakai sisi miring, hasilnya akan salah karena sisi miring lebih panjang dari tinggi sebenarnya. 📐'
      }
    },

    // Level 2-3: Jendela Belah Ketupat (MCQ)
    {
      id: '2-3',
      world: 1,
      level: 2,
      title: 'Jendela Belah Ketupat',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menghitung luas belah ketupat',
      question: 'Jendela ventilasi gedung berbentuk belah ketupat dengan diagonal <b>d₁ = 12 cm</b> dan <b>d₂ = 16 cm</b>. Berapa luasnya?',
      shape: 'rhombus',
      shapeParams: { d1: 12, d2: 16, labels: { d1: '12 cm', d2: '16 cm' } },
      options: [
        { text: '192 cm²', value: 192 },
        { text: '96 cm²', value: 96 },
        { text: '48 cm²', value: 48 },
        { text: '28 cm²', value: 28 }
      ],
      answer: 96,
      correctIndex: 1,
      hints: [
        { tier: 'Konsep', text: 'Belah ketupat memiliki 2 diagonal yang saling tegak lurus dan membelah satu sama lain.' },
        { tier: 'Rumus', text: 'Rumus: Luas belah ketupat = ½ × d₁ × d₂' },
        { tier: 'Langkah', text: 'Substitusi: L = ½ × 12 × 16. Kalikan semua angkanya!' }
      ],
      feedbackByOption: [
        'Kamu mengalikan d₁ × d₂ langsung. Ingat ada faktor ½ karena diagonal membagi belah ketupat menjadi 4 segitiga kecil.',
        '',
        'Perhatikan: gunakan kedua diagonal utuh (12 dan 16), baru kalikan ½.',
        'Coba hitung: ½ × 12 × 16. Sederhanakan: ½ × 12 = 6, lalu 6 × 16.'
      ],
      reflectionCard: {
        question: 'Mengapa luas belah ketupat dihitung menggunakan perkalian diagonal (½ × d₁ × d₂)?',
        options: [
          { text: 'Karena keempat sisi belah ketupat tidak memiliki ukuran yang sama sehingga sisi luarnya tidak bisa dikalikan langsung', correct: false },
          { text: 'Karena sudut yang terbentuk di antara dua sisi belah ketupat selalu berupa sudut tumpul yang sulit diukur tingginya', correct: false },
          { text: 'Karena perpotongan tegak lurus kedua diagonal membagi belah ketupat menjadi empat segitiga siku-siku yang kongruen', correct: true }
        ],
        conclusion: 'Benar! Dua diagonal yang tegak lurus membagi belah ketupat menjadi 4 segitiga siku-siku identik. Total luas = ½ × d₁ × d₂. Desain jendela geometris belah ketupat membuat fasad bangunan tampak elegan! ✨'
      }
    },

    // Level 2-4: Hiasan Layang-layang (Input)
    {
      id: '2-4',
      world: 1,
      level: 3,
      title: 'Hiasan Layang-layang',
      type: 'input',
      isBoss: false,
      learningGoal: 'Menghitung luas layang-layang',
      question: 'Hiasan gantung berbentuk layang-layang dengan diagonal <b>d₁ = 14 cm</b> dan <b>d₂ = 20 cm</b>. Hitunglah luasnya!',
      shape: 'kite',
      shapeParams: { d1: 14, d2: 20, labels: { d1: '14 cm', d2: '20 cm' } },
      answer: 140,
      unit: 'cm²',
      hints: [
        { tier: 'Konsep', text: 'Layang-layang mirip belah ketupat: punya 2 diagonal tegak lurus. Rumus luasnya sama!' },
        { tier: 'Rumus', text: 'Rumus: Luas layang-layang = ½ × d₁ × d₂ (sama seperti belah ketupat)' },
        { tier: 'Langkah', text: 'Substitusi: L = ½ × 14 × 20. Sederhanakan: ½ × 14 = 7, lalu kalikan 7 × 20.' }
      ],
      feedbackWrong: () => 'Perhatikan: layang-layang dihitung dari diagonalnya. Sudahkah kamu mengalikan kedua diagonal lalu membagi 2?',
      reflectionCard: {
        question: 'Mengapa bangun layang-layang memiliki rumus perhitungan luas yang sama dengan belah ketupat?',
        options: [
          { text: 'Karena layang-layang dan belah ketupat memiliki dua pasang sisi yang sama panjang dan semua sudutnya sama besar', correct: false },
          { text: 'Karena kedua bangun tersebut sama-sama memiliki sepasang diagonal yang saling berpotongan tegak lurus satu sama lain', correct: true },
          { text: 'Karena kedua bangun tersebut memiliki jumlah sumbu simetri lipat dan simetri putar yang tepat identik satu sama lain', correct: false }
        ],
        conclusion: 'Tepat sekali! Baik belah ketupat maupun layang-layang memiliki diagonal yang berpotongan TEGAK LURUS (90°). Oleh karena itu rumus luas keduanya identik: Luas = ½ × d₁ × d₂! 🪁'
      }
    },

    // Level 2-5: BOSS — Bangun Gabungan
    {
      id: '2-5',
      world: 1,
      level: 4,
      title: 'Boss: Bangun Gabungan',
      type: 'boss',
      isBoss: true,
      learningGoal: 'Menghitung luas bangun gabungan dari beberapa bangun datar',
      lives: 3,
      bossQuestions: [
        {
          type: 'input',
          question: 'Sebuah dinding samping rumah terdiri dari persegi panjang (<b>6 m × 4 m</b>) dengan segitiga di atasnya (alas <b>6 m</b>, tinggi <b>3 m</b>). Berapa total luas dinding?',
          shape: 'composite_rect_tri',
          shapeParams: { rectW: 6, rectH: 4, triBase: 6, triH: 3 },
          answer: 33,
          unit: 'm²',
          hints: [
            'Langkah: Hitung luas masing-masing bangun lalu jumlahkan.',
            'Luas persegi panjang = p × l. Luas segitiga = ½ × a × t. Total = keduanya dijumlahkan.'
          ],
          feedbackWrong: () => 'Hitung masing-masing: persegi panjang = p × l, segitiga = ½ × a × t, lalu jumlahkan.'
        },
        {
          type: 'mcq',
          question: 'Sebuah taman berbentuk trapesium (sisi sejajar <b>5 m</b> dan <b>9 m</b>, tinggi <b>6 m</b>) dikurangi kolam persegi (sisi <b>2 m</b>) di tengahnya. Berapa luas taman yang tersisa?',
          shape: 'composite_trap_sq',
          shapeParams: { topSide: 5, bottomSide: 9, height: 6, holeSide: 2 },
          options: [
            { text: '42 m²', value: 42 },
            { text: '38 m²', value: 38 },
            { text: '46 m²', value: 46 },
            { text: '34 m²', value: 34 }
          ],
          answer: 38,
          correctIndex: 1,
          hints: [
            'Langkah: Hitung luas trapesium, lalu kurangi luas persegi (kolam).',
            'Luas trapesium = ½ × (a+b) × t. Luas persegi = s². Sisa = trapesium - persegi.'
          ],
          feedbackByOption: [
            '42 itu luas trapesium saja, belum dikurangi kolam persegi.',
            '',
            'Coba hitung: Luas trapesium = ½ × (5+9) × 6, lalu kurangi s² kolam.',
            'Coba hitung: Luas trapesium = ½ × (5+9) × 6, lalu kurangi s² kolam.'
          ]
        },
        {
          type: 'input',
          question: 'Lantai ruang utama rumah berbentuk persegi panjang <b>10 m × 8 m</b>. Di satu sisinya ada teras segitiga (alas <b>10 m</b>, tinggi <b>3 m</b>). Berapa luas total lantai dan teras?',
          shape: 'composite_rect_tri',
          shapeParams: { rectW: 10, rectH: 8, triBase: 10, triH: 3 },
          answer: 95,
          unit: 'm²',
          hints: [
            'Total luas = Luas persegi panjang + Luas segitiga',
            'Rumus: (p × l) + (½ × a × t). Substitusi angkanya!'
          ],
          feedbackWrong: () => 'Total = (p × l) + (½ × a × t). Substitusi dan jumlahkan!'
        }
      ],
      reflectionCard: {
        question: 'Bagaimana strategi arsitek dalam menghitung luas dinding atau fasad bangunan yang bentuknya kompleks?',
        options: [
          { text: 'Mendekomposisi bentuk rumit menjadi beberapa bangun datar sederhana, lalu menghitung dan menjumlahkan setiap luasnya', correct: true },
          { text: 'Membuat perkiraan luas menggunakan persegi panjang terluar kemudian mengurangi sebagian kecil area sudut secara acak', correct: false },
          { text: 'Mengukur seluruh panjang keliling dinding terlebih dahulu lalu membaginya dengan jumlah total sudut bidang bangunan', correct: false }
        ],
        conclusion: 'Cemerlang! Teknik dekomposisi (memecah bangun gabungan) adalah kunci rahasia para ahli arsitektur modern untuk menghitung luas bidang fasad bangunan yang bervariasi! 🏠✨'
      }
    },

    // ========== DUNIA 3: JEMBATAN & TANGGA ==========

    // Level 3-1: Sisi Miring Tangga (Input)
    {
      id: '3-1',
      world: 2,
      level: 0,
      title: 'Sisi Miring Tangga',
      type: 'input',
      isBoss: false,
      learningGoal: 'Mencari sisi miring segitiga siku-siku (hipotenusa)',
      question: 'Sebuah tangga lantai dua bangunan memiliki tinggi <b>3 m</b> dan jarak horizontal <b>4 m</b>. Berapa panjang tangga (sisi miring)?',
      shape: 'rightTriangle',
      shapeParams: { a: 3, b: 4, unknown: 'c', labels: { a: '3 m', b: '4 m', c: '?' } },
      answer: 5,
      unit: 'm',
      reasoningQuestion: {
        prompt: 'Sebelum menghitung, tentukan dulu: sisi mana yang sedang kita cari, dan rumus apa yang tepat?',
        options: [
          { text: 'Mencari sisi miring (c) → c² = a² + b²', explanation: 'Benar! Tangga adalah sisi terpanjang yang menghubungkan tinggi dan jarak horizontal.', correct: true },
          { text: 'Mencari sisi tegak (a) → a² = c² − b²', explanation: 'Sisi tegak sudah diketahui (tinggi = 3 m). Yang belum diketahui adalah panjang tangga (sisi miring).', correct: false },
          { text: 'Mencari alas (b) → b² = c² − a²', explanation: 'Jarak horizontal sudah diketahui (4 m). Yang dicari adalah panjang tangga itu sendiri.', correct: false }
        ]
      },
      hints: [
        { tier: 'Konsep', text: 'Tangga, tinggi dinding lantai, dan lantai membentuk segitiga siku-siku. Tangga adalah sisi miring (hipotenusa) — sisi terpanjang.' },
        { tier: 'Rumus', text: 'Rumus Pythagoras: c² = a² + b² → c = √(a² + b²)' },
        { tier: 'Langkah', text: 'c² = 3² + 4² = 9 + 16 = 25. Maka c = √25. Berapa √25?' }
      ],
      feedbackWrong: () => 'Perhatikan: tangga adalah sisi terpanjang (miring). Gunakan c² = a² + b². Apakah kamu sudah menjumlahkan kuadrat kedua sisi tegaknya?',
      reflectionCard: {
        question: 'Pada situasi konstruksi manakah rumus kuadrat Pythagoras c² = a² + b² digunakan?',
        options: [
          { text: 'Saat kita ingin menghitung panjang salah satu sisi tegak jika sisi miring dan sisi datar sudah diketahui sebelumnya', correct: false },
          { text: 'Saat mengukur panjang sisi ketiga pada semua jenis segitiga sembarang tanpa memperhatikan besar sudut di dalamnya', correct: false },
          { text: 'Saat kita ingin mencari panjang sisi miring (hipotenusa) dari dua sisi tegak lurus yang telah diketahui ukurannya', correct: true }
        ],
        conclusion: 'Tepat! c² = a² + b² digunakan saat kita mengetahui 2 sisi tegak dan ingin mencari hipotenusa. Tangga bangunan bertingkat ini adalah contoh nyata hipotenusa dalam kehidupan sehari-hari! 🪜'
      }
    },

    // Level 3-2: Tinggi Tiang (Input)
    {
      id: '3-2',
      world: 2,
      level: 1,
      title: 'Tinggi Tiang',
      type: 'input',
      isBoss: false,
      learningGoal: 'Mencari sisi tegak segitiga siku-siku',
      question: 'Kawat penopang tiang pemancar gedung sepanjang <b>13 m</b> diikat dari puncak tiang ke tanah sejauh <b>5 m</b> dari kaki tiang. Berapa tinggi tiang?',
      shape: 'rightTriangle',
      shapeParams: { a: 12, b: 5, c: 13, unknown: 'a', labels: { a: '?', b: '5 m', c: '13 m' } },
      answer: 12,
      unit: 'm',
      reasoningQuestion: {
        prompt: 'Perhatikan gambar! Sisi mana yang sedang kita cari? Rumus apa yang tepat?',
        options: [
          { text: 'Mencari sisi tegak (a) → a² = c² − b²', explanation: 'Benar! Tiang adalah sisi tegak. Kita perlu mengurangkan kuadrat alas dari kuadrat hipotenusa.', correct: true },
          { text: 'Mencari sisi miring (c) → c² = a² + b²', explanation: 'Sisi miring (tali penopang = 13 m) sudah diketahui. Yang dicari adalah tinggi tiang.', correct: false },
          { text: 'Mencari alas (b) → b² = c² − a²', explanation: 'Jarak horizontal (5 m) sudah diketahui. Yang belum diketahui adalah tinggi tiang.', correct: false }
        ]
      },
      hints: [
        { tier: 'Konsep', text: 'Tali penopang adalah sisi miring (c = 13 m), jarak di tanah adalah alas (b = 5 m). Yang dicari: tinggi tiang (sisi tegak = a).' },
        { tier: 'Rumus', text: 'Karena mencari sisi tegak: a² = c² − b² → a = √(c² − b²)' },
        { tier: 'Langkah', text: 'a² = 13² − 5² = 169 − 25 = 144. Maka a = √144. Berapa √144?' }
      ],
      feedbackWrong: () => 'Ingat: kali ini kita mencari sisi tegak, bukan sisi miring. Operasinya pengurangan kuadrat: a² = c² − b². Sudahkah kamu mengurangkan, bukan menjumlahkan?',
      reflectionCard: {
        question: 'Apa perbedaan matematis saat mencari panjang sisi miring dibandingkan mencari salah satu sisi tegak?',
        options: [
          { text: 'Mencari sisi miring menggunakan penjumlahan kuadrat, sedangkan mencari sisi tegak menggunakan pengurangan kuadrat', correct: true },
          { text: 'Mencari sisi miring selalu menggunakan penarikan akar, sedangkan mencari sisi tegak tidak perlu menggunakan bentuk akar', correct: false },
          { text: 'Mencari sisi miring menghasilkan nilai yang lebih kecil daripada sisi tegak karena sudut miringnya condong ke tanah', correct: false }
        ],
        conclusion: 'Benar! Jangan sampai tertukar: Mencari sisi miring (c) = JUMLAHKAN (c² = a² + b²). Mencari sisi tegak (a atau b) = KURANGKAN (a² = c² - b²). Sisi miring selalu yang terpanjang! 📐'
      }
    },

    // Level 3-3: Bukti Visual Pythagoras (Puzzle)
    {
      id: '3-3',
      world: 2,
      level: 2,
      title: 'Bukti Visual Pythagoras',
      type: 'puzzle',
      isBoss: false,
      learningGoal: 'Membuktikan teorema Pythagoras secara visual (a² + b² = c²)',
      question: 'Cocokkan luas persegi (a², b², c²) ke sisi segitiga siku-siku yang benar untuk membuktikan bahwa a² + b² = c²!',
      puzzleConfig: {
        triangle: { a: 3, b: 4, c: 5 },
        draggables: [
          { id: 'sq9', label: '9', value: 9, areaLabel: '3² = 9' },
          { id: 'sq16', label: '16', value: 16, areaLabel: '4² = 16' },
          { id: 'sq25', label: '25', value: 25, areaLabel: '5² = 25' }
        ],
        dropzones: [
          { id: 'side-a', label: 'Sisi a = 3', correctValue: 9 },
          { id: 'side-b', label: 'Sisi b = 4', correctValue: 16 },
          { id: 'side-c', label: 'Sisi c = 5', correctValue: 25 }
        ]
      },
      hints: [
        { tier: 'Konsep', text: 'Setiap sisi segitiga bisa dibuat persegi di atasnya. Luas persegi = sisi².' },
        { tier: 'Rumus', text: 'Sisi a punya persegi a², sisi b punya persegi b². Teorema: a² + b² = c².' },
        { tier: 'Langkah', text: 'Cek: 9 + 16 = 25. Maka persegi 9 → sisi 3, persegi 16 → sisi 4, persegi 25 → sisi 5 (miring).' }
      ],
      feedbackWrong: () => 'Perhatikan: persegi yang mana milik sisi yang mana? Sisi 3 punya persegi 3² = 9, sisi 4 punya 4² = 16. Coba cocokkan lagi!',
      reflectionCard: {
        question: 'Secara visual geometri, apakah makna sesungguhnya dari Teorema Pythagoras a² + b² = c²?',
        options: [
          { text: 'Ketiga persegi yang menempel pada masing-masing sisi segitiga siku-siku memiliki luas bidang yang persis berukuran sama', correct: false },
          { text: 'Luas area persegi pada sisi miring sama dengan jumlah total luas area dari dua persegi yang menempel pada sisi-sisi tegak', correct: true },
          { text: 'Volume balok yang dibentuk oleh sisi miring dapat memuat seluruh isi pasir dari dua balok yang dibangun pada sisi tegak', correct: false }
        ],
        conclusion: 'Luar biasa! Pythagoras bukan sekadar rumus aljabar, tapi hubungan nyata antara luas persegi: Luas Persegi A + Luas Persegi B = Luas Persegi C! Visual ini terbukti pada puzzle yang baru saja kamu selesaikan. 🧩'
      }
    },

    // Level 3-4: Diagonal Jembatan (MCQ)
    {
      id: '3-4',
      world: 2,
      level: 3,
      title: 'Diagonal Jembatan',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menerapkan Pythagoras untuk mencari diagonal',
      question: 'Jembatan penghubung dua gedung perkantoran berbentuk persegi panjang dengan panjang <b>8 m</b> dan lebar <b>6 m</b>. Untuk memasang kawat diagonal penguat, berapa panjang kawat yang dibutuhkan?',
      shape: 'rectangleDiagonal',
      shapeParams: { width: 8, height: 6, labels: { p: '8 m', l: '6 m', d: '?' } },
      options: [
        { text: '14 m', value: 14 },
        { text: '10 m', value: 10 },
        { text: '48 m', value: 48 },
        { text: '7 m', value: 7 }
      ],
      answer: 10,
      correctIndex: 1,
      reasoningQuestion: {
        prompt: 'Diagonal jembatan membagi persegi panjang menjadi 2 segitiga. Bagaimana cara mencari panjang diagonal?',
        options: [
          { text: 'Diagonal = hipotenusa segitiga siku-siku → d² = p² + l²', explanation: 'Benar! Diagonal persegi panjang adalah sisi miring (hipotenusa) dari segitiga siku-siku yang terbentuk.', correct: true },
          { text: 'Diagonal = p + l', explanation: 'Penjumlahan langsung hanya berlaku untuk keliling, bukan diagonal. Diagonal membentuk segitiga siku-siku!', correct: false },
          { text: 'Diagonal = p × l', explanation: 'Perkalian p × l menghasilkan luas, bukan diagonal. Diagonal perlu Pythagoras!', correct: false }
        ]
      },
      hints: [
        { tier: 'Konsep', text: 'Diagonal persegi panjang membelah bangun menjadi 2 segitiga siku-siku. Diagonal = hipotenusa.' },
        { tier: 'Rumus', text: 'Karena diagonal = hipotenusa: d² = p² + l² → d = √(p² + l²)' },
        { tier: 'Langkah', text: 'd² = 8² + 6² = 64 + 36 = 100. Maka d = √100 = ?' }
      ],
      feedbackByOption: [
        'Kamu menjumlahkan langsung p + l. Tapi diagonal bukan garis lurus p + l, melainkan garis miring. Gunakan Pythagoras!',
        '',
        'Itu hasil p × l (luas). Diagonal bukan luas, tapi panjang garis miring di dalam persegi panjang.',
        'Coba hitung lagi: d² = 8² + 6² = 64 + 36. Berapa akar kuadrat dari hasilnya?'
      ],
      reflectionCard: {
        question: 'Mengapa rumus Teorema Pythagoras dapat digunakan untuk mencari panjang diagonal bidang persegi panjang?',
        options: [
          { text: 'Karena setiap bangun persegi panjang selalu memiliki empat sisi yang saling berhadapan sejajar dan sama panjangnya', correct: false },
          { text: 'Karena garis diagonal membagi sudut siku-siku persegi panjang menjadi dua bagian yang masing-masing tepat bernilai 45°', correct: false },
          { text: 'Karena garis diagonal membagi persegi panjang menjadi dua segitiga siku-siku dengan diagonal sebagai sisi miringnya', correct: true }
        ],
        conclusion: 'Hebat! Diagonal persegi panjang selalu membaginya menjadi 2 segitiga siku-siku. Panjang dan lebar menjadi sisi siku-siku (a dan b), sedangkan diagonal adalah hipotenusa (c). Rumusnya: d² = p² + l²! 🌉'
      }
    },

    // Level 3-5: BOSS — Pythagoras Master
    {
      id: '3-5',
      world: 2,
      level: 4,
      title: 'Boss: Pythagoras Master',
      type: 'boss',
      isBoss: true,
      learningGoal: 'Menyelesaikan berbagai soal kontekstual Pythagoras',
      lives: 3,
      bossQuestions: [
        {
          type: 'input',
          question: 'Sebuah tiang crane konstruksi bangunan memiliki tinggi <b>9 m</b>. Tali baja dari puncak tiang ke ujung tumpuan sepanjang <b>15 m</b>. Berapa jarak horizontal dari kaki tiang ke ujung tumpuan?',
          shape: 'rightTriangle',
          shapeParams: { a: 9, b: 12, c: 15, unknown: 'b', labels: { a: '9 m', b: '?', c: '15 m' } },
          answer: 12,
          unit: 'm',
          hints: [
            'Rumus: b² = c² - a². Sisi miring c = 15, sisi tegak a = 9.',
            'b² = 15² - 9². Hitung kuadrat masing-masing, kurangkan, lalu cari akarnya!'
          ],
          feedbackWrong: () => 'Gunakan b² = c² - a². Substitusi dan hitung!'
        },
        {
          type: 'mcq',
          question: 'Manakah yang merupakan <b>tripel Pythagoras</b>?',
          shape: 'none',
          options: [
            { text: '3, 4, 5', value: '3,4,5' },
            { text: '2, 3, 4', value: '2,3,4' },
            { text: '5, 6, 7', value: '5,6,7' },
            { text: '4, 5, 6', value: '4,5,6' }
          ],
          answer: '3,4,5',
          correctIndex: 0,
          hints: [
            'Tripel Pythagoras: 3 bilangan bulat positif a, b, c yang memenuhi a² + b² = c².',
            'Cek setiap pilihan: kuadratkan 2 angka kecil, jumlahkan, dan bandingkan dengan kuadrat angka terbesar.'
          ],
          feedbackByOption: [
            '',
            '2² + 3² = 4 + 9 = 13 ≠ 16 = 4². Bukan tripel Pythagoras.',
            '5² + 6² = 25 + 36 = 61 ≠ 49 = 7². Bukan tripel Pythagoras.',
            '4² + 5² = 16 + 25 = 41 ≠ 36 = 6². Bukan tripel Pythagoras.'
          ]
        },
        {
          type: 'input',
          question: 'Tangga panjangnya <b>10 m</b> disandarkan ke dinding. Kaki tangga berjarak <b>6 m</b> dari dinding. Berapa tinggi dinding yang bisa dicapai tangga?',
          shape: 'rightTriangle',
          shapeParams: { a: 8, b: 6, c: 10, unknown: 'a', labels: { a: '?', b: '6 m', c: '10 m' } },
          answer: 8,
          unit: 'm',
          hints: [
            'Rumus: a² = c² - b². Tangga adalah sisi miring (c).',
            'a² = 10² - 6². Hitung kuadratnya, kurangkan, dan cari akar kuadratnya!'
          ],
          feedbackWrong: () => 'Gunakan a² = c² - b². Substitusi dan hitung!'
        }
      ],
      reflectionCard: {
        question: 'Mengapa perancangan tangga dan jembatan berbasis segitiga siku-siku Pythagoras sangat stabil dan kokoh?',
        options: [
          { text: 'Karena bentuk segitiga siku-siku membutuhkan lebih banyak material baja sehingga struktur menjadi lebih berat dan padat', correct: false },
          { text: 'Karena bentuk segitiga bersifat kaku (rigid) dan kemiringan yang tepat menyalurkan gaya beban secara stabil ke tumpuan', correct: true },
          { text: 'Karena sudut siku-siku 90° mencegah getaran angin bertiup kencang dan menjaga jembatan terlihat sejajar dengan jalan raya', correct: false }
        ],
        conclusion: 'Hebat sekali! Segitiga adalah satu-satunya bentuk geometri yang tidak bisa berubah bentuk tanpa mengubah panjang sisinya (rigid structure). Karena itulah para arsitek dan insinyur struktur selalu memakai prinsip Pythagoras untuk membuat rangka tahan guncangan! 🌉📐'
      }
    },

    // ========== DUNIA 4: TAMAN & KOLAM (LINGKARAN) ==========

    // Level 4-1: Keliling Kolam Bundar (Input)
    {
      id: '4-1',
      world: 3,
      level: 0,
      title: 'Keliling Kolam Bundar',
      type: 'input',
      isBoss: false,
      learningGoal: 'Menghitung keliling lingkaran',
      question: 'Kolam air mancur di taman depan gedung berbentuk lingkaran dengan jari-jari <b>7 m</b>. Berapa keliling kolam tersebut? (Gunakan π = 22/7)',
      shape: 'circle',
      shapeParams: { r: 7, labels: { r: '7 m' } },
      answer: 44,
      unit: 'm',
      hints: [
        { tier: 'Konsep', text: 'Keliling adalah panjang tepian terluar dari kolam bundar jika kamu berjalan mengitarinya satu putaran.' },
        { tier: 'Rumus', text: 'Rumus: Keliling lingkaran = 2 × π × r atau π × d' },
        { tier: 'Langkah', text: 'Substitusi: K = 2 × (22/7) × 7. Angka 7 saling membagi, hitung 2 × 22!' }
      ],
      feedbackWrong: () => 'Ingat: Keliling kolam adalah 2 × π × r. Gunakan π = 22/7 dan r = 7. Coba periksa perhitungan perkalianmu!',
      reflectionCard: {
        question: 'Mengapa penggunaan nilai π = 22/7 lebih disarankan dibanding 3,14 pada jari-jari berukuran 7 meter?',
        options: [
          { text: 'Karena nilai 7 dapat saling menyederhanakan penyebut pada pecahan 22/7 sehingga hasil hitungan bulat dan presisi', correct: true },
          { text: 'Karena pecahan 22/7 merupakan nilai eksak lingkaran, sedangkan desimal 3,14 hanya berlaku untuk bangun elips lonjong', correct: false },
          { text: 'Karena aturan standar matematika melarang penggunaan desimal koma untuk menghitung bidang terbuka di luar ruangan', correct: false }
        ],
        conclusion: 'Cerdas! Tips praktis arsitek: Jika r atau d kelipatan 7 (7, 14, 21, 28...), selalu gunakan π = 22/7 agar mudah dicoret dan tidak berurusan dengan desimal rumit! 🎯'
      }
    },

    // Level 4-2: Luas Taman Bundar (Slider)
    {
      id: '4-2',
      world: 3,
      level: 1,
      title: 'Luas Taman Bundar',
      type: 'slider',
      isBoss: false,
      learningGoal: 'Menghitung luas lingkaran',
      question: 'Taman bunga berbentuk lingkaran. Geser slider untuk mengatur jari-jari agar luasnya tepat <b>154 m²</b>. (π = 22/7)',
      shape: 'circle',
      shapeParams: {},
      sliderConfig: { min: 1, max: 14, step: 1, unit: 'm' },
      targetLabel: 'Luas = 154 m²',
      answer: 7,
      answerCheck: (val) => Math.round((22/7) * val * val) === 154,
      displayCalc: (val) => `${val} m`,
      hints: [
        { tier: 'Konsep', text: 'Luas lingkaran mengukur seluruh hamparan rumput di dalam batas taman bundar.' },
        { tier: 'Rumus', text: 'Rumus: Luas lingkaran = π × r²' },
        { tier: 'Langkah', text: 'Jika Luas = 154, maka: (22/7) × r² = 154 → r² = 154 × 7 / 22 = 49. Berapa akar dari 49?' }
      ],
      feedbackWrong: () => 'Luas belum tepat 154 m². Gunakan rumus Luas = π × r². Nilai r berapa yang jika dikuadratkan menghasilkan 49?',
      reflectionCard: {
        question: 'Apa perbedaan praktis antara pengukuran keliling kolam dengan luas taman berbentuk lingkaran?',
        options: [
          { text: 'Keliling menggunakan satuan luas meter persegi (m²), sedangkan luas taman diukur dengan satuan panjang meter lari (m)', correct: false },
          { text: 'Nilai keliling lingkaran akan selalu menghasilkan angka yang lebih besar daripada nilai luasnya pada semua ukuran jari-jari', correct: false },
          { text: 'Keliling menentukan panjang pagar pembatas di tepian, sedangkan luas menentukan hamparan rumput yang ditanam di dalamnya', correct: true }
        ],
        conclusion: 'Tepat sekali! Memahami perbedaan pagar pembatas (keliling) dan hamparan rumput taman (luas) adalah keahlian penting seorang perancang lanskap arsitektur! 🌸'
      }
    },

    // Level 4-3: Pagar Setengah Lingkaran (MCQ)
    {
      id: '4-3',
      world: 3,
      level: 2,
      title: 'Pagar Setengah Lingkaran',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menghitung keliling setengah lingkaran tertutup',
      question: 'Teras depan rumah berbentuk setengah lingkaran dengan diameter <b>14 m</b>. Berapa panjang pagar yang diperlukan untuk memagari seluruh tepi teras? (π = 22/7)',
      shape: 'semicircle',
      shapeParams: { d: 14, labels: { d: '14 m' } },
      options: [
        { text: '22 m', value: 22 },
        { text: '36 m', value: 36 },
        { text: '44 m', value: 44 },
        { text: '154 m', value: 154 }
      ],
      answer: 36,
      correctIndex: 1,
      hints: [
        { tier: 'Konsep', text: 'Pagar mengelilingi seluruh tepi teras tertutup: busur lengkung ditambah garis lurus diameternya.' },
        { tier: 'Rumus', text: 'Keliling total = (½ × π × d) + diameter' },
        { tier: 'Langkah', text: 'Lengkung = ½ × (22/7) × 14 = 22 m. Lalu tambahkan diameter 14 m: 22 + 14 = ?' }
      ],
      feedbackByOption: [
        '22 m baru panjang busur lengkungnya saja, jangan lupa tepi lurus (diameter) teras juga perlu dipagari!',
        '',
        '44 m adalah keliling satu lingkaran penuh, sedangkan teras ini hanya setengah lingkaran tertutup.',
        '154 m adalah luas lingkaran, sedangkan yang ditanyakan adalah panjang pagar keliling!'
      ],
      reflectionCard: {
        question: 'Mengapa saat menghitung pagar penutup setengah lingkaran, panjang diameter harus ditambahkan ke busur lengkungnya?',
        options: [
          { text: 'Karena rumus setengah lingkaran otomatis mewajibkan penambahan nilai dua kali jari-jari agar menjadi bentuk simetris', correct: false },
          { text: 'Karena keliling adalah total batas sekeliling bangun tertutup, termasuk ruas garis lurus penutup di sepanjang diameternya', correct: true },
          { text: 'Karena busur lengkung setengah lingkaran hanya menampung separuh luas bidang sehingga diameter menjadi penyeimbang luasnya', correct: false }
        ],
        conclusion: 'Benar sekali! Ingat jebakan ini: Keliling bangun setengah lingkaran tertutup = (½ × keliling lingkaran utuh) + DIAMETER lurus penutupnya. Jangan sampai pagarmu bolong di satu sisi! 🚧'
      }
    },

    // Level 4-4: Susun Rumus Luas Lingkaran (FormulaSort)
    {
      id: '4-4',
      world: 3,
      level: 3,
      title: 'Susun Rumus Lingkaran',
      type: 'formulaSort',
      isBoss: false,
      learningGoal: 'Memahami komponen rumus luas lingkaran',
      question: 'Susun potongan rumus berikut menjadi rumus <b>Luas Lingkaran</b> yang benar!',
      shape: 'circle',
      shapeParams: { r: 5, labels: { r: 'r' } },
      formulaSortConfig: {
        correctOrder: ['L', '=', 'π', '×', 'r', '²'],
        pieces: ['r', '×', '²', 'π', '=', 'L'],
        displayLabel: 'Luas Lingkaran'
      },
      hints: [
        { tier: 'Konsep', text: 'Luas lingkaran diukur dari konstanta perbandingan keliling (π) dikalikan kuadrat jari-jarinya.' },
        { tier: 'Rumus', text: 'Dimulai dengan simbol Luas "L =" lalu perkalian konstanta π dengan r².' },
        { tier: 'Langkah', text: 'Urutan baku: L = π × r²' }
      ],
      feedbackWrong: () => 'Ingat rumus luas lingkaran: L = π × r². Coba susun kembali potongannya dari kiri ke kanan!',
      reflectionCard: {
        question: 'Mengapa variabel jari-jari pada rumus luas lingkaran selalu dipangkatkan dua (r²)?',
        options: [
          { text: 'Karena setiap lingkaran terbentuk dari gabungan dua buah jari-jari yang berlawanan arah membentuk garis lurus diameter', correct: false },
          { text: 'Karena nilai keliling lingkaran berbanding lurus dengan kuadrat jari-jarinya ketika dihitung menggunakan perbandingan busur', correct: false },
          { text: 'Karena luas mengukur dimensi bidang dua dimensi (panjang × lebar), sehingga perkalian satuan panjang menghasilkan pangkat dua', correct: true }
        ],
        conclusion: 'Hebat! Luas selalu berdimensi dua (panjang × lebar = m²). Pada lingkaran, dua dimensi itu diwakili oleh r × r = r². Sedangkan keliling adalah satu dimensi (garis panjang), sehingga r tidak dikuadratkan (2πr)! 📐'
      }
    },

    // Level 4-5: BOSS — Lingkaran Master
    {
      id: '4-5',
      world: 3,
      level: 4,
      title: 'Boss: Lingkaran Master',
      type: 'boss',
      isBoss: true,
      learningGoal: 'Menyelesaikan berbagai soal lingkaran',
      lives: 3,
      bossQuestions: [
        {
          type: 'input',
          question: 'Sebuah roda gerobak memiliki diameter <b>28 cm</b>. Berapa jarak yang ditempuh roda dalam satu putaran penuh? (π = 22/7)',
          shape: 'circle',
          shapeParams: { r: 14, labels: { d: '28 cm' } },
          answer: 88,
          unit: 'cm',
          hints: [
            { tier: 'Konsep', text: 'Satu putaran penuh sama dengan panjang keliling lingkaran roda.' },
            { tier: 'Rumus', text: 'Jarak 1 putaran = K = π × d' },
            { tier: 'Langkah', text: 'K = (22/7) × 28. Bagi 28 dengan 7 = 4, lalu 22 × 4 = ?' }
          ],
          feedbackWrong: () => 'Jarak satu putaran sama dengan keliling roda: K = π × d. Substitusi diameter 28 cm dan hitung!'
        },
        {
          type: 'mcq',
          question: 'Luas sebuah lingkaran adalah <b>616 cm²</b>. Berapakah jari-jarinya? (π = 22/7)',
          shape: 'circle',
          shapeParams: { r: 14, labels: { r: '?' } },
          options: [
            { text: '7 cm', value: 7 },
            { text: '14 cm', value: 14 },
            { text: '21 cm', value: 21 },
            { text: '28 cm', value: 28 }
          ],
          answer: 14,
          correctIndex: 1,
          hints: [
            { tier: 'Konsep', text: 'Membalik rumus: jika Luas diketahui, cari r melalui r² = Luas ÷ π.' },
            { tier: 'Rumus', text: 'r² = 616 ÷ (22/7) = 616 × (7/22)' },
            { tier: 'Langkah', text: '616 ÷ 22 = 28. Lalu 28 × 7 = 196. Berapa akar dari 196?' }
          ],
          feedbackByOption: [
            'Jika r = 7 cm, luasnya adalah (22/7) × 49 = 154 cm², bukan 616 cm².',
            '',
            'Jika r = 21 cm, luasnya adalah (22/7) × 441 = 1386 cm², terlalu besar!',
            'Jika r = 28 cm, luasnya adalah (22/7) × 784 = 2464 cm², terlalu besar!'
          ]
        },
        {
          type: 'input',
          question: 'Sebuah pelataran gedung berbentuk persegi dengan sisi <b>14 m</b> memiliki kolam lingkaran di tengahnya dengan jari-jari <b>7 m</b>. Berapa luas pelataran yang tersisa (bukan kolam)? (π = 22/7)',
          shape: 'none',
          answer: 42,
          unit: 'm²',
          hints: [
            { tier: 'Konsep', text: 'Luas pelataran tersisa = Luas persegi utuh dikurangi luas kolam lingkaran.' },
            { tier: 'Rumus', text: 'Sisa = (sisi × sisi) − (π × r²)' },
            { tier: 'Langkah', text: 'Persegi = 14 × 14 = 196. Kolam = (22/7) × 7² = 154. Kurangkan: 196 − 154 = ?' }
          ],
          feedbackWrong: () => 'Hitung luas persegi (14 × 14) lalu kurangi dengan luas lingkaran kolam ((22/7) × 7²). Berapa selisihnya?'
        }
      ],
      reflectionCard: {
        question: 'Bagaimana penerapan konsep geometri lingkaran dalam efisiensi desain arsitektur dan tata kota?',
        options: [
          { text: 'Memaksimalkan luas area terbuka dengan keliling dinding minimum serta merancang kubah pelindung yang kokoh menahan beban', correct: true },
          { text: 'Membuat tata letak denah ruangan menjadi lebih menarik secara visual meskipun membutuhkan lebih banyak sambungan sudut dinding', correct: false },
          { text: 'Memastikan seluruh arah tiupan angin bergerak melingkar di dalam gedung sehingga pendingin udara tidak perlu dipasang lagi', correct: false }
        ],
        conclusion: 'Luar biasa! Lingkaran adalah bangun datar dengan rasio luas terhadap keliling paling efisien di alam semesta. Arsitek memanfaatkan ini untuk membuat kubah yang kuat, tangki air tahan tekanan, dan taman yang ramah pengunjung! 🏛️🌐'
      }
    },

    // ========== DUNIA 5: GUDANG & MENARA (BANGUN RUANG) ==========

    // Level 5-1: Volume Gudang Balok (Input)
    {
      id: '5-1',
      world: 4,
      level: 0,
      title: 'Volume Gudang Balok',
      type: 'input',
      isBoss: false,
      learningGoal: 'Menghitung volume balok',
      question: 'Gudang penyimpanan padi (Kroeng Badee) berbentuk balok dengan panjang <b>8 m</b>, lebar <b>5 m</b>, dan tinggi <b>3 m</b>. Berapa volume gudang tersebut?',
      shape: 'cuboid',
      shapeParams: { p: 8, l: 5, t: 3, labels: { p: '8 m', l: '5 m', t: '3 m' } },
      answer: 120,
      unit: 'm³',
      hints: [
        { tier: 'Konsep', text: 'Volume adalah daya tampung isi ruang 3 dimensi di dalam gudang.' },
        { tier: 'Rumus', text: 'Rumus: Volume balok = panjang × lebar × tinggi' },
        { tier: 'Langkah', text: 'Substitusi: V = 8 × 5 × 3. Kalikan: 8 × 5 = 40, lalu 40 × 3 = ?' }
      ],
      feedbackWrong: () => 'Volume balok dihitung dengan mengalikan ketiga dimensinya: p × l × t. Periksa kembali perkalianmu!',
      reflectionCard: {
        question: 'Mengapa satuan pengukuran volume ruang selalu menggunakan satuan kubik (m³ atau cm³)?',
        options: [
          { text: 'Karena setiap bangun ruang balok memiliki dua belas buah rusuk yang saling terhubung dan tegak lurus pada sudut-sudutnya', correct: false },
          { text: 'Karena volume mengukur daya tampung ruang 3 dimensi yang dihasilkan dari perkalian tiga ukuran: panjang, lebar, dan tinggi', correct: true },
          { text: 'Karena ruang balok hanya dapat diisi oleh benda-benda padat yang memiliki bentuk kubus sempurna berukuran satu sentimeter', correct: false }
        ],
        conclusion: 'Tepat sekali! Tiga dimensi yang dikalikan menghasilkan satuan kubik. Dalam arsitektur bangunan, kapasitas volume menentukan seberapa banyak kapasitas muatan logistik yang bisa ditampung ruangan secara aman! 🌾'
      }
    },

    // Level 5-2: Luas Permukaan Kubus (MCQ)
    {
      id: '5-2',
      world: 4,
      level: 1,
      title: 'Kotak Penyimpanan',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menghitung luas permukaan kubus',
      question: 'Sebuah peti pusaka berbentuk kubus memiliki panjang rusuk <b>4 m</b>. Berapa total luas permukaan kayu yang dibutuhkan untuk melapisi peti tersebut?',
      shape: 'cube',
      shapeParams: { s: 4, labels: { s: '4 m' } },
      options: [
        { text: '64 m²', value: 64 },
        { text: '96 m²', value: 96 },
        { text: '24 m²', value: 24 },
        { text: '16 m²', value: 16 }
      ],
      answer: 96,
      correctIndex: 1,
      hints: [
        { tier: 'Konsep', text: 'Kubus memiliki 6 bidang sisi persegi yang semuanya berukuran sama persis.' },
        { tier: 'Rumus', text: 'Rumus: Luas Permukaan = 6 × (sisi × sisi) = 6 × s²' },
        { tier: 'Langkah', text: 'Hitung luas satu sisi: 4 × 4 = 16 m². Karena ada 6 sisi: 6 × 16 = ?' }
      ],
      feedbackByOption: [
        '64 m³ adalah volume kubus (s³), bukan luas permukaan luarnya.',
        '',
        '24 adalah keliling atau 6 × 4. Luas setiap sisi adalah s², bukan s.',
        '16 m² baru luas satu sisi saja. Ingat peti kubus memiliki 6 sisi penutup!'
      ],
      reflectionCard: {
        question: 'Mengapa arsitek perlu menghitung luas permukaan secara cermat sebelum melakukan pekerjaan konstruksi?',
        options: [
          { text: 'Untuk memastikan seberapa berat muatan barang yang dapat dimasukkan ke dalam ruang penyimpanan tanpa merusak lantai bawah', correct: false },
          { text: 'Untuk menentukan kekuatan pondasi beton terhadap daya dorong angin kencang yang bertiup kencang menerpa dinding luar gedung', correct: false },
          { text: 'Untuk memperkirakan kebutuhan material penutup bidang, seperti plesteran semen, cat pelindung, atau panel dinding secara akurat', correct: true }
        ],
        conclusion: 'Sangat tepat! Arsitek menghitung luas permukaan dinding dan plafon agar tidak kekurangan maupun membuang-buang bahan cat atau panel pelindung dinding! 📦'
      }
    },

    // Level 5-3: Volume Prisma Segitiga (Slider)
    {
      id: '5-3',
      world: 4,
      level: 2,
      title: 'Atap Prisma Segitiga',
      type: 'slider',
      isBoss: false,
      learningGoal: 'Menghitung volume prisma segitiga',
      question: 'Ruang loteng atap rumah berbentuk prisma segitiga. Alas segitiga <b>6 m</b>, tinggi segitiga <b>4 m</b>. Geser slider untuk mengatur panjang atap agar volumenya tepat <b>60 m³</b>.',
      shape: 'triangularPrism',
      shapeParams: { base: 6, height: 4 },
      sliderConfig: { min: 1, max: 15, step: 1, unit: 'm' },
      targetLabel: 'Volume = 60 m³',
      answer: 5,
      answerCheck: (val) => 0.5 * 6 * 4 * val === 60,
      displayCalc: (val) => `${val} m`,
      hints: [
        { tier: 'Konsep', text: 'Volume prisma dihitung dari luas penampang segitiga depannya dikalikan panjang ke belakang.' },
        { tier: 'Rumus', text: 'Volume = Luas alas segitiga × panjang = (½ × alas × tinggi) × panjang' },
        { tier: 'Langkah', text: 'Luas segitiga = ½ × 6 × 4 = 12 m². Maka: 12 × panjang = 60. Berapa 60 dibagi 12?' }
      ],
      feedbackWrong: () => 'Volume belum tepat 60 m³. Hitung luas penampang atap: ½ × 6 × 4 = 12 m². Nilai panjang berapa yang jika dikali 12 menghasilkan 60?',
      reflectionCard: {
        question: 'Mengapa atap rumah tinggal di daerah tropis umumnya dirancang berbentuk prisma segitiga dengan kemiringan curam?',
        options: [
          { text: 'Agar bangunan tampak menjulang tinggi megah dari kejauhan dan menghemat pemakaian kayu pada struktur rangka plafon rumah', correct: false },
          { text: 'Agar aliran air hujan deras dapat meluncur turun dengan cepat serta menciptakan sirkulasi udara sejuk di bawah loteng atap', correct: true },
          { text: 'Agar sudut kemiringan atap yang sangat curam dapat mencegah binatang liar memanjat masuk melalui celah ventilasi udara dinding', correct: false }
        ],
        conclusion: 'Luar biasa! Geometri atap prisma segitiga curam pada bangunan iklim tropis berfungsi mempercepat aliran air hujan dan memberikan sirkulasi udara sejuk di dalam rumah! 🏠🌧️'
      }
    },

    // Level 5-4: Susun Rumus Volume Limas (FormulaSort)
    {
      id: '5-4',
      world: 4,
      level: 3,
      title: 'Susun Rumus Volume Limas',
      type: 'formulaSort',
      isBoss: false,
      learningGoal: 'Memahami rumus volume limas',
      question: 'Susun potongan rumus berikut menjadi rumus <b>Volume Limas</b> yang benar!',
      shape: 'pyramid',
      shapeParams: {},
      formulaSortConfig: {
        correctOrder: ['V', '=', '⅓', '×', 'Lalas', '×', 't'],
        pieces: ['×', 't', 'Lalas', '⅓', '=', '×', 'V'],
        displayLabel: 'Volume Limas'
      },
      hints: [
        { tier: 'Konsep', text: 'Volume limas yang meruncing tepat sepertiga (⅓) dari volume prisma dengan alas dan tinggi yang sama.' },
        { tier: 'Rumus', text: 'Volume dimulai dari faktor sepertiga: V = ⅓ × Luas alas × tinggi' },
        { tier: 'Langkah', text: 'Urutan: V = ⅓ × Lalas × t' }
      ],
      feedbackWrong: () => 'Ingat rumus volume limas: V = ⅓ × Lalas × t. Periksa kembali urutan simbolnya!',
      reflectionCard: {
        question: 'Mengapa pada rumus volume limas selalu terdapat faktor pengali sepertiga (⅓ × Luas Alas × tinggi)?',
        options: [
          { text: 'Karena satu prisma atau kubus dapat dibagi secara tepat menjadi tiga buah bangun limas yang memiliki alas dan tinggi yang sama', correct: true },
          { text: 'Karena bangun limas memiliki tiga pasang rusuk tegak yang saling bertemu pada satu titik puncak di bagian atas bidang alasnya', correct: false },
          { text: 'Karena bidang alas limas selalu berbentuk segitiga sehingga volumenya harus dibagi tiga agar sesuai dengan ukuran tinggi tegak', correct: false }
        ],
        conclusion: 'Keren sekali! Fakta geometris membuktikan bahwa 1 kubus atau prisma dapat dipecah tepat menjadi 3 limas dengan alas dan tinggi yang sama. Itulah sebabnya volume limas selalu ⅓ dari volume prisma/balok! 📐🔺'
      }
    },

    // Level 5-5: BOSS — Bangun Ruang Master
    {
      id: '5-5',
      world: 4,
      level: 4,
      title: 'Boss: Ruang Master',
      type: 'boss',
      isBoss: true,
      learningGoal: 'Menyelesaikan soal volume dan luas permukaan bangun ruang',
      lives: 3,
      bossQuestions: [
        {
          type: 'input',
          question: 'Sebuah bak penampungan air bersih rumah berbentuk kubus memiliki volume <b>125 liter</b> (125 dm³). Berapa panjang rusuk sisi dalam bak air tersebut?',
          shape: 'cube',
          shapeParams: { s: 5, labels: { v: 'V = 125' } },
          answer: 5,
          unit: 'dm',
          hints: [
            { tier: 'Konsep', text: 'Volume kubus adalah rusuk dipangkatkan tiga: V = s³.' },
            { tier: 'Rumus', text: 'Maka untuk mencari rusuk: s = ∛V (akar pangkat 3)' },
            { tier: 'Langkah', text: 'Cari angka berapa yang jika dikalikan dirinya sendiri 3 kali hasilnya 125? (... × ... × ... = 125)' }
          ],
          feedbackWrong: () => 'Ingat volume kubus: V = s × s × s. Angka berapa yang dipangkatkan tiga menghasilkan 125?'
        },
        {
          type: 'mcq',
          question: 'Berapa volume atap menara berbentuk limas segiempat dengan alas persegi sisi <b>6 m</b> dan tinggi limas <b>10 m</b>?',
          shape: 'pyramid',
          shapeParams: { base: 6, height: 10 },
          options: [
            { text: '360 m³', value: 360 },
            { text: '120 m³', value: 120 },
            { text: '60 m³', value: 60 },
            { text: '180 m³', value: 180 }
          ],
          answer: 120,
          correctIndex: 1,
          hints: [
            { tier: 'Konsep', text: 'Hitung luas alas perseginya dulu, lalu kalikan sepertiga tinggi limas.' },
            { tier: 'Rumus', text: 'V = ⅓ × (sisi × sisi) × tinggi' },
            { tier: 'Langkah', text: 'Luas alas = 6 × 6 = 36 m². Volume = ⅓ × 36 × 10 = 12 × 10 = ?' }
          ],
          feedbackByOption: [
            '360 m³ itu luas alas dikali tinggi tanpa dikali faktor ⅓. Ingat limas meruncing ke atas!',
            '',
            '60 m³ terlalu kecil, periksa kembali perkalian ⅓ × 36 × 10.',
            '180 m³ itu dibagi 2, sedangkan rumus limas dikali sepertiga (⅓).'
          ]
        },
        {
          type: 'input',
          question: 'Sebuah balok beton pilar utama bangunan memiliki panjang <b>10 cm</b>, lebar <b>6 cm</b>, dan tinggi <b>4 cm</b>. Berapa luas permukaan seluruh pilar balok tersebut?',
          shape: 'cuboid',
          shapeParams: { p: 10, l: 6, t: 4, labels: { p: '10 cm', l: '6 cm', t: '4 cm' } },
          answer: 248,
          unit: 'cm²',
          hints: [
            { tier: 'Konsep', text: 'Balok memiliki 3 pasang sisi yang sama: depan-belakang, kiri-kanan, dan atas-bawah.' },
            { tier: 'Rumus', text: 'Luas Permukaan = 2 × (p·l + p·t + l·t)' },
            { tier: 'Langkah', text: 'pl = 60, pt = 40, lt = 24. Jumlahkan: 60 + 40 + 24 = 124. Lalu kalikan 2: 124 × 2 = ?' }
          ],
          feedbackWrong: () => 'Gunakan rumus Luas Permukaan Balok: 2 × (pl + pt + lt). Hitung ketiga perkalian sisi, jumlahkan, lalu kalikan dua!'
        }
      ],
      reflectionCard: {
        question: 'Apa esensi pembelajaran matematika yang paling bermakna setelah menyelesaikan seluruh 5 Dunia Arsitektur Bangunan?',
        options: [
          { text: 'Mampu mengingat seluruh rumus bangun datar dan ruang di luar kepala agar mendapatkan nilai ujian matematika yang paling sempurna', correct: false },
          { text: 'Mampu menyelesaikan soal-soal matematika rumit secara kilat tanpa perlu menggambar atau membayangkan bentuk bangun ruangnya', correct: false },
          { text: 'Mampu memahami konsep spasial dan menerapkan logika geometri dalam memecahkan persoalan perancangan dunia nyata secara kreatif', correct: true }
        ],
        conclusion: 'Selamat Master Arsitek! Kamu telah membuktikan bahwa matematika bukan sekadar rumus di buku, melainkan bahasa universal para arsitek dan insinyur untuk merancang mahakarya bangunan yang kokoh dan indah! 🏆🎉🏢'
      }
    }
  ];

  /* --- Materi Rumus (Pelajari Rumus) --- */
  const formulas = [
    {
      title: 'Persegi',
      items: [
        { label: 'Luas', formula: 'L = s × s = s²' },
        { label: 'Keliling', formula: 'K = 4 × s' }
      ],
      note: 's = panjang sisi'
    },
    {
      title: 'Persegi Panjang',
      items: [
        { label: 'Luas', formula: 'L = p × l' },
        { label: 'Keliling', formula: 'K = 2 × (p + l)' }
      ],
      note: 'p = panjang, l = lebar'
    },
    {
      title: 'Segitiga',
      items: [
        { label: 'Luas', formula: 'L = ½ × a × t' }
      ],
      note: 'a = alas, t = tinggi'
    },
    {
      title: 'Trapesium',
      items: [
        { label: 'Luas', formula: 'L = ½ × (a + b) × t' }
      ],
      note: 'a, b = sisi sejajar, t = tinggi'
    },
    {
      title: 'Jajargenjang',
      items: [
        { label: 'Luas', formula: 'L = a × t' }
      ],
      note: 'a = alas, t = tinggi'
    },
    {
      title: 'Belah Ketupat',
      items: [
        { label: 'Luas', formula: 'L = ½ × d₁ × d₂' }
      ],
      note: 'd₁, d₂ = panjang diagonal'
    },
    {
      title: 'Layang-layang',
      items: [
        { label: 'Luas', formula: 'L = ½ × d₁ × d₂' }
      ],
      note: 'd₁, d₂ = panjang diagonal'
    },
    {
      title: 'Teorema Pythagoras',
      items: [
        { label: 'Rumus', formula: 'a² + b² = c²' },
        { label: 'Cari sisi miring', formula: 'c = √(a² + b²)' },
        { label: 'Cari sisi tegak', formula: 'a = √(c² - b²)' }
      ],
      note: 'Berlaku untuk segitiga siku-siku. c = hipotenusa (sisi miring), a dan b = sisi siku-siku.'
    },
    {
      title: 'Lingkaran',
      items: [
        { label: 'Keliling', formula: 'K = 2 × π × r = π × d' },
        { label: 'Luas', formula: 'L = π × r²' }
      ],
      note: 'r = jari-jari, d = diameter = 2r, π ≈ 22/7 atau 3,14'
    },
    {
      title: 'Kubus',
      items: [
        { label: 'Volume', formula: 'V = s³' },
        { label: 'Luas Permukaan', formula: 'LP = 6 × s²' }
      ],
      note: 's = panjang rusuk'
    },
    {
      title: 'Balok',
      items: [
        { label: 'Volume', formula: 'V = p × l × t' },
        { label: 'Luas Permukaan', formula: 'LP = 2(pl + pt + lt)' }
      ],
      note: 'p = panjang, l = lebar, t = tinggi'
    },
    {
      title: 'Prisma Segitiga',
      items: [
        { label: 'Volume', formula: 'V = Luas alas × panjang' },
        { label: 'Luas alas segitiga', formula: 'La = ½ × a × t' }
      ],
      note: 'a = alas segitiga, t = tinggi segitiga, panjang = panjang prisma'
    },
    {
      title: 'Limas',
      items: [
        { label: 'Volume', formula: 'V = ⅓ × Luas alas × tinggi' }
      ],
      note: 'Luas alas bergantung bentuk alasnya (persegi, segitiga, dll.)'
    }
  ];

  return { worldStories, levels, formulas };
})();
