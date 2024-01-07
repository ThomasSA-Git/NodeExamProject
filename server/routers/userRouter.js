import { Router } from "express";

const router = Router();

import {
  findUserByUsername,
} from "../db/usersDb.js";


import { createUserResponse } from "../dto/userResponse.js";

import { purify } from "../util/DOMpurify.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

router.get("/api/members", isAuthenticated, async (req, res) => {
  try {
    // finduser in db
    const username = req.session.user.username;
    const user = await findUserByUsername(username);

    if (user) {
      // create dto for response
      const userResponse = createUserResponse(user);
      res.status(200).json({ user: userResponse });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
