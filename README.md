# WARUNGKU - Warung Sembako Online Modern (PWA)

Platform web & Progressive Web App (PWA) modern untuk warung sembako dan toko kebutuhan harian lokal dengan pengantaran cepat, manajemen kurir, dan dashboard pemilik warung.

---

## 🚀 Panduan Online / Deploy ke GitHub Pages

Aplikasi ini telah dilengkapi dengan konfigurasi otomatis **GitHub Actions** (`.github/workflows/deploy.yml`).

### Langkah 1: Push Proyek ke Repository GitHub

1. Buat repository baru di akun GitHub Anda (misalnya dengan nama `warungku`).
2. Di terminal komputer Anda (di dalam folder proyek ini), jalankan perintah berikut:

```bash
# Inisialisasi Git jika belum
git init

# Tambahkan semua file
git add .

# Simpan perubahan
git commit -m "feat: inisialisasi aplikasi WARUNGKU dan GitHub Actions"

# Ubah nama branch utama menjadi main
git branch -M main

# Hubungkan dengan repository GitHub Anda (ganti USERNAME dan REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push ke GitHub
git push -u origin main
```

---

### Langkah 2: Aktifkan GitHub Pages

1. Buka repository Anda di browser: `https://github.com/USERNAME/REPO_NAME`
2. Klik tab **Settings** (Pengaturan) di bagian atas repository.
3. Di menu sebelah kiri, klik menu **Pages**.
4. Di bagian **Build and deployment**:
   - Ubah **Source** menjadi **GitHub Actions**.
5. Simpan pengaturan.

---

### Langkah 3: Selesai & Aplikasi Online!

- GitHub Actions akan otomatis mendeteksi push Anda, melakukan *build*, dan mempublikasikan aplikasi ke GitHub Pages.
- Anda dapat memantau prosesnya di tab **Actions** pada repository GitHub Anda.
- Setelah selesai (tanda centang hijau), URL website Anda akan muncul di halaman **Settings > Pages** dengan format:
  `https://USERNAME.github.io/REPO_NAME/`

---

## 🛠️ Pengembangan Lokal

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build

# Preview hasil build
npm run preview
```
