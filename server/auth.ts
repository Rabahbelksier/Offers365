import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";
import { db } from "./db";
import { users, insertUserSchema, loginSchema } from "@shared/schema";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateUserId(): string {
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += Math.floor(Math.random() * 10).toString();
  }
  return id;
}

async function isUserIdUnique(id: string): Promise<boolean> {
  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return existing.length === 0;
}

async function generateUniqueUserId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const id = generateUserId();
    if (await isUserIdUnique(id)) {
      return id;
    }
    attempts++;
  }

  throw new Error("Failed to generate unique user ID");
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: validation.error.errors[0]?.message || "Invalid input",
        });
      }

      const { firstName, lastName, email, birthDate, password } = validation.data;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      const userId = await generateUniqueUserId();
      const hashedPassword = hashPassword(password);

      const [newUser] = await db
        .insert(users)
        .values({
          id: userId,
          firstName,
          lastName,
          email: email.toLowerCase(),
          birthDate,
          password: hashedPassword,
        })
        .returning();

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: validation.error.errors[0]?.message || "Invalid input",
        });
      }

      const { emailOrUsername, password } = validation.data;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, emailOrUsername.toLowerCase()))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const hashedPassword = hashPassword(password);
      if (user[0].password !== hashedPassword) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      return res.json({
        message: "Login successful",
        user: {
          id: user[0].id,
          firstName: user[0].firstName,
          lastName: user[0].lastName,
          email: user[0].email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  });
}
