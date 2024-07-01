import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

import type { messageType } from "~/types/socket.types";

let socket: Socket | null = null;

/**
 * Initializes the socket connection and joins the specified chat room.
 * @param {string} chatId - The ID of the chat room to join.
 * @returns {boolean} True if the socket was initialized successfully, false otherwise.
 */
export const initializeSocket = (chatId: string) => {
  if (!socket) {
    socket = io();
  }
  socket.emit("joinChat", chatId);
  return true;
};

/**
 * Disconnects the socket from the specified chat room and closes the connection.
 * @param {string} chatId - The ID of the chat room to leave.
 * @returns {null} Always returns null.
 */
export const disconnectSocket = (chatId: string) => {
  if (socket) {
    socket.emit("leaveChat", chatId);
    socket.disconnect();
    socket = null;
  }
  return null;
};

/**
 * Sends a message to the specified chat room.
 * @param {string} chatId - The ID of the chat room to send the message to.
 * @param {messageType} message - The message object to send.
 * @returns {boolean} True if the message was sent successfully, false otherwise.
 */
export const sendMessageToChat = (chatId: string, message: messageType) => {
  if (socket) {
    socket.emit("sendMessageToChat", { chatId, message });
    return true;
  }
  return false;
};

/**
 * Listens for incoming messages from the chat room and calls the provided callback function.
 * @param {Function} callback - The callback function to be called with the received message.
 */
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
