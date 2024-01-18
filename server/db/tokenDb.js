import db from "./connection.js";

export const findUserInResetPassword = async (username) => {
    try {

      const result = await db.tokens.findOne({ username });
      
      return result;
    } catch (err) {
      console.error("Error occurred while finding user in resetPassword", err);
      throw err;
    }
  };
  
  // Adds a username with token + TTL for expiration to collection resetpassword.
  export const addToResetPassword = async (username, secretToken) => {
    try {
  
      const resetPasswordEntry = {
        username,
        secretToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
  
      // Ensure an index on the 'expiresAt' field for TTL
      await db.tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
      const result = await db.tokens.insertOne(resetPasswordEntry, {
        expireAfterSeconds: 1800,
      });
      return result;
    } catch (err) {
      console.error("Error occurred while adding to resetPassword", err);
      throw err;
    }
  };
  
  // Deletes from the collection resetpassword when the token has been used for reset of password.
  export const deleteUserTokenByUsername = async (username) => {
    try {
      const result = await db.tokens.deleteOne({ username });
  
      return result;
    } catch (err) {
      console.error("Error occurred while deleting user token", err);
      throw err;
    }
  };