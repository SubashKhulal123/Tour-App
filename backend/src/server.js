const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(env.port, () => {
    console.log(`API running on port ${env.port} in ${env.nodeEnv} mode`);
  });
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer();

