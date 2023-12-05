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
    console.log("User created successfully");
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
    console.log("Project created successfully");
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

    console.log(`Project ${projectId} removed successfully`);
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

export const createAdminUser = async (password) => {
  try {
    const user = {
      username: "admin",
      email: "admin@admin",
      password: password,
      role: "admin",
    };

    const result = await db.users.insertOne(user);
    console.log("Admin user created successfully");
    return result;
  } catch (err) {
    console.error("Error occurred while creating admin user", err);
    throw err;
  }
};

export const updateUserPassword = async (username, newPassword) => {
  try {
    const result = await db.users.updateOne(
      { username },
      { $set: { password: newPassword } }
    );

    if (result.modifiedCount === 1) {
      console.log("Password updated successfully");
    } else {
      console.log("User not found or password not updated");
    }

    return result;
  } catch (err) {
    console.error("Error occurred while updating user password", err);
    throw err;
  }
};

export default {
  findAllUsers,
  findUserByUsername,
  updateUserPassword,
  createAdminUser,
  createUser,
};