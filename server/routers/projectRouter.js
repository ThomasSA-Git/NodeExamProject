import { Router } from "express";

const router = Router();

import {
  createProject,
  deleteProject,
  findProjectsByUser,
} from "../db/projectsDb.js";

import { purify } from "../util/DOMpurify.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

router.get("/api/projects/byUserName/:username", isAuthenticated, async (req, res) => {
  try {
    const projects = await findProjectsByUser(req.params.username);

    res.send({ data: projects });
  } catch (error) {
    console.error("Error in getting project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/projects", /* isAuthenticated, */ async (req, res) => {
  try {
    const { projectName, username } = req.body;

    const purifiedProjectName = purify(projectName);
    const purifiedUsername = purify(username);

    await createProject(purifiedProjectName, purifiedUsername);

    res.status(201).json({ message: "Project created successfully" });
  } catch (error) {
    console.error("Error in creating project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete(
  "/api/projects/:projectName",
  isAuthenticated,
  async (req, res) => {
    try {
      const projectName = req.params.projectName;

      await deleteProject(projectName);

      res.json({ message: `Project '${projectName}' deleted successfully.` });
    } catch (error) {
      console.error("Error in delete project", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
