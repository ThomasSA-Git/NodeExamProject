import io from "socket.io-client";

let socket = null;

export const initializeSocket = (IO_URL, projectId) => {
  if (!socket) {
    socket = io(IO_URL, {
      query: {
        projectId: projectId,
      },
    });
    return socket;
  }
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
