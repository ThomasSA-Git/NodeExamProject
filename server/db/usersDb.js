import db from "./connection.js";

export const createUser = async (username, email, password) => {
  try {
    const user = {
      username,
      email,
      password,
      role: "user",
    };

    const result = await db.users.insertOne(user);
    return result;
  } catch (err) {
    console.error("Error occurred while creating user", err);
    throw err;
  }
};

export const addProjectIdToUser = async (username, projectId) => {
  try {
    const result = await db.users.updateOne(
      { username: username },
      { $addToSet: { projects: projectId } }
    );
    return result;
  } catch (err) {
    console.error("Error occurred while adding project", err);
    throw err;
  }
};

export const removeProjectIdFromUser = async (username, projectId) => {
  try {
    
    const result = await db.users.updateOne(
      { username: username },
      { $pull: { projects: projectId } }
    );
    return result;
  } catch (err) {
    console.error(`Error occurred while removing project ${projectId}`, err);
    throw err;
  }
};

export const findUserByUsername = async (username) => {
  try {
    const result = await db.users.findOne({ username });
    return result;
  } catch (err) {
    console.error("Error occurred while finding user", err);
    throw err;
  }
};

export const findAllUsers = async () => {
  try {
    const result = await db.users.find().toArray();
    return result;
  } catch (err) {
    console.error("Error occurred while finding all users", err);
    throw err;
  }
};


export const updateUserPassword = async (username, newPassword) => {
  try {
    const result = await db.users.updateOne(
      { username },
      { $set: { password: newPassword } }
    );

    return result;
  } catch (err) {
    console.error("Error occurred while updating user password", err);
    throw err;
  }
};