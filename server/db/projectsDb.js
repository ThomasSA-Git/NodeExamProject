import { ObjectId } from "mongodb";
import db from "./connection.js";

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
    return result;
  } catch (err) {
    console.error("Error occurred while removing user from project", err);
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