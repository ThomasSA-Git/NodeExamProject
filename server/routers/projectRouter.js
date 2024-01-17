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

    if (!foundProject) {
      res.status(404).send({ message: "Project not found" });
      return;
    }

    const users = foundProject.users;

    for (let user of users) {
      let result = await removeProjectIdFromUser(user, projectId);

      if (result.modifiedCount !== 1) {
        res
          .status(404)
          .send({ message: `Project not deleted. Could not delete ${user}` });
        return;
      }
    }

    const deleteResult = await deleteProject(projectId);
    if (deleteResult.deletedCount === 1) {
      res
        .status(200)
        .send({ message: "Project deleted successfully. Redirecting" });
    } else {
      res.status(404).send({ message: "Project not deleted" });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

export default router;
