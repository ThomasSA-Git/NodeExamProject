import dotenv from "dotenv";

dotenv.config();

import e, { Router } from "express";

const router = Router();

import { hashPassword, comparePasswords } from "../util/bcrypt.js";

// Mongo db imports
import {
  createUser,
  findUserByUsername,
  updateUserPassword,
} from "../db/usersDb.js";

import {
  deleteUserTokenByUsername,
  findUserInResetPassword,
  addToResetPassword,
} from "../db/tokenDb.js";

import { generateToken } from "../util/tokenGenerator.js";

import {
  registerMailSubject,
  registerMailMessage,
  sendFakeEmail,
  passwordResetSubject,
  passwordResetMessage,
} from "../nodemailer/nodemailer.js";

import { purify } from "../util/DOMpurify.js";

router.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user in database
  const user = await findUserByUsername(username);

  if (user) {
    // Cmpare the provided password with the hashed password in the database
    const match = await comparePasswords(password, user.password);

    if (match) {
      // Store user information in the session
      req.session.user = user;
      console.log("Login succesful.");
      // Send username and role to use for auth clientside.
      res.json({
        username: req.session.user.username,
        role: req.session.user.role,
      });
    } else {
      // Send a 401 status for incorrect password
      res.status(401).json({ error: "Invalid password." });
    }
  } else {
    // Send a 401 status for invalid username
    res.status(401).json({ error: "Invalid username." });
  }
});

router.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(email)
  // purify relevant input
  const purifiedUsername = purify(username);
  const purifiedEmail = purify(email);
  // Hash the password
  const hashedPassword = await hashPassword(password);

  // check if username exists
  const userExists = await findUserByUsername(username);

  if (userExists) {
    console.log("Username is taken.");
    res.status(401).json({ error: "Username is taken" });
  } else {
    // Create user in mongodb
    createUser(purifiedUsername, purifiedEmail, hashedPassword);

    // Send mail confirming registration
    const mailMessage = registerMailMessage(username);
    sendFakeEmail(email, registerMailSubject, mailMessage);

    res.json({ message: "Registration successful. Redirecting to login." });
  }
});

router.get("/api/auth/logout", (req, res) => {
  // delete session
  delete req.session.user;
  // maybe delete below, not necessary
  res.send({ data: "You're logged out." });
});

router.post("/api/auth/getSecretToken", async (req, res) => {
  try {
    const username = req.body.username;
    const userExists = await findUserByUsername(username);

    // checks if user already has one active token
    const findExistingToken = await findUserInResetPassword(username);

    // deletes active token if it exists
    if (findExistingToken) {
      await deleteUserTokenByUsername(username);
    }

    // Generates new token and adds it to the db with username in seperate document with 30 min lifespan.
    if (userExists) {
      const token = generateToken();
      await addToResetPassword(username, token);
      console.log(userExists)
      const message = passwordResetMessage(username, token);
      sendFakeEmail(userExists.email, passwordResetSubject, message);

      res
        .status(200)
        .json({ message: "Password reset token sent successfully." });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/api/auth/resetPassword", async (req, res) => {
  try {
    const { username, secretToken, newPassword } = req.body;

    // check if token with username is stoed in db
    const match = await findUserInResetPassword(username);

    if (match && secretToken === match.secretToken) {
      // hash new password, update it and delete the token used for it
      const hashedNewPassword = await hashPassword(newPassword);
      //update password for user
      await updateUserPassword(username, hashedNewPassword);
      // deletes token used for update of password
      await deleteUserTokenByUsername(username);
      res.status(200).json({ message: "Password reset successful." });
    } else {
      res.status(401).json({ error: "Invalid token or username." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
