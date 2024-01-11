import { Router } from "express";

const router = Router();

import {
  createProject,
  deleteProject,
  findProjectByProjectId,
  findProjectsByUser,
} from "../db/projectsDb.js";

import { addProjectIdToUser, removeProjectIdFromUser } from "../db/usersDb.js";

import {
  dataForProjectPage,
  convertTimestampToDate,
} from "../dto/projectDataResponse.js";

import { purify } from "../util/DOMpurify.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

router.get("/api/projects/:projectId", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    req.session.projectId = projectId;
    const projectData = await dataForProjectPage(projectId);
    res.send({ projectData });
  } catch (error) {
    console.error("Error in getting project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/projects", isAuthenticated, async (req, res) => {
  try {
    const username = req.session.user.username;
    const projects = await findProjectsByUser(username);
    const projectsWithDates = projects.map(convertTimestampToDate);
    res.send({ data: projectsWithDates });
  } catch (error) {
    console.error("Error in getting project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/projects", isAuthenticated, async (req, res) => {
  try {
    const { projectName, username } = req.body;

    const purifiedProjectName = purify(projectName);
    const purifiedUsername = purify(username);

    const project = await createProject(purifiedProjectName, purifiedUsername);

    await addProjectIdToUser(purifiedUsername, project.insertedId);

    res.status(201).send({ message: "Project created successfully" });
 
  } catch (error) {
    console.error("Error in creating project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/api/projects/:projectId", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const foundProject = await findProjectByProjectId(projectId);
    const users = foundProject.users;
    await deleteProject(projectId);
   
      await Promise.all(users.map(user => removeProjectIdFromUser(user, projectId)));
      res.status(201).send({ message: `Project deleted successfully. Redirecting` });
  } catch (error) {
    console.error("Error in delete project", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
