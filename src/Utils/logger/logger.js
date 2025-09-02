import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

const __direname = path.resolve();
export function attachRoutingWithlogger(app, routerPath, router, logsFilename) {
  const logStream = fs.createWriteStream(
    path.join(__direname, "./src/logs", logsFilename),
    { flags: "a" }
  );

  app.use(routerPath, morgan("combined", { stream: logStream }), router);

  app.use(routerPath, morgan("dev"), router);
}
