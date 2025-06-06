import express, { Router } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { errorHandler } from "./middlewares/handler-errors.middleware";
import path from "path";

interface Options {
  port?: number;
  routes: Router;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port = 3000, routes } = options;

    this.port = port;
    this.routes = routes;

    this.setupMiddlewares();
  }

  private setupMiddlewares() {
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "..", "..", "views"));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(morgan("dev"));
    this.app.use(helmet());
    this.app.use(this.routes);
    this.app.use(errorHandler);
  }

  async start() {
    this.app.listen(this.port, "0.0.0.0", () => {
      console.log(`Server running on port: ${this.port}`);
    });
  }
}
