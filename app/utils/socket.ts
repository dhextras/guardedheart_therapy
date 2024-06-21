import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (chatId: string) => {
  if (!socket) {
    socket = io();
    socket.emit("joinChat", chatId);
  }
};

export const disconnectSocket = (chatId: string) => {
  if (socket) {
    socket.emit("leaveChat", chatId);
    socket.disconnect();
    socket = null;
  }
};

export const sendMessageToChat = (chatId: string, message: string) => {
  if (socket) {
    socket.emit("sendMessageToChat", { chatId, message });
  }
};

export const listenForMessages = (callback: (message: string) => void) => {
  if (socket) {
    socket.on("broadcastMessageToChat", ({ message }) => {
      callback(message);
    });
  }
};
