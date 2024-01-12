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



import helmet from "helmet";
app.use(helmet());

import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

import sockets from './sockets/sockets.js';
sockets(io);

import session from "express-session";

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});

app.use(sessionMiddleware);

app.use(express.json());

import rateLimit from "express-rate-limit";

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

import projectRouter from "./routers/projectRouter.js";
app.use(projectRouter);

import noteRouter from "./routers/noteRouter.js";
app.use(noteRouter);


const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
