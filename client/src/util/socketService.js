import io from "socket.io-client";

let socket = null;

export const initializeSocket = (IO_URL, projectId) => {
  if (!socket) {
    socket = io(IO_URL, {
      query: {
        projectId: projectId,
      },
    });
    // Return a promise that resolves when the socket is connected
    return new Promise((resolve) => {
      socket.on("connect", () => {
        resolve(socket);
      });
    });
  }

  // If the socket is already initialized then return a resolved promise
  return Promise.resolve(socket);
};

export const disconnectSocket = () => {
  if (socket) {
    // close the connection server side
    socket.disconnect();

    // reset the socket variable
    socket = null;
  }
};

export const getSocket = () => socket;
