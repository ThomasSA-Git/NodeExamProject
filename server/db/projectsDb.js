import db from "./connection.js";

export const createProject = async (projectName, username) => {
  try {
    const project = {
      projectName,
      users: [
        username,
      ],
    };

    const result = await db.projects.insertOne(project);
    console.log("Project created successfully");
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
      { $addToSet: { users: username } } // Add username to the users array if not already present
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

export const findProjectByProjectName = async (projectName) => {
  try {
    const result = await db.projects.findOne({ projectName });
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

export const deleteProject = async (projectName) => {
  try {
    await db.projects.deleteOne({ projectName });
  } catch (err) {
    console.error("Error occured while deleting project");
    throw err;
  }
};
