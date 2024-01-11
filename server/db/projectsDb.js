import { ObjectId } from "mongodb";
import db from "./connection.js";

export const createProject = async (projectName, username) => {
  try {
    const createdAt = Date.now();

    const project = {
      projectName,
      users: [username],
      kanban: [],
      notes: [],
      createdAt,
    };

    const result = await db.projects.insertOne(project);
    return result;
  } catch (err) {
    console.error("Error occurred while creating project", err);
    throw err;
  }
};

export const addUserToProject = async (projectId, username) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.updateOne(
      { _id },
      { $addToSet: { users: username } }
    );

    if (result.modifiedCount === 1) {
      console.log("User added to project successfully");
    } else {
      console.log("Project not found or user already in the project");
    }

    return result;
  } catch (err) {
    console.error("Error occurred while adding user to project", err);
    throw err;
  }
};

export const deleteUserFromProject = async (projectId, username) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.updateOne(
      { _id },
      { $pull: { users: username } }
    );

    if (result.modifiedCount === 1) {
      console.log("User removed from project successfully");
    } else {
      console.log("Project not found or user not in the project");
    }

    return result;
  } catch (err) {
    console.error("Error occurred while removing user from project", err);
    throw err;
  }
};

export const findProjectsByUser = async (username) => {
  try {
    const result = await db.projects.find({ users: username }).toArray();
    return result;
  } catch (err) {
    console.error("Error occurred while finding projects by user", err);
    throw err;
  }
};

export const findProjectByProjectId = async (projectId) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.findOne({ _id });
    return result;
  } catch (err) {
    console.error("Error occurred while finding project", err);
    throw err;
  }
};

export const findAllProjects = async () => {
  try {
    const result = await db.projects.find().toArray();
    return result;
  } catch (err) {
    console.error("Error occurred while finding all users", err);
    throw err;
  }
};

export const deleteProject = async (projectId) => {
  try {
    const _id = new ObjectId(projectId);
    await db.projects.deleteOne({ _id });
  } catch (err) {
    console.error("Error occured while deleting project");
    throw err;
  }
};

export const updateKanban = async (projectId, kanban) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne(
      { _id },
      { $set: { kanban: kanban } }
    );

    return result;
  } catch (err) {
    console.error("Error occurred while updating Kanban", err);
    throw err;
  }
};

export const createNote = async (projectId, note) => {
  try {
    const _id = new ObjectId(projectId);

    console.log(note);

    const result = await db.projects.updateOne(
      { _id },
      { $push: { notes: note } }
    );

    console.log(result);
    return result;
  } catch (err) {
    console.error("Error occurred while updating Kanban", err);
    throw err;
  }
};

export const findNotesByProjectId = async (projectId) => {
  try {
    const _id = new ObjectId(projectId);
    const result = await db.projects.findOne({ _id }, { notes: 1 });

    return result ? result.notes : [];
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

    // Extract only the 'notes' field from the result
    const notesArray = result ? result.notes : [];

    console.log(notesArray); // Log the extracted notes array
    return notesArray;
  } catch (err) {
    console.error("Error occurred while finding notes by noteName", err);
    // Handle the error gracefully, you can choose to return a specific value or rethrow the error
    throw new Error("Failed to find note by note name");
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

    if (result.matchedCount === 1 && result.modifiedCount === 1) {
      console.log("Note updated successfully!");
    } else {
      console.error("Failed to update note.");
    }
  } catch (err) {
    console.error("Error occurred while updating note by noteName", err);
    throw new Error("Failed to update note by note name");
  }
};

export const updateDiagram = async (projectId, diagram) => {
  try {
    const _id = new ObjectId(projectId);

    const result = await db.projects.updateOne({ _id }, { $set: { diagram } });

    return result;
  } catch (err) {
    console.error("Error occurred while updating diagram", err);
    throw err;
  }
};
