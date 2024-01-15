import { Router } from "express";

const router = Router();

import {
  createNote,
  findNotesByProjectId,
  findNoteByNoteName,
  updateNoteByNoteName,
  deleteNoteByNoteName,
} from "../db/projectsDb.js";

import { isAuthenticated } from "../middleware/authMiddleWare.js";

router.post("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const { projectId, note } = req.body;
    const result = await findNoteByNoteName(
      req.session.projectId,
      note.noteName
    );
    if (result.length == 0) {
      await createNote(projectId, note);
      res.status(201).send({ message: "Note created", created: true });
    } else {
      res.status(404).send({
        message: "Note name already exists. Could not create.",
        created: false,
      });
    }
  } catch (error) {
    console.error("Error in creating notes", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.get("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.session.projectId;
    const notes = await findNotesByProjectId(projectId);
    if (notes.length != 0) {
      res.status(200).send({ data: notes });
    } else {
      res
        .status(404)
        .send({ message: "No notes attached to project at the moment." });
    }
  } catch (error) {
    console.error("Error in getting notes", error);
    res.status(500).send({ error: "Internal server error" });
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
    const result = await updateNoteByNoteName(
      req.session.projectId,
      req.params.noteName,
      updatedNote
    );
    if (result.modifiedCount > 0) {
      res.status(200).send({ message: "Note updates saved." });
    } else {
      res.status(404).send({
        message: "No matching notes found, update not complete.",
      });
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.delete("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  try {
    const noteToDelete = req.params.noteName;
    await deleteNoteByNoteName(req.session.projectId, noteToDelete);
    res.status(200).send({ message: `${req.params.noteName} note deleted` });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

export default router;
