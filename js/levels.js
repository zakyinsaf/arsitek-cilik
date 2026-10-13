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
      story: 'Selamat datang, Arsitek Muda! Desa Lhokseumawe membutuhkan bantuanmu. Rumoh-rumoh panggung tua perlu fondasi baru. Gunakan ilmu geometrimu untuk mengukur dan membangun fondasi yang kokoh!'
    },
    {
      title: 'Dunia 2: Rangka & Atap',
      icon: '🏠',
      subtitle: 'Luas Bangun Datar Lanjutan',
      color: '#E8A838',
      story: 'Hebat! Fondasi sudah kokoh. Sekarang saatnya membangun rangka dan atap rumoh panggung. Atap Aceh punya bentuk unik—trapesium, jajargenjang, bahkan belah ketupat. Ayo hitung dengan teliti!'
    },
    {
      title: 'Dunia 3: Jembatan & Tangga',
      icon: '🌉',
      subtitle: 'Teorema Pythagoras',
      color: '#D94F3B',
      story: 'Luar biasa! Rumoh panggung hampir selesai. Tantangan terakhir: membangun jembatan penghubung dan tangga. Di sinilah kamu butuh kekuatan Teorema Pythagoras! Ingat: dalam segitiga siku-siku, a² + b² = c².'
    },
    {
      title: 'Dunia 4: Taman & Kolam',
      icon: '🌺',
      subtitle: 'Lingkaran & Busur',
      color: '#9B59B6',
      story: 'Rumoh panggung sudah berdiri megah! Sekarang, mari kita percantik halaman dengan taman melingkar dan kolam air mancur. Kamu perlu menguasai rumus lingkaran untuk merancang taman impian desa!'
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
        'Rumus: Luas persegi = s × s = s²',
        'Substitusi: s² = 36 → s = √36. Berapa √36?'
      ],
      feedbackWrong: (val) => `Ingat: Luas persegi = s × s. Jika s = ${val}, maka luasnya = ${val} × ${val} = ${val * val}, bukan 36.`
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
      question: 'Sebuah fondasi rumoh panggung berbentuk persegi panjang dengan panjang <b>12 m</b> dan lebar <b>8 m</b>. Berapa luas fondasi tersebut?',
      shape: 'rectangle',
      shapeParams: { width: 12, height: 8, labels: { p: '12 m', l: '8 m' } },
      answer: 96,
      unit: 'm²',
      hints: [
        'Rumus: Luas persegi panjang = panjang × lebar',
        'Substitusi angka yang diketahui ke dalam rumus: L = 12 × 8 = ?'
      ],
      feedbackWrong: () => 'Luas persegi panjang = p × l. Substitusi: L = 12 × 8. Coba hitung lagi!'
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
      question: 'Halaman rumoh panggung berbentuk persegi panjang berukuran panjang <b>15 m</b> dan lebar <b>10 m</b>. Pak Arsitek ingin memasang pagar keliling. Berapa meter pagar yang dibutuhkan?',
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
        'Rumus: Keliling persegi panjang = 2 × (panjang + lebar)',
        'Substitusi: K = 2 × (15 + 10). Hitung hasil penjumlahan dalam kurung dulu, lalu kalikan 2.'
      ],
      feedbackByOption: [
        '25 m itu baru p + l, belum dikali 2. Keliling = 2 × (p + l).',
        '',
        '150 itu luas (p × l), bukan keliling. Keliling = 2 × (p + l).',
        '30 itu 2 × p saja. Jangan lupa tambahkan lebarnya: 2 × (p + l).'
      ]
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
      question: 'Atap rumoh panggung berbentuk segitiga dengan alas <b>10 m</b>. Geser slider untuk mengatur tinggi segitiga sehingga luasnya tepat <b>30 m²</b>.',
      shape: 'triangle',
      shapeParams: { base: 10 },
      sliderConfig: { min: 1, max: 12, step: 1, unit: 'm' },
      targetLabel: 'Luas = 30 m²',
      answer: 6,
      answerCheck: (val) => 0.5 * 10 * val === 30,
      displayCalc: (val) => `${val} m`,
      hints: [
        'Rumus: Luas segitiga = ½ × alas × tinggi',
        'Substitusi: ½ × 10 × t = 30, sederhanakan menjadi 5 × t = 30. Berapa nilai t?'
      ],
      feedbackWrong: () => 'Luas belum mencapai target 30 m². Gunakan rumus Luas = ½ × alas × tinggi untuk mencari tinggi yang tepat!'
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
      ]
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
      question: 'Atap rumoh panggung berbentuk trapesium dengan sisi sejajar atas <b>6 m</b>, sisi sejajar bawah <b>10 m</b>, dan tinggi <b>4 m</b>. Berapa luas atap tersebut?',
      shape: 'trapezoid',
      shapeParams: { topSide: 6, bottomSide: 10, height: 4, labels: { a: '6 m', b: '10 m', t: '4 m' } },
      answer: 32,
      unit: 'm²',
      hints: [
        'Rumus: Luas trapesium = ½ × (sisi sejajar atas + sisi sejajar bawah) × tinggi',
        'Substitusi: L = ½ × (6 + 10) × 4. Jumlahkan dulu isi kurungnya, lalu kalikan!'
      ],
      feedbackWrong: () => 'Luas trapesium = ½ × (a + b) × t. Substitusi angkanya dan hitung!'
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
      question: 'Dinding samping rumoh berbentuk jajargenjang dengan alas <b>8 m</b>. Geser slider untuk mengatur tinggi agar luasnya tepat <b>40 m²</b>.',
      shape: 'parallelogram',
      shapeParams: { base: 8 },
      sliderConfig: { min: 1, max: 10, step: 1, unit: 'm' },
      targetLabel: 'Luas = 40 m²',
      answer: 5,
      answerCheck: (val) => 8 * val === 40,
      displayCalc: (val) => `${val} m`,
      hints: [
        'Rumus: Luas jajargenjang = alas × tinggi',
        'Substitusi: 8 × t = 40. Berapa nilai t agar persamaan ini benar?'
      ],
      feedbackWrong: () => 'Luas belum mencapai target 40 m². Gunakan rumus Luas = alas × tinggi untuk mencari tinggi yang tepat!'
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
      question: 'Jendela hias rumoh panggung berbentuk belah ketupat dengan diagonal <b>d₁ = 12 cm</b> dan <b>d₂ = 16 cm</b>. Berapa luasnya?',
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
        'Rumus: Luas belah ketupat = ½ × d₁ × d₂',
        'Substitusi: L = ½ × 12 × 16. Kalikan semua angkanya!'
      ],
      feedbackByOption: [
        '192 itu d₁ × d₂ tanpa dibagi 2. Jangan lupa: Luas = ½ × d₁ × d₂.',
        '',
        '48 itu ½ × d₁ × (d₂ ÷ 2). Gunakan kedua diagonal utuh: ½ × 12 × 16.',
        'Coba hitung lagi: ½ × 12 × 16.'
      ]
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
        'Rumus: Luas layang-layang = ½ × d₁ × d₂ (sama seperti belah ketupat)',
        'Substitusi: L = ½ × 14 × 20. Sederhanakan: ½ × 14 = 7, lalu kalikan 7 × 20.'
      ],
      feedbackWrong: () => 'Luas layang-layang = ½ × d₁ × d₂. Substitusi dan hitung!'
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
          question: 'Sebuah dinding rumoh terdiri dari persegi panjang (<b>6 m × 4 m</b>) dengan segitiga di atasnya (alas <b>6 m</b>, tinggi <b>3 m</b>). Berapa total luas dinding?',
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
          question: 'Lantai rumoh berbentuk persegi panjang <b>10 m × 8 m</b>. Di satu sisinya ada teras segitiga (alas <b>10 m</b>, tinggi <b>3 m</b>). Berapa luas total lantai dan teras?',
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
      ]
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
      question: 'Sebuah tangga rumoh panggung memiliki tinggi <b>3 m</b> dan jarak horizontal <b>4 m</b>. Berapa panjang tangga (sisi miring)?',
      shape: 'rightTriangle',
      shapeParams: { a: 3, b: 4, unknown: 'c', labels: { a: '3 m', b: '4 m', c: '?' } },
      answer: 5,
      unit: 'm',
      hints: [
        'Rumus Pythagoras: c² = a² + b² → c = √(a² + b²)',
        'Substitusi: c² = 3² + 4² = 9 + 16. Jumlahkan, lalu cari akar kuadratnya!'
      ],
      feedbackWrong: () => 'Gunakan Pythagoras: c² = a² + b². Substitusi dan hitung!'
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
      question: 'Tali penopang rumoh sepanjang <b>13 m</b> diikat dari puncak tiang ke tanah sejauh <b>5 m</b> dari kaki tiang. Berapa tinggi tiang?',
      shape: 'rightTriangle',
      shapeParams: { a: 12, b: 5, c: 13, unknown: 'a', labels: { a: '?', b: '5 m', c: '13 m' } },
      answer: 12,
      unit: 'm',
      hints: [
        'Rumus: Jika c diketahui, maka a² = c² - b² → a = √(c² - b²)',
        'Substitusi: a² = 13² - 5². Hitung 13² dan 5², kurangkan, lalu cari akarnya!'
      ],
      feedbackWrong: () => 'Gunakan: a² = c² - b². Substitusi dan hitung!'
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
        // Pemain mencocokkan persegi ke sisi: a²=9, b²=16, c²=25
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
        'Konsep: Luas persegi pada setiap sisi = sisi². Cocokkan persegi ke sisi yang sesuai.',
        'Ingat: Sisi a memiliki persegi a², sisi b memiliki persegi b². Cek apakah a² + b² = c².'
      ],
      feedbackWrong: () => 'Ingat: a² harus di sisi a, b² di sisi b, dan c² di sisi c (sisi miring).'
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
      question: 'Jembatan penghubung dua rumoh panggung berbentuk persegi panjang dengan panjang <b>8 m</b> dan lebar <b>6 m</b>. Untuk memasang kawat diagonal penguat, berapa panjang kawat yang dibutuhkan?',
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
      hints: [
        'Diagonal persegi panjang membentuk segitiga siku-siku. Gunakan rumus: d² = p² + l²',
        'Substitusi: d² = 8² + 6². Hitung kuadratnya, jumlahkan, lalu cari akar kuadrat!'
      ],
      feedbackByOption: [
        '14 m itu p + l. Diagonal bukan penjumlahan, tapi gunakan Pythagoras: d² = p² + l².',
        '',
        '48 itu luas persegi panjang (p × l), bukan diagonal.',
        'Coba hitung: d² = 8² + 6². Jumlahkan, lalu cari √ dari hasilnya.'
      ]
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
          question: 'Sebuah perahu layar Aceh memiliki tiang setinggi <b>9 m</b>. Tali dari puncak tiang ke ujung perahu sepanjang <b>15 m</b>. Berapa jarak horizontal dari kaki tiang ke ujung perahu?',
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
      ]
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
      question: 'Kolam air mancur di halaman rumoh berbentuk lingkaran dengan jari-jari <b>7 m</b>. Berapa keliling kolam tersebut? (Gunakan π = 22/7)',
      shape: 'circle',
      shapeParams: { r: 7, labels: { r: '7 m' } },
      answer: 44,
      unit: 'm',
      hints: [
        'Rumus: Keliling lingkaran = 2 × π × r',
        'Substitusi: K = 2 × (22/7) × 7. Perhatikan bahwa 7 di pembilang dan penyebut bisa disederhanakan!'
      ],
      feedbackWrong: () => 'Keliling = 2 × π × r. Substitusi π = 22/7 dan r = 7, lalu hitung!'
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
        'Rumus: Luas lingkaran = π × r²',
        'Substitusi: (22/7) × r² = 154. Bagi kedua ruas dengan 22/7, lalu cari akar kuadrat dari r².'
      ],
      feedbackWrong: () => 'Luas belum mencapai target 154 m². Gunakan rumus Luas = π × r² untuk mencari jari-jari yang tepat!'
    },

    // Level 4-3: Pagar Setengah Lingkaran (MCQ)
    {
      id: '4-3',
      world: 3,
      level: 2,
      title: 'Pagar Setengah Lingkaran',
      type: 'mcq',
      isBoss: false,
      learningGoal: 'Menghitung keliling setengah lingkaran',
      question: 'Teras rumoh berbentuk setengah lingkaran dengan diameter <b>14 m</b>. Berapa panjang pagar yang diperlukan untuk memagari tepi lengkung teras? (π = 22/7)',
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
        'Keliling setengah lingkaran = ½ × keliling lingkaran + diameter = ½ × π × d + d',
        'Substitusi: K = ½ × (22/7) × 14 + 14. Hitung bagian lengkung dulu, lalu tambahkan diameter!'
      ],
      feedbackByOption: [
        '22 m itu hanya bagian lengkungnya saja, belum ditambah diameter.',
        '',
        '44 m itu keliling lingkaran penuh, bukan setengah.',
        '154 m itu luas lingkaran, bukan keliling!'
      ]
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
        'Luas lingkaran dimulai dengan "L =" lalu diikuti oleh komponen: π, r, dan kuadrat.',
        'Urutan yang benar: L = π × r². Coba susun potongannya!'
      ],
      feedbackWrong: () => 'Ingat rumus luas lingkaran: L = π × r². Susun potongannya sesuai urutan!'
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
            'Jarak satu putaran = keliling lingkaran = π × d',
            'Substitusi: K = (22/7) × 28. Sederhanakan dan hitung!'
          ],
          feedbackWrong: () => 'Jarak = keliling = π × d. Substitusi dan hitung!'
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
            'Dari L = π × r², maka r² = L ÷ π',
            'r² = 616 ÷ (22/7) = 616 × 7/22. Hitung, lalu cari akar kuadratnya!'
          ],
          feedbackByOption: [
            'π × 7² = (22/7) × 49 = 154 ≠ 616. Coba lagi!',
            '',
            'π × 21² = (22/7) × 441 = 1386 ≠ 616. Terlalu besar!',
            'π × 28² = (22/7) × 784 = 2464 ≠ 616. Terlalu besar!'
          ]
        },
        {
          type: 'input',
          question: 'Sebuah taman berbentuk persegi dengan sisi <b>14 m</b> memiliki kolam lingkaran di tengahnya dengan jari-jari <b>7 m</b>. Berapa luas taman yang tersisa (bukan kolam)? (π = 22/7)',
          shape: 'none',
          answer: 42,
          unit: 'm²',
          hints: [
            'Luas tersisa = Luas persegi − Luas lingkaran',
            'Luas persegi = s². Luas lingkaran = π × r². Hitung masing-masing lalu kurangkan!'
          ],
          feedbackWrong: () => 'Luas tersisa = s² − π × r². Substitusi dan hitung!'
        }
      ]
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
      question: 'Gudang penyimpanan padi berbentuk balok dengan panjang <b>8 m</b>, lebar <b>5 m</b>, dan tinggi <b>3 m</b>. Berapa volume gudang?',
      shape: 'cuboid',
      shapeParams: { p: 8, l: 5, t: 3, labels: { p: '8 m', l: '5 m', t: '3 m' } },
      answer: 120,
      unit: 'm³',
      hints: [
        'Rumus: Volume balok = panjang × lebar × tinggi',
        'Substitusi: V = 8 × 5 × 3. Kalikan satu per satu!'
      ],
      feedbackWrong: () => 'Volume balok = p × l × t. Substitusi dan hitung!'
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
      question: 'Sebuah kotak penyimpanan berbentuk kubus dengan rusuk <b>4 m</b>. Berapa luas permukaan kubus tersebut?',
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
        'Rumus: Luas permukaan kubus = 6 × s² (karena kubus punya 6 sisi persegi)',
        'Substitusi: LP = 6 × 4². Hitung 4² dulu, lalu kalikan 6!'
      ],
      feedbackByOption: [
        '64 itu volume kubus (s³), bukan luas permukaan.',
        '',
        '24 itu keliling satu sisi × jumlah sisi? Gunakan rumus LP = 6 × s².',
        '16 itu luas satu sisi saja (s²). Kubus punya 6 sisi! LP = 6 × s².'
      ]
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
      question: 'Atap gudang berbentuk prisma segitiga. Alas segitiga <b>6 m</b>, tinggi segitiga <b>4 m</b>. Geser slider untuk mengatur panjang prisma agar volumenya <b>60 m³</b>.',
      shape: 'triangularPrism',
      shapeParams: { base: 6, height: 4 },
      sliderConfig: { min: 1, max: 15, step: 1, unit: 'm' },
      targetLabel: 'Volume = 60 m³',
      answer: 5,
      answerCheck: (val) => 0.5 * 6 * 4 * val === 60,
      displayCalc: (val) => `${val} m`,
      hints: [
        'Rumus: Volume prisma = Luas alas × panjang. Luas alas segitiga = ½ × a × t',
        'Hitung luas alas dulu: ½ × 6 × 4. Lalu: Luas alas × panjang = 60. Berapa panjangnya?'
      ],
      feedbackWrong: () => 'Volume belum mencapai target 60 m³. Gunakan rumus V = Luas alas × panjang untuk mencari panjang yang tepat!'
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
        'Volume limas dimulai dengan "V =" lalu ada faktor ⅓ dikali luas alas dikali tinggi.',
        'Urutan: V = ⅓ × Luas alas × tinggi. Susun potongannya!'
      ],
      feedbackWrong: () => 'Volume limas = ⅓ × Luas alas × tinggi. Coba susun lagi!'
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
          question: 'Sebuah bak air berbentuk kubus memiliki volume <b>125 liter</b> (125 dm³). Berapa panjang rusuk bak air tersebut?',
          shape: 'cube',
          shapeParams: { s: 5, labels: { v: 'V = 125' } },
          answer: 5,
          unit: 'dm',
          hints: [
            'Dari V = s³, maka s = ∛V (akar pangkat 3 dari volume)',
            's = ∛125. Cari bilangan yang jika dikuadratkan 3 kali hasilnya 125!'
          ],
          feedbackWrong: () => 'Volume kubus = s³. Maka s = ∛V. Cari ∛125!'
        },
        {
          type: 'mcq',
          question: 'Berapa volume limas segiempat dengan alas persegi sisi <b>6 cm</b> dan tinggi limas <b>10 cm</b>?',
          shape: 'pyramid',
          shapeParams: { base: 6, height: 10 },
          options: [
            { text: '360 cm³', value: 360 },
            { text: '120 cm³', value: 120 },
            { text: '60 cm³', value: 60 },
            { text: '180 cm³', value: 180 }
          ],
          answer: 120,
          correctIndex: 1,
          hints: [
            'Rumus: Volume limas = ⅓ × Luas alas × tinggi. Luas alas persegi = s².',
            'V = ⅓ × 6² × 10 = ⅓ × 36 × 10. Hitung!'
          ],
          feedbackByOption: [
            '360 itu Luas alas × tinggi tanpa dibagi 3. Volume limas = ⅓ × L.alas × t.',
            '',
            'Coba hitung lagi: ⅓ × 6² × 10.',
            'Coba hitung lagi: ⅓ × 6² × 10.'
          ]
        },
        {
          type: 'input',
          question: 'Sebuah balok memiliki panjang <b>10 cm</b>, lebar <b>6 cm</b>, dan tinggi <b>4 cm</b>. Berapa luas permukaan balok?',
          shape: 'cuboid',
          shapeParams: { p: 10, l: 6, t: 4, labels: { p: '10 cm', l: '6 cm', t: '4 cm' } },
          answer: 248,
          unit: 'cm²',
          hints: [
            'Rumus: LP balok = 2 × (pl + pt + lt)',
            'Substitusi: LP = 2 × (10×6 + 10×4 + 6×4). Hitung masing-masing perkalian, jumlahkan, lalu kalikan 2!'
          ],
          feedbackWrong: () => 'LP = 2 × (pl + pt + lt). Substitusi dan hitung!'
        }
      ]
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
