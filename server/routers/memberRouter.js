import { Router } from "express";

const router = Router();

import {
  findUserByUsername,
  updateUserAddress,
} from "../db/mongoDb.js";


import { createUserResponse } from "../dto/userResponse.js";

import { purify } from "../util/DOMpurify.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

// maybe use session instead of path variable..?
router.get("/api/member/getMember/", isAuthenticated, async (req, res) => {
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
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/member/updateAddress", isAuthenticated, async (req, res) => {
  try {
    const { username, address } = req.body;

    const purifiedAddress = {
      streetname: purify(address.streetname),
      cityname: purify(address.cityname),
      zipcode: purify(address.zipcode),
    };
    // updates address of users in db
    const success = await updateUserAddress(username, purifiedAddress);
    if (success) {
      res.status(200).json({ message: "Address succesfully updated." });
    } else {
      console.log("error in db");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
