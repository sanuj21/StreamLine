import dotenv from "dotenv";
import { httpServer } from "./app.js";
import connectDB from "./db/index.js";
import { shutdownProducer } from "./kafka/kafka.js";

dotenv.config({
  path: "./.env",
});

/**
 * Starting from Node.js v14 top-level await is available and it is only available in ES modules.
 * This means you can not use it with common js modules or Node version < 14.
 */
const majorNodeVersion = +process.env.NODE_VERSION?.split(".")[0] || 0;

const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    // console.info(
    //   `📑 Visit the documentation at: http://localhost:${
    //     process.env.PORT || 8080
    //   }`
    // );
    console.log("⚙️  Server is running on port: " + process.env.PORT);
  });
};

// Shutting down Kafka producer
process.on("SIGINT", async () => {
  await shutdownProducer();
  process.exit(0);
});

if (majorNodeVersion >= 14) {
  try {
    console.log("Starting DB connection....");
    await connectDB();
    console.log("DB connection successful....");
    startServer();
  } catch (err) {
    console.log("Mongo db connect error: ", err);
  }
} else {
  connectDB()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      console.log("Mongo db connect error: ", err);
    });
}
