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

import { Server } from "socket.io";
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

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

import userRouter from "./routers/userRouter.js";
app.use(userRouter);

import adminRouter from "./routers/adminRouter.js";
app.use(adminRouter);

import projectRouter from "./routers/projectRouter.js";
app.use(projectRouter);

import noteRouter from "./routers/noteRouter.js";
app.use(noteRouter);

import { sessionUser } from "./routers/authRouter.js";

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, async (err) => {
    const { projectId, username } = socket.handshake.query;

    try {
      // Access the session through the express-session API
      const session = socket.request.session;

      if (!session) {
        throw new Error("Session not available");
      }

      session.user = { username }; // Set the user information to session

      // Validate the user information as needed
      if (sessionUser === username) {
        return next();
      } else {
        return next(new Error("Unauthorized"));
      }
    } catch (error) {
      console.error("Error setting user in session:", error);
      return next(new Error("Unauthorized"));
    }
  });
io.use(wrap(sessionMiddleware));

import { findProjectByProjectId, updateKanban } from "./db/projectsDb.js";

import { purifyKanbanList } from "./util/DOMpurify.js";


io.on("connection", (socket) => {
  
  socket.on("save-kanban", async (data) => {


    const purifiedKanban = data.kanban.map(purifyKanbanList); 
    const result = await updateKanban(data.projectId, purifiedKanban);
    if(result.acknowledged && result.matchedCount){
      io.emit("save-success", { message: "Kanban saved successfully" })
    }
    else {
      io.emit("save-failure", { message: "Kanban save failed" })
    }
  });
    socket.on("load-kanban", async (data) => {
      try {
        const project = await findProjectByProjectId(data.projectId);
        
        io.emit("kanban-data", project.kanban);
      } catch (error) {
        console.error("Error loading kanban data", error);
        // Handle the error, emit an error event or something
      }
    });
  
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
