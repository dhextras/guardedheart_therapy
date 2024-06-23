import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

import type { messageType } from "~/types/socket.types";

let socket: Socket | null = null;

export const initializeSocket = (chatId: string) => {
  if (!socket) {
    socket = io();
  }
  socket.emit("joinChat", chatId);
};

export const disconnectSocket = (chatId: string) => {
  if (socket) {
    socket.emit("leaveChat", chatId);
    socket.disconnect();
    socket = null;
  }
  return null;
};

export const sendMessageToChat = (chatId: string, message: messageType) => {
  if (socket) {
    socket.emit("sendMessageToChat", { chatId, message });
    return true;
  }
  return false;
};

export const listenForMessages = (
  callback: (message: messageType | null) => void
) => {
  if (socket) {
    socket.on("broadcastMessageToChat", ({ message }) => {
      callback(message);
    });
  }
  callback(null);
};
