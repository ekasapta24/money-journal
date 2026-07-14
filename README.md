# Money Journal

Aplikasi pencatatan keuangan yang membantu pengguna tidak hanya mencatat transaksi, tetapi juga memahami kebiasaan dan alasan di balik keputusan finansialnya, lewat jurnal, tag, dan review pembelian.

## Stack teknologi

- Frontend: React
- Backend: Node.js + Express
- Database: MySQL (XAMPP)
- Cloud storage: Amazon S3 (development pakai LocalStack)
- Compute: EC2 (menjalankan cron job reminder review)

## Struktur folder

```
money-journal/
├── backend/          Express API
│   └── src/
│       ├── config/       koneksi DB & S3
│       ├── routes/       endpoint API
│       ├── middleware/   auth JWT
│       └── jobs/         cron job (peran EC2)
├── frontend/         React app
├── database/
│   └── schema.sql    struktur tabel
├── docker-compose.yml    LocalStack S3 untuk development
└── scripts/          helper script
```

## Setup development (lokal, gratis, tanpa akun AWS)

### 1. Database
Jalankan XAMPP, aktifkan MySQL, lalu import schema:
```bash
mysql -u root -p < database/schema.sql
```

### 2. LocalStack (simulasi S3)
Pastikan Docker Desktop jalan, lalu:
```bash
docker-compose up -d
bash scripts/setup-localstack.sh
```

### 3. Backend
```bash
cd backend
cp .env.example .env
# edit .env sesuai kredensial MySQL kamu
npm install
npm run dev
```
API akan jalan di `http://localhost:5000`.

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Setup production (submit/demo ke dosen)

1. Buat akun AWS Educate atau AWS Free Tier
2. Buat bucket S3 asli, catat nama bucket dan region
3. Launch instance EC2 (t2.micro), deploy folder `backend/` ke sana
4. Update `.env`:
   - `NODE_ENV=production`
   - Hapus/kosongkan `AWS_S3_ENDPOINT`
   - Isi `AWS_ACCESS_KEY_ID` dan `AWS_SECRET_ACCESS_KEY` dengan kredensial IAM asli
   - Isi `AWS_S3_BUCKET` dengan nama bucket asli

Tidak ada perubahan kode yang diperlukan — cukup ganti environment variables, karena konfigurasi S3 di `src/config/s3.js` sudah dirancang otomatis beralih antara LocalStack dan AWS asli.

## Peran AWS dalam aplikasi ini

- **S3**: menyimpan foto struk/bukti transaksi yang diupload user saat mencatat transaksi
- **EC2**: menjalankan backend API, sekaligus menjalankan cron job harian (`src/jobs/reviewReminder.job.js`) yang mengecek transaksi mana yang sudah waktunya direview (30 hari setelah tanggal transaksi)

## Status pengerjaan

- [x] Struktur project & scaffold backend
- [x] Skema database
- [x] Endpoint API inti (auth, transaksi, tag, review, goal, recap) — sudah teruji jalan
- [x] Frontend React — Login, Register, Dashboard (terhubung ke backend)
- [ ] Halaman Timeline, Tambah Transaksi, Review, Goals, Insight, Profile
- [ ] Integrasi upload struk end-to-end
- [ ] Testing
- [ ] Manual penggunaan aplikasi (PDF)

## Menjalankan frontend

```bash
cd frontend
npm install
npm run dev
```
Buka `http://localhost:3000` di browser. Pastikan backend (`http://localhost:5000`) sudah jalan duluan.
