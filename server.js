import http from "http";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import { createRequestHandler } from "@remix-run/express";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server);

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client")
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});

io.on("connection", (socket) => {
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
  });

  socket.on("sendMessageToChat", ({ chatId, message }) => {
    io.to(chatId).emit("broadcastMessageToChat", { message });
  });
});
