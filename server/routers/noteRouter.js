import { Router } from "express";

const router = Router();

import { createNote } from "../db/projectsDb.js";

router.post("/api/notes", async (req, res) => {
    const { projectId, note } = req.body;
    console.log(note)
    await createNote(projectId, note);
});

export default router;
