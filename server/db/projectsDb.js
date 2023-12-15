import { ObjectId, Timestamp } from "mongodb";
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

export const addUserToProject = async (projectName, username) => {
  try {
    const result = await db.projects.updateOne(
      { projectName },
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

    console.log(note)

    const result = await db.projects.updateOne(
      { _id },
      { $push: { notes: note } }
    );

      console.log(result)
    return result;
  } catch (err) {
    console.error("Error occurred while updating Kanban", err);
    throw err;
  }
};

