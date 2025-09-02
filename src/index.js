import express from "express";
import dotenv from "dotenv";
import bootstrap from "./app.controller.js";
import chalk from "chalk";
const app = express();
dotenv.config({ path: "./src/config/.env" });
const port = process.env.PORT;
await bootstrap(app, express);
app.listen(port, () =>
  console.log(
    chalk.bgGreen(chalk.black(`Example app listening on port ${port}!`))
  )
);
