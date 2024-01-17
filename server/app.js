import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
// cors, can be set up with options for specific url.
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

import http from "http";
const server = http.createServer(app);

// enable security headers using Helmet middleware
import helmet from "helmet";
app.use(helmet());

// socket.io setup with initialization of server
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

import sockets from "./sockets/sockets.js";
sockets(io);

import session from "express-session";

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 60 * 60 * 1000, // expires after an hour
  },
});

app.use(sessionMiddleware);

// middleware to parse incoming JSON requests
app.use(express.json());

// middleware to handle ratelimiting
import rateLimit from "express-rate-limit";

const allRoutesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(allRoutesRateLimiter);

// Rate limiter specific for login. Overrides the above for the specific path as set below.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Router import
import authRouter from "./routers/authRouter.js";
app.use(authRouter);
app.use("/auth", authRateLimiter);

import projectRouter from "./routers/projectRouter.js";
app.use(projectRouter);

import noteRouter from "./routers/noteRouter.js";
app.use(noteRouter);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
