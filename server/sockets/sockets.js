import {
  findProjectByProjectId,
  updateKanban,
  addUserToProject,
  deleteUserFromProject,
  updateDiagram,
  addToEditorCounter,
  subtractFromEditorCounter,
} from "../db/projectsDb.js";

import {
  findUserByUsername,
  addProjectIdToUser,
  removeProjectIdFromUser,
} from "../db/usersDb.js";

import { purifyKanbanList } from "../util/DOMpurify.js";

export default (io) => {
  io.on("connection", async (socket) => {
    // join project room with projectId
    const projectId = await socket.handshake.query.projectId;
    socket.join(projectId);

    // kanban sockets
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
        const project = await findProjectByProjectId(data.projectId);
        if (project.kanban || project.kanban != 0) {
          socket.emit("kanban-data", {
            kanban: project.kanban,
            message: "",
          });
        } else {
          socket.emit("kanban-error", { message: "Kanban load failed" });
        }
      } catch (error) {
        socket.emit({ message: `Error: ${error}` });
      }
    });

    // diagram sockets
    socket.on("load-diagram", async (data) => {
      try {
        const projectId = data.projectId;
        const project = await findProjectByProjectId(projectId);
        if (project.diagram || project.diagram != 0) {
          socket.emit("diagram-data", {
            diagram: project.diagram,
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

    // search/add/remove user for project sockets
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
        const result = await addUserToProject(data.projectId, data.username);
        const resultUser = await addProjectIdToUser(
          data.username,
          data.projectId
        );
        if (result.modifiedCount === 1 && resultUser.modifiedCount === 1) {
          // emits changes to project users to all in project room
          io.to(data.projectId).emit("add-user-success", {
            message: "User added",
            user: data.username,
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
        const result = await deleteUserFromProject(
          data.projectId,
          data.username
        );
        const resultUser = await removeProjectIdFromUser(
          data.username,
          data.projectId
        );
        if (result.modifiedCount === 1 && resultUser.modifiedCount === 1) {
          // emits changes to project users to all in project room
          io.to(data.projectId).emit("remove-user-success", {
            message: "User removed",
            user: data.username,
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

    socket.on("add-to-counter", async (data) => {
      const projectId = data.projectId;
      const noteName = data.noteName;
      const username = data.username;
      const result = await addToEditorCounter(projectId, noteName);
      if (result.modifiedCount === 1) {
        socket.broadcast
          .to(projectId)
          .emit("user-editing", {
            message: `${noteName} is currently being edited by ${username}`,
          });
      }
    });

    socket.on("subtract-from-counter", async (data) => {
      const projectId = data.projectId;
      const noteName = data.noteName;
      const username = data.username;
      const result = await subtractFromEditorCounter(projectId, noteName);
      if (result.modifiedCount === 1) {
        socket.broadcast
          .to(projectId)
          .emit("user-stopped-editing", {
            message: `${username} is no longer editing ${noteName}`,
          });
      }
    })

    socket.on("terminate", () => {
      socket.disconnect();
    });
  });
};
