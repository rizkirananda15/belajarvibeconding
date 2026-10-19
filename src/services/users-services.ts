import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

/**
 * Mendaftarkan user baru ke dalam database.
 * - Mengecek duplikasi email sebelum insert.
 * - Melakukan hash password menggunakan bcrypt bawaan Bun.
 * @param name - Nama pengguna
 * @param email - Email pengguna (harus unik)
 * @param password - Password plain-text yang akan di-hash
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ data: string }> {
  // Langkah A: Cek apakah email sudah terdaftar
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Langkah B: Jika email sudah ada, lempar error
  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // Langkah C: Hash password menggunakan bcrypt bawaan Bun
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Langkah D: Insert user baru ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // Langkah E: Kembalikan response sukses
  return { data: "OK" };
}
