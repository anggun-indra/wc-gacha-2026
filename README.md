# Prediksi Piala Dunia & Gacha Tim

Aplikasi Web Prediksi Piala Dunia 2026 dan Gacha Pembagian Tim dengan sistem pendaftaran terbatas (maksimal 8 pemain).

## Fitur Utama

- **Pendaftaran Skuad & Gacha**: Membagi 48 tim negara peserta secara acak dan adil di antara 8 pemain. Setiap pemain menerima tepat 6 negara (1 Favorit, 1 Kuda Hitam, 1 Menengah Atas, 1 Menengah, 1 Underdog Kompetitif, 1 Underdog Berat).
- **Simulasi Hasil Pertandingan (RNG)**: Menyimulasikan pertandingan harian secara otomatis berdasarkan probabilitas bobot tier kekuatan masing-masing negara peserta.
- **Pembaruan Hasil Manual**: Panel admin / manager untuk memasukkan hasil skor secara manual guna memperbarui poin klasemen dan probabilitas juara secara real-time.
- **Database Terintegrasi**: Menggunakan Firebase Firestore dengan Firestore Transactions untuk menjamin keadilan pembagian tanpa duplikasi data secara real-time.

## Panduan Menjalankan Proyek

### Prasyarat
- Node.js (versi 20 ke atas direkomendasikan)

### Langkah Menjalankan Lokal
1. Pasang dependensi proyek:
   ```bash
   npm install
   ```

2. Jalankan aplikasi di lingkungan lokal:
   ```bash
   npm run dev
   ```

## Panduan Deployment ke Firebase

Proyek ini dikonfigurasi untuk berjalan di Firebase Hosting (Static) dan Firebase Firestore.

1. Lakukan kompilasi aset frontend:
   ```bash
   npm run build
   ```

2. Deploy aturan Firestore dan Web Hosting:
   ```bash
   npx -y firebase-tools@latest deploy --project <PROJECT_ID>
   ```