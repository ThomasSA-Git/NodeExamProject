import dotenv from "dotenv";

dotenv.config();
import { Router } from "express";
const router = Router();
import { hashPassword, comparePasswords } from "../util/bcrypt.js";
import { isAuthenticated } from "../middleware/authMiddleWare.js";

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
  sendEmail,
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
      
      res.status(200).send({
        username: req.session.user.username
      });
    } else {
      // Send a 401 status for incorrect password
      res.status(401).send({ error: "Invalid password." });
    }
  } else {
    // Send a 401 status for invalid username
    res.status(401).send({ error: "Invalid username." });
  }
});

router.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  // purify relevant input
  const purifiedUsername = purify(username);
  const purifiedEmail = purify(email);
  // Hash the password
  const hashedPassword = await hashPassword(password);

  // check if username exists
  const userExists = await findUserByUsername(username);

  if (userExists) {
    res.status(401).send({ error: "Username is taken" });
  } else {
    // Create user in mongodb
    createUser(purifiedUsername, purifiedEmail, hashedPassword);

    // Send mail confirming registration
    const mailMessage = registerMailMessage(username);
    sendEmail(email, registerMailSubject, mailMessage);

    res.status(201).send({ message: "Registration successful. Redirecting to login." });
  }
});

router.get("/api/auth/logout", (req, res) => {
  // delete session
  delete req.session.user;
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

    // generates new token and adds it to the db with username in seperate document with 30 min lifespan.
    if (userExists) {
      const token = generateToken();
      await addToResetPassword(username, token);
      const message = passwordResetMessage(username, token);
      sendEmail(userExists.email, passwordResetSubject, message);

      res
        .status(200)
        .send({ message: "Password reset token sent successfully." });
    } else {
      res.status(404).send({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error." });
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
      res.status(200).send({ message: "Password reset successful." });
    } else {
      res.status(401).send({ error: "Invalid token or username." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

router.use(isAuthenticated);

router.get("/api/auth/authSocket", isAuthenticated, (req, res) => {
  const projectId = req.session.projectId;
  res.status(200).send({ message: "Loading data", projectId });
});

export default router;
