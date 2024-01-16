import { ObjectId } from "mongodb";
import db from "./connection.js";

export const findNotesByProjectId = async (projectId) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.findOne({ _id }, { notes: 1 });

    return result ? result.notes : [].reverse();
  } catch (err) {
    console.error("Error occurred while finding project", err);
    // Handle the error gracefully, you can choose to return a specific value or rethrow the error
    throw new Error("Failed to find notes by project ID");
  }
};

export const findNoteByNoteName = async (projectId, noteName) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.findOne(
      { _id, "notes.noteName": noteName },
      { projection: { "notes.$": 1, _id: 0 } }
    );

    const notesArray = result ? result.notes : [];

    return notesArray;
  } catch (err) {
    console.error("Error occurred while finding notes by noteName", err);
    throw new Error("Failed to find note by note name");
  }
};

export const createNote = async (projectId, note) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne(
      { _id },
      { $push: { notes: note } }
    );
    return result;
  } catch (err) {
    console.error("Error occurred while updating Kanban", err);
    throw err;
  }
};

export const updateNoteByNoteName = async (
  projectId,
  noteName,
  updatedNoteData
) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne(
      { _id, "notes.noteName": noteName },
      { $set: { "notes.$": updatedNoteData } }
    );
    return result;
  } catch (err) {
    console.error("Error occurred while updating note by noteName", err);
    throw new Error("Failed to update note by note name");
  }
};

export const deleteNoteByNoteName = async (projectId, noteName) => {
  try {
    const _id = new ObjectId(projectId);

    // Update the project by pulling the note with the specified name
    const result = await db.projects.updateOne(
      { _id },
      { $pull: { notes: { noteName } } }
    );
  } catch (err) {
    console.error("Error occurred while deleting note by noteName", err);
    // Handle the error gracefully, you can choose to return a specific value or rethrow the error
    throw new Error("Failed to delete note by note name");
  }
};

export const addToEditorCounter = async (projectId, noteName) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne(
      { _id, "notes.noteName": noteName },
      { $inc: { "notes.$.editorCounter": 1 } }
    );
    return result;
  } catch (err) {
    console.error("Error occurred while incrementing editorCounter", err);
    throw new Error("Failed to increment editorCounter");
  }
};

export const subtractFromEditorCounter = async (projectId, noteName) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne(
      { _id, "notes.noteName": noteName, "notes.editorCounter": { $gt: 0 } },
      { $inc: { "notes.$.editorCounter": -1 } }
    );

    return result;
  } catch (err) {
    console.error("Error occurred while decrementing editorCounter", err);
    throw new Error("Failed to decrement editorCounter");
  }
};

export const resetEditorCounterForProject = async (projectId) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateMany(
      { _id, "notes.editorCounter": { $gt: 0 } },
      { $set: { "notes.$.editorCounter": 0 } }
    );

    return result;
  } catch (err) {
    console.error("Error occurred while resetting editorCounters", err);
    throw new Error("Failed to reset editorCounters");
  }
};
