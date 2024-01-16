import { Router } from "express";

const router = Router();

import {
  createProject,
  deleteProject,
  getProjectByProjectId,
  getProjectsByUsername,
} from "../db/projectsDb.js";

import { addProjectIdToUser, removeProjectIdFromUser } from "../db/usersDb.js";

import {
  projectResponse,
  convertTimestampToDate,
} from "../dto/projectDataResponse.js";

import { purify } from "../util/DOMpurify.js";

import { isAuthenticated } from "../middleware/authMiddleWare.js";

router.get("/api/projects/:projectId", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    req.session.projectId = projectId;
    let project = await getProjectByProjectId(projectId);

    if (project) {
      project = projectResponse(project);
      res.status(200).send({ project });
    } else {
      res.status(404).send({ message: "Project not found" });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.get("/api/projects", isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user.username;
    const projects = await getProjectsByUsername(username);
    const projectsWithDates = projects.map(convertTimestampToDate);
    res.status(200).send({ data: projectsWithDates });
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.post("/api/projects", isAuthenticated, async (req, res) => {
  try {
    const { projectName, username } = req.body;

    const purifiedProjectName = purify(projectName);
    const purifiedUsername = purify(username);

    const project = await createProject(purifiedProjectName, purifiedUsername);

    const result = await addProjectIdToUser(
      purifiedUsername,
      project.insertedId
    );
    if (result.modifiedCount === 1 && project.acknowledged) {
      res.status(201).send({ message: "Project created successfully" });
    } else {
      res.status(400).send({ message: "Could not create project" });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.delete("/api/projects/:projectId", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const foundProject = await getProjectByProjectId(projectId);
    const users = foundProject.users;
    await deleteProject(projectId);
    if (!foundProject) {
      res.status(404).send({ message: "Project not found" });
      return;
    }
    await Promise.all(
      users.map((user) => removeProjectIdFromUser(user, projectId))
    );
    res
      .status(200)
      .send({ message: `Project deleted successfully. Redirecting` });
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

export default router;
