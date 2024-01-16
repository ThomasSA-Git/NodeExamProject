import {
  findProjectByProjectId,
  addUserToProject,
  deleteUserFromProject,
} from "../db/projectsDb.js";

import { getKanbanByProjectId, updateKanban } from "../db/kanbanDb.js";

import {
  addToEditorCounter,
  subtractFromEditorCounter,
  findNotesByProjectId,
} from "../db/notesDb.js";

import { getDiagramByProjectId, updateDiagram } from "../db/diagramDb.js";

import {
  findUserByUsername,
  addProjectIdToUser,
  removeProjectIdFromUser,
} from "../db/usersDb.js";

import { purifyKanbanList } from "../util/DOMpurify.js";

export default (io) => {
  io.on("connection", async (socket) => {
    // join project room with projectId upon connection
    const projectId = await socket.handshake.query.projectId;
    socket.join(projectId);

    /*                                       KANBAN SOCKETS                       */
    socket.on("update-kanban", async (data) => {
      try {
        const projectId = data.projectId;
        const updatedKanban = data.kanban.map(purifyKanbanList);
        const result = await updateKanban(projectId, updatedKanban);
        if (result.acknowledged && result.matchedCount) {
          // Emit the updated kanban to all clients in the same room, excluding this client
          socket.broadcast.to(projectId).emit("kanban-data", {
            kanban: updatedKanban,
            message: "Kanban updated",
          });
        } else {
          socket.emit("kanban-error", { message: "Kanban save failed" });
        }
      } catch (error) {
        socket.emit("kanban-error", { message: `Error: ${error}` });
      }
    });
    socket.on("save-kanban", async (data) => {
      try {
        const projectId = data.projectId;
        const purifiedKanban = data.kanban.map(purifyKanbanList);
        const result = await updateKanban(projectId, purifiedKanban);
        if (result.acknowledged && result.matchedCount) {
          socket.emit("save-success-kanban", { message: "Kanban saved" });
        } else {
          socket.emit("kanban-error", { message: "Kanban save failed" });
        }
      } catch (error) {
        socket.emit("kanban-error", { message: `Error: ${error}` });
      }
    });
    socket.on("load-kanban", async (data) => {
      try {
        const kanban = await getKanbanByProjectId(data.projectId);
        if (kanban || kanban != 0) {
          socket.emit("kanban-data", {
            kanban,
            message: "",
          });
        } else {
          socket.emit("kanban-error", { message: "Kanban load failed" });
        }
      } catch (error) {
        socket.emit({ message: `Error: ${error}` });
      }
    });

    /*                     DIAGRAM SOCKETS                              */
    socket.on("load-diagram", async (data) => {
      try {
        const projectId = data.projectId;
        //const project = await findProjectByProjectId(projectId);
        const diagram = await getDiagramByProjectId(projectId);
        if (diagram || diagram != 0) {
          socket.emit("diagram-data", {
            diagram: diagram,
            message: "",
          });
        } else {
          socket.emit("diagram-error", {
            message: "Diagram update failed",
          });
        }
      } catch (error) {
        socket.emit("diagram-error", { message: `Error: ${error}` });
      }
    });
    socket.on("update-diagram", async (data) => {
      try {
        const diagram = data.diagram;
        const projectId = data.projectId;
        const result = await updateDiagram(projectId, diagram);
        if (result.acknowledged && result.matchedCount) {
          // emit the updated diagram to all clients in the same room, except this client
          socket.broadcast.to(projectId).emit("diagram-data", {
            diagram: diagram,
            message: "Diagram updated",
          });
        } else {
          socket.emit("diagram-error", {
            message: "Diagram update failed",
          });
        }
      } catch (error) {
        socket.emit("diagram-error", { message: `Error: ${error}` });
      }
    });
    socket.on("save-diagram", async (data) => {
      try {
        const diagram = data.diagram;
        const projectId = data.projectId;
        const result = await updateDiagram(projectId, diagram);
        if (result.acknowledged && result.matchedCount) {
          socket.emit("save-success-diagram", { message: "Diagram saved" });
        } else {
          socket.emit("diagram-error", {
            message: "Diagram update failed",
          });
        }
      } catch (error) {
        socket.emit("diagram-error", { message: `Error: ${error}` });
      }
    });

    /*                       SEARCH/ADD/REMOVE USER SOCKETS                  */
    socket.on("search-user", async (data) => {
      try {
        const userExists = await findUserByUsername(data.searchUser);
        if (userExists === null) {
          socket.emit("find-user-error", { message: "User not found" });
        } else {
          socket.emit("find-user-result");
        }
      } catch (error) {
        socket.emit("find-user-result", { message: `Error: ${error}` });
      }
    });

    socket.on("add-user", async (data) => {
      try {
        const projectId = data.projectId;
        const username = data.username;
        const result = await addUserToProject(projectId, username);
        const resultUser = await addProjectIdToUser(username, projectId);
        const project = await findProjectByProjectId(projectId);
        if (result.modifiedCount === 1 && resultUser.modifiedCount === 1) {
          // emits changes to project users to all in project room
          io.to(projectId).emit("add-user-success", {
            message: "User added",
            users: project.users,
          });
        } else {
          socket.emit("add-user-error", {
            message: "User not added. Error while saving.",
          });
        }
      } catch (error) {
        socket.emit("add-user-error", { message: `Error: ${error}` });
      }
    });

    socket.on("remove-user", async (data) => {
      try {
        const projectId = data.projectId;
        const username = data.username;
        const result = await deleteUserFromProject(projectId, username);
        const resultUser = await removeProjectIdFromUser(username, projectId);
        const project = await findProjectByProjectId(projectId);
        if (resultUser.modifiedCount === 1 && result.modifiedCount === 1) {
          // emits changes to project users to all in project room
          io.to(projectId).emit("remove-user-success", {
            message: "User removed",
            users: project.users,
          });
        } else {
          socket.emit("remove-user-error", {
            message: "User not removed. Error while saving.",
          });
        }
      } catch (error) {
        socket.emit("remove-user-error", { message: `Error: ${error}` });
      }
    });

    /*                        NOTES COUNTER AND UPDATE TABLE SOCKETS                       */
    socket.on("add-to-counter", async (data) => {
      const projectId = data.projectId;
      const noteName = data.noteName;
      const username = data.username;
      const result = await addToEditorCounter(projectId, noteName);
      const notes = await findNotesByProjectId(projectId);
      if (result.modifiedCount === 1) {
        socket.broadcast.to(projectId).emit("user-editing", {
          message: `${noteName} is currently being edited by ${username}`,
          notes,
        });
      }
    });

    socket.on("subtract-from-counter", async (data) => {
      const projectId = data.projectId;
      const noteName = data.noteName;
      const username = data.username;
      const result = await subtractFromEditorCounter(projectId, noteName);
      const notes = await findNotesByProjectId(projectId);
      if (result.modifiedCount === 1) {
        socket.broadcast.to(projectId).emit("user-stopped-editing", {
          message: `${username} is no longer editing ${noteName}`,
          notes,
        });
      }
    });

    // disconnect
    socket.on("terminate", () => {
      socket.disconnect();
    });
  });
};
