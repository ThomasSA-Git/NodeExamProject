import { Router } from "express";

const router = Router();

import {
  createNote,
  findNotesByProjectId,
  findNoteByNoteName,
  updateNoteByNoteName,
} from "../db/projectsDb.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

router.post("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const { projectId, note } = req.body;
    const result = await findNoteByNoteName(req.session.projectId, note.noteName);
    if(result.length == 0){
  await createNote(projectId, note);
  res.send({ message: "Note created", created: true })
}
else{
  res.send({ message: "Note name already exists. Could not create.", created: false })
}
}
catch(error){
  console.error("Error in creating notes", error);
  res.status(500).json({ error: "Internal server error" });
}
});

router.get("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const notes = await findNotesByProjectId(projectId);
    res.send({ data: notes });
  } catch (error) {
    console.error("Error in getting notes", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  const noteName = req.params.noteName;
  const projectId = req.session.projectId;
  try {
    const result = await findNoteByNoteName(projectId, noteName);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Note not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.patch("/api/notes/:noteName", async (req, res) => {
  try {
    const updatedNote = req.body;
    await updateNoteByNoteName(
      req.session.projectId,
      req.params.noteName,
      updatedNote
    );
    res.send({ message: "Note updates saved." });
  } catch (error) {
    res.send({ message: error });
  }
});

export default router;
