import { ObjectId } from "mongodb";
import db from "./connection.js";

export const getKanbanByProjectId = async (projectId) => {
  try {
    const projectObjectId = new ObjectId(projectId);

    // find the Kanban board directly by projectId and getting kanban only projection
    const { kanban } = await db.projects.findOne(
      { _id: projectObjectId },
      { projection: { _id: 0, kanban: 1 } }
    );

    return kanban;
  } catch (error) {
    console.error("Error occurred while getting Kanban by projectId:", error);
    throw new Error("Failed to get Kanban by projectId");
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
