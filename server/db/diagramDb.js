import { ObjectId } from "mongodb";
import db from "./connection.js";

export const getDiagramByProjectId = async (projectId) => {
  try {
    const projectObjectId = new ObjectId(projectId);

    // Find the Kanban board directly by projectId and getting kanban only projection
    const { diagram } = await db.projects.findOne(
      { _id: projectObjectId },
      { projection: { _id: 0, diagram: 1 } }
    );

    return diagram;
  } catch (error) {
    console.error("Error occurred while getting Kanban by projectId:", error);
    throw new Error("Failed to get Kanban by projectId");
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
