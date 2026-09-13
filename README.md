# WARUNGKU - Warung Sembako Online Modern (PWA)

Platform web & Progressive Web App (PWA) modern untuk warung sembako dan toko kebutuhan harian lokal dengan pengantaran cepat, manajemen kurir, dan dashboard pemilik warung.

---

## 🚀 Panduan Online / Deploy ke GitHub Pages (Khusus Repository: warungku_monapa)

Aplikasi ini telah dikonfigurasi khusus untuk repository **`warungku_monapa`** (`https://perdinanmoses34-hub.github.io/warungku_monapa/`) dan dilengkapi alur otomatis **GitHub Actions** (`.github/workflows/deploy.yml`).

### ⚠️ Mengapa Sebelumnya Layar Blank Putih?
Layar blank putih terjadi karena pada menu **Settings > Pages** di GitHub, opsi **Source** masih disetel ke **"Deploy from a branch"** (folder root `/`). Akibatnya GitHub menyajikan kode mentah TypeScript (`/src/main.tsx`) yang belum di-*compile*, sehingga browser tidak bisa menjalankannya.

Untuk mengatasinya, ikuti langkah mudah berikut:

---

### Langkah 1: Ubah Pengaturan GitHub Pages ke "GitHub Actions"

1. Buka repository Anda di browser:  
   👉 `https://github.com/perdinanmoses34-hub/warungku_monapa`
2. Klik tab **Settings** (Pengaturan) di bar menu atas.
3. Di bilah samping kiri, klik **Pages**.
4. Di bagian **Build and deployment**:
   - Ganti dropdown **Source** dari *"Deploy from a branch"* menjadi **"GitHub Actions"**.
5. Simpan pengaturan.

---

### Langkah 2: Push Pembaruan Kode ke GitHub

Di komputer/terminal Anda pada folder proyek ini, jalankan perintah:

```bash
# Tambahkan berkas yang telah diperbaiki
git add .

# Simpan perubahan commit
git commit -m "fix: atur base path warungku_monapa dan perbaiki github actions"

# Push ke GitHub
git push origin main
```

---

### Langkah 3: Pantau Proses Build & Buka Website

1. Buka tab **Actions** di repository Anda:  
   👉 `https://github.com/perdinanmoses34-hub/warungku_monapa/actions`
2. Anda akan melihat workflow **Deploy WARUNGKU to GitHub Pages** berjalan otomatis.
3. Setelah ada tanda centang hijau (selesai ~1 menit), buka kembali link Anda:  
   👉 **https://perdinanmoses34-hub.github.io/warungku_monapa/**
4. Aplikasi WARUNGKU akan langsung tampil normal, responsif, dan siap digunakan!

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
