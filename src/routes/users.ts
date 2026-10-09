import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async ({ set }) => {
    try {
      const allUsers = await db.select().from(users);
      return {
        success: true,
        data: allUsers,
      };
    } catch (error: any) {
      set.status = 500;
      return {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      };
    }
  })
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(id)))
          .limit(1);

        if (!user) {
          set.status = 404;
          return {
            success: false,
            message: `User with id ${id} not found`,
          };
        }

        return {
          success: true,
          data: user,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to fetch user",
          error: error.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { name, email } = body;
        const [result] = await db.insert(users).values({ name, email });

        set.status = 201;
        return {
          success: true,
          message: "User created successfully",
          data: {
            id: result.insertId,
            name,
            email,
          },
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to create user",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const [result] = await db
          .delete(users)
          .where(eq(users.id, Number(id)));

        if (result.affectedRows === 0) {
          set.status = 404;
          return {
            success: false,
            message: `User with id ${id} not found`,
          };
        }

        return {
          success: true,
          message: `User with id ${id} deleted successfully`,
        };
      } catch (error: any) {
        set.status = 500;
        return {
          success: false,
          message: "Failed to delete user",
          error: error.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    }
  );
