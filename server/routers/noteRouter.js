import { Router } from "express";

const router = Router();

import {
  createNote,
  findNotesByProjectId,
  findNoteByNoteName,
  updateNoteByNoteName,
  deleteNoteByNoteName
} from "../db/projectsDb.js";

import { isAuthenticated } from "../middleware/authMiddleWare.js";

router.post("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const { projectId, note } = req.body;
    const result = await findNoteByNoteName(req.session.projectId, note.noteName);
    if(result.length == 0){
  await createNote(projectId, note);
  res.status(201).send({ message: "Note created", created: true })
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
    res.status(200).send({ data: notes });
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
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Note not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.patch("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  try {
    const updatedNote = req.body;
    await updateNoteByNoteName(
      req.session.projectId,
      req.params.noteName,
      updatedNote
    );
    res.status(200).send({ message: "Note updates saved." });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.delete("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  try{
    const noteToDelete = req.params.noteName;
    await deleteNoteByNoteName(req.session.projectId, noteToDelete)
    res.status(200).send({ message: `${req.params.noteName} note deleted` });
  } catch (error) {
    res.send({ message: error });
  }
})

export default router;
