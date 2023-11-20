import dotenv from "dotenv";

dotenv.config();

import express from "express";

const app = express();

import cors from "cors";

// cors, can be set up with options for specific url.
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

import rateLimit from "express-rate-limit";

app.use(express.json());

import session from "express-session";

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //wont resave if there aren't any changes in session. Should be false.
    saveUninitialized: true, //if there isnt any session, should there be saved if client calls backed
    cookie: { secure: false }, //true if running on https. Should be set to true when deployed
  })
);

const allRoutesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(allRoutesRateLimiter);

// Rate limiter specific for login. Overrides the above for the specific path as set below.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Router import
import authRouter from "./routers/authRouter.js";
app.use(authRouter);
app.use("/auth", authRateLimiter);

import contactRouter from "./routers/concactRouter.js";
app.use(contactRouter);

import memberRouter from "./routers/MemberRouter.js";
app.use(memberRouter);

import adminRouter from "./routers/adminRouter.js";
app.use(adminRouter);

// Used for creating an admin user on start up. Only for making it easier.
// If deployed it wouldnt be added here, and password would be set beforehand
// in .env.
import { createAdminUser, findUserByUsername } from "./db/mongoDb.js";
import { hashPassword } from "./util/bcrypt.js";
if (!findUserByUsername("admin")) {
  const adminPassword = hashPassword("admin")
  await createAdminUser(adminPassword);
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log("Running on port:", PORT));
