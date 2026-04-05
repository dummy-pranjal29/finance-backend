require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/index");

const startServer = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server started on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
};

startServer();
