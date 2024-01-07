import { Router } from "express";
const router = Router();

import { findProjectByProjectId, updateDiagram } from "../db/projectsDb.js";

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
}

router.get("/api/diagram", async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const project = await findProjectByProjectId(projectId);
    console.log(project)
    if (!project.diagram || project.diagram === 0) {
      return res.status(404).json({ error: "No diagram found" });
    } else {
      console.log(project.diagram)
      res.send({ diagram: project.diagram });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/diagram", async (req, res) => {
  try {
    const diagram = req.body;
    const projectId = req.session.projectId;
    const result = await updateDiagram(projectId, diagram);
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;