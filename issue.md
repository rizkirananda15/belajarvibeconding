# Feature Implementation Plan: Registrasi User Baru (API & Service Layer)

## 📌 Ringkasan Tugas (Overview)
Dokumen ini merupakan panduan implementasi langkah demi langkah untuk menambahkan fitur registrasi pengguna baru (`User Registration`). Panduan ini dirancang dengan instruksi yang terperinci dan spesifik agar mudah diikuti oleh programmer junior maupun model AI.

---

## 🎯 Spesifikasi Kebutuhan

### 1. Database: Tabel `users`
Tabel `users` harus diperbarui/disesuaikan pada file schema Drizzle (`src/db/schema.ts`) dengan struktur kolom berikut:

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `int` (serial) | Primary Key, Auto Increment |
| `name` | `varchar(255)` | Not Null |
| `email` | `varchar(255)` | Not Null, Unique |
| `password` | `varchar(255)` | Not Null, berisi string hash dari algoritma bcrypt |
| `created_at` | `timestamp` | Not Null, Default `CURRENT_TIMESTAMP` |

### 2. Endpoint API Registrasi
- **URL Endpoint:** `POST /api/users`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "name": "RIZKI",
  "email": "rizki@gmail.com",
  "password": "rahasia"
}
```

#### Response Body (Sukses - Status HTTP 200 / 201)
```json
{
  "data": "OK"
}
```

#### Response Body (Gagal/Email Duplikat - Status HTTP 400)
Jika email sudah terdaftar di database:
```json
{
  "data": "Email sudah terdaftar"
}
```

---

## 📁 Struktur Direktori & Konvensi File

Struktur folder di dalam `src/` harus memisahkan antara layer routing dan layer business logic:

```
src/
├── db/
│   ├── index.ts              # Inisialisasi koneksi Drizzle & MySQL
│   └── schema.ts             # Definisi skema tabel database
├── routes/
│   └── users-routes.ts       # Definisi endpoint API & validasi request (ElysiaJS)
├── services/
│   └── users-services.ts     # Business logic (cek email, hash password, query DB)
└── index.ts                  # Entry point aplikasi (mounting router)
```

> **Aturan Penamaan File:**
> - File routing berada di folder `src/routes/` menggunakan format akhiran `-routes.ts` (contoh: `users-routes.ts`).
> - File service berada di folder `src/services/` menggunakan format akhiran `-services.ts` (contoh: `users-services.ts`).

---

## 🛠️ Langkah-Langkah Implementasi (Step-by-Step)

### Tahap 1: Memperbarui Skema Database & Migrasi
1. Buka file `src/db/schema.ts`.
2. Pastikan tabel `users` memiliki kolom:
   - `id`: `serial("id").primaryKey()`
   - `name`: `varchar("name", { length: 255 }).notNull()`
   - `email`: `varchar("email", { length: 255 }).notNull().unique()`
   - `password`: `varchar("password", { length: 255 }).notNull()`
   - `createdAt`: `timestamp("created_at").defaultNow().notNull()`
3. Jalankan perintah migrasi Drizzle untuk membuat file migrasi SQL baru:
   ```bash
   bun run db:generate
   ```
4. Jalankan push skema ke database MySQL:
   ```bash
   bun run db:push
   ```

---

### Tahap 2: Implementasi Hashing Password
Karena runtime yang digunakan adalah Bun, gunakan fitur bawaan Bun yang sangat cepat dan aman untuk bcrypt, atau package `bcryptjs`:
- **Rekomendasi (Built-in Bun):**
  ```ts
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
  ```
- *Alternatif:* Menggunakan `bun add bcryptjs` dan `import bcrypt from "bcryptjs"`.

---

### Tahap 3: Membuat Service Layer (`src/services/users-services.ts`)
1. Buat file baru di `src/services/users-services.ts`.
2. Buat fungsi registrasi (misal `registerUser(name, email, password)`).
3. Logika bisnis yang harus dijalankan:
   - **Langkah A:** Query tabel `users` untuk mengecek apakah `email` yang dikirim sudah ada di database.
   - **Langkah B:** Jika email **sudah ada**, lempar error (throw error) atau kembalikan status error dengan pesan `"Email sudah terdaftar"`.
   - **Langkah C:** Jika email **belum ada**, lakukan hash pada string `password` menggunakan bcrypt.
   - **Langkah D:** Insert data baru (`name`, `email`, `password` yang sudah di-hash) ke dalam tabel `users`.
   - **Langkah E:** Kembalikan nilai `{ data: "OK" }`.

---

### Tahap 4: Membuat Routing Layer (`src/routes/users-routes.ts`)
1. Buat file baru di `src/routes/users-routes.ts`.
2. Gunakan instance Elysia dengan prefix `/api/users`:
   ```ts
   import { Elysia, t } from "elysia";
   import { registerUser } from "../services/users-services";

   export const usersRoutes = new Elysia({ prefix: "/api/users" })
     .post("/", async ({ body, set }) => {
       try {
         const result = await registerUser(body.name, body.email, body.password);
         set.status = 200; // atau 201
         return result;
       } catch (error: any) {
         set.status = 400;
         return {
           data: error.message || "Gagal melakukan registrasi"
         };
       }
     }, {
       body: t.Object({
         name: t.String({ minLength: 1 }),
         email: t.String({ format: "email" }),
         password: t.String({ minLength: 1 })
       })
     });
   ```
3. Pastikan format response selalu konsisten dengan spesifikasi:
   - Sukses: `{ "data": "OK" }`
   - Error: `{ "data": "Email sudah terdaftar" }`

---

### Tahap 5: Mendaftarkan Route ke Aplikasi Utama (`src/index.ts`)
1. Buka file `src/index.ts`.
2. Import `usersRoutes` dari `./routes/users-routes`.
3. Daftarkan router menggunakan `.use(usersRoutes)`.
4. Jika ada file routing lama (`src/routes/users.ts`), sesuaikan atau hapus agar tidak terjadi konflik path.

---

### Tahap 6: Pengujian & Kriteria Keberhasilan (Acceptance Criteria)

Jalankan server dengan:
```bash
bun run dev
```

Lakukan pengujian berikut (menggunakan Postman, Thunder Client, atau `curl`):

1. **Test 1: Registrasi User Baru (Harus Sukses)**
   - Jalankan request:
     ```bash
     curl -X POST http://localhost:3000/api/users \
       -H "Content-Type: application/json" \
       -d '{"name": "RIZKI", "email": "rizki@gmail.com", "password": "rahasia"}'
     ```
   - **Ekspektasi Output:**
     - Status HTTP: `200` atau `201`
     - Response: `{"data": "OK"}`
     - Di database MySQL, kolom `password` harus tersimpan dalam format hash bcrypt (contoh: `$2b$10$...`), **BUKAN** plain text `"rahasia"`.

2. **Test 2: Registrasi dengan Email yang Sama (Harus Ditolak)**
   - Jalankan request yang sama untuk kedua kalinya.
   - **Ekspektasi Output:**
     - Status HTTP: `400`
     - Response: `{"data": "Email sudah terdaftar"}`

3. **Test 3: Validasi Body Request (Input Tidak Lengkap)**
   - Jalankan request tanpa email atau password.
   - **Ekspektasi Output:**
     - Validasi bawaan Elysia otomatis mengembalikan error status 400/422 karena payload tidak sesuai skema.
