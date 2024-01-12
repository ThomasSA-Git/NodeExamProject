import {
    findProjectByProjectId,
    updateKanban,
    addUserToProject,
    deleteUserFromProject,
    updateDiagram,
  } from "../db/projectsDb.js";
  
  import {
    findUserByUsername,
    addProjectIdToUser,
    removeProjectIdFromUser,
  } from "../db/usersDb.js";
  
  import { purifyKanbanList } from "../util/DOMpurify.js";

export default (io) => {
    io.on("connection", (socket) => {
        // client joins room identified by projectId when connecting. Used for live update of kanban
        const projectId = socket.handshake.query.projectId;
        socket.join(projectId);

        // kanban sockets
        socket.on("save-kanban", async (data) => {
          try {
            const projectId = data.projectId;
            const purifiedKanban = data.kanban.map(purifyKanbanList);
            const result = await updateKanban(projectId, purifiedKanban);
            if (result.acknowledged && result.matchedCount) {
              // Emit the updated kanban to all clients in the same room
              const updatedProject = await findProjectByProjectId(projectId);
              io.to(projectId).emit("kanban-data", updatedProject.kanban);
              socket.broadcast.to(projectId).emit("save-success", { message: "Kanban updated" });
            } else {
              socket.emit("save-failure", { message: "Kanban update failed" });
            }
          } catch (error) {
            socket.emit("save-failure", { message: `Error: ${error}` });
          }
        });
        socket.on("load-kanban", async (data) => {
          try {
            const project = await findProjectByProjectId(data.projectId);
      
            socket.emit("kanban-data", project.kanban);
          } catch (error) {
            socket.emit({ message: `Error: ${error}` });
          }
        });
        
        // diagram sockets
        socket.on("load-diagram", async (data) => {
          try {
            const projectId = data.projectId;
            const project = await findProjectByProjectId(projectId);
            if (!project.diagram || project.diagram === 0) {
              socket.emit("diagram-save-failure", {
                message: "Diagram update failed",
              });
            } else {
              io.to(projectId).emit("diagram-data", project.diagram);
            }
          } catch (error) {
            socket.emit("diagram-save-failure", { message: `Error: ${error}` });
          }
        });
        socket.on("save-diagram", async (data) => {
          try {
            const diagram = data.diagram;
            const projectId = data.projectId;
            const result = await updateDiagram(projectId, diagram);
            if (result.acknowledged && result.matchedCount) {
              // emit the updated diagram to all clients in the same room
              const updatedProject = await findProjectByProjectId(data.projectId);
              io.to(projectId).emit("diagram-data", updatedProject.diagram);
              socket.broadcast.to(projectId).emit("diagram-save-success", { message: "Diagram updated" });
            } else {
              socket.emit("diagram-save-failure", {
                message: "Diagram update failed",
              });
            }
          } catch (error) {
            socket.emit("diagram-save-failure", { message: `Error: ${error}` });
          }
        });
        
        // search/add/remove user for project sockets
        socket.on("search-user", async (data) => {
          try {
            const userExists = await findUserByUsername(data.searchUser);
            if (userExists === null) {
              socket.emit("find-user-error", { message: "User not found" });
            } else {
              socket.emit("find-user-result", { username: user.username });
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
              socket.emit("add-user-success", { message: "User added" });
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
            const result = await deleteUserFromProject(data.projectId, data.username);
            const resultUser = await removeProjectIdFromUser(
              data.username,
              data.projectId
            );
            if (result.modifiedCount === 1 && resultUser.modifiedCount === 1) {
              socket.emit("remove-user-success", { message: "User removed" });
            } else {
              socket.emit("remove-user-error", {
                message: "User not removed. Error while saving.",
              });
            }
          } catch (error) {
            socket.emit("remove-user-error", { message: `Error: ${error}` });
          }
        });
        
        // disconnect
        socket.on("disconnect", () => {
          // leave the room based on projectId
          socket.rooms.forEach((room) => {
            socket.leave(room);
          });
        });
      });
  };