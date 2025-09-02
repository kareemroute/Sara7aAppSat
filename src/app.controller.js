import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import connectDB from "./DB/connection.js";
import { globalErrorHandler } from "./Utils/errorHandling.utils.js";
import cors from "cors";
import path from "node:path";
import { attachRoutingWithlogger } from "./Utils/logger/logger.js";
import { corsOptions } from "./Utils/cors/cors.js";
import helmet from "helmet";
import { limiter } from "./Utils/exress-rate-limit.js";

const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(helmet());
  app.use(cors(corsOptions()));
  app.use(limiter());
  await connectDB();

  attachRoutingWithlogger(app, "/api/auth", authRouter, "auth.log");
  attachRoutingWithlogger(app, "/api/user", userRouter, "users.log");

  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Welcome To Sara7a Application" });
  });
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/message", messageRouter);

  app.all("/*dummy", (req, res, next) => {
    return next(new Error(" Not Found Hnadler!!", { cause: 404 }));
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
