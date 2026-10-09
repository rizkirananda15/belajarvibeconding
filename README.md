# Belajar Vibe Coding

Backend project built with **Bun**, **ElysiaJS**, **Drizzle ORM**, and **MySQL**.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database Driver:** `mysql2`
- **Database:** MySQL

## Getting Started

### 1. Prerequisites

- Make sure [Bun](https://bun.sh/) is installed.
- Ensure MySQL server is running (e.g. MySQL 8.0, XAMPP, Laragon, or Docker).

### 2. Environment Variables

Copy `.env.example` to `.env` and adjust your MySQL credentials:

```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=belajarvibecoding
```

### 3. Database Migration & Schema

- **Generate migrations:**
  ```bash
  bun run db:generate
  ```

- **Push schema directly to database:**
  ```bash
  bun run db:push
  ```

- **Apply migrations:**
  ```bash
  bun run db:migrate
  ```

- **Open Drizzle Studio (Database GUI):**
  ```bash
  bun run db:studio
  ```

### 4. Running the Application

- **Development mode (with hot reload):**
  ```bash
  bun run dev
  ```

- **Production mode:**
  ```bash
  bun run start
  ```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check & welcome message |
| `GET` | `/health` | Server uptime status |
| `GET` | `/users` | Get list of all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create new user (`{ name, email }`) |
| `DELETE` | `/users/:id` | Delete user by ID |
