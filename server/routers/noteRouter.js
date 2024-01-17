import { Router } from "express";

const router = Router();

import {
  createNote,
  getNotesByProjectId,
  getNoteByNoteName,
  updateNoteByNoteName,
  deleteNoteByNoteName,
} from "../db/notesDb.js";

import { notesResponse } from "../dto/notesResponse.js";

import { purifyNote } from "../util/DOMpurify.js";

import { isAuthenticated } from "../middleware/authMiddleWare.js";

router.get("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const projectId = req.session.projectId;
    let notes = await getNotesByProjectId(projectId);
    if (notes) {
      notes = notesResponse(notes);
      res.status(200).send({ notes });
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
    const result = await getNoteByNoteName(projectId, noteName);

    if (result.length != 0) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Note not found" });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.post("/api/notes", isAuthenticated, async (req, res) => {
  try {
    const { note } = req.body;
    const projectId = req.session.projectId;
    const result = await getNoteByNoteName(
      projectId,
      note.noteName
    );
    if (result.length == 0) {
      const result = await createNote(projectId, note);
      if (result.modifiedCount === 1) {
        res.status(201).send({ message: "Note created" });
      } else {
        res.status(404).send({ message: "Could not create note" });
      }
    } else {
      res.status(404).send({
        message: "Note name already exists",
        created: false,
      });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.patch("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  try {
    const updatedNote = req.body;
    const result = await updateNoteByNoteName(
      req.session.projectId,
      req.params.noteName,
      purifyNote(updatedNote)
    );
 
    if (result.modifiedCount === 1) {
      res.status(200).send({ message: "Note updates saved" });
    } else {
      res.status(404).send({
        message: "No matching notes found, update not made",
      });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

router.delete("/api/notes/:noteName", isAuthenticated, async (req, res) => {
  try {
    const noteToDelete = req.params.noteName;
    const result = await deleteNoteByNoteName(
      req.session.projectId,
      noteToDelete
    );
    if (result.modifiedCount === 1) {
      res.status(200).send({ message: `${noteToDelete} note deleted` });
    } else {
      res.status(404).send({ message: `${noteToDelete} could not be deleted` });
    }
  } catch (error) {
    const errorMessage = "Internal server error: " + error;
    res.status(500).send({ message: errorMessage });
  }
});

export default router;
