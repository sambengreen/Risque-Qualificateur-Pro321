import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
      fullName: string;
      email: string | null;
      phone: string | null;
      region: string | null;
      isActive: boolean;
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "satis-conseils-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Identifiant ou mot de passe incorrect" });
        }
        if (!user.isActive) {
          return done(null, false, { message: "Ce compte est desactive" });
        }
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Identifiant ou mot de passe incorrect" });
        }
        return done(null, {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          region: user.region,
          isActive: user.isActive,
        });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user || !user.isActive) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        region: user.region,
        isActive: user.isActive,
      });
    } catch (err) {
      done(err);
    }
  });
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Non authentifie" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Acces reserve aux administrateurs" });
}
