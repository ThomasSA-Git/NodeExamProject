import db from "./connection.js";

const updateProjectKanban = async (projectName, kanban) => {
    try {
  
      const result = await db.projects.updateOne(
        { projectName },
        {
          $set: {
            kanban,
          },
        }
      );
  
      if (result.modifiedCount === 1) {
        console.log("Project kanban updated successfully");
      } else {
        console.log("Project not found or kanban not updated");
      }
  
      return result;
    } catch (err) {
      console.error("Error occurred while updating kanban", err);
      throw err;
    }
  };