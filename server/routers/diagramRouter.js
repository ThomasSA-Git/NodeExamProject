import { Router } from "express";
const router = Router();

import { findProjectByProjectId, updateDiagram } from "../db/projectsDb.js";

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
}

router.get("/api/diagram", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const project = await findProjectByProjectId(projectId);
    if (!project.diagram || project.diagram === 0) {
      return res.status(404).json({ error: "No diagram found" });
    } else {
      res.send({ diagram: project.diagram });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/diagram", isAuthenticated, async (req, res) => {
  try {
    const diagram = req.body;
    const projectId = req.session.projectId;
    const result = await updateDiagram(projectId, diagram);
    
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;