import { Router } from "express";
import { AuthController } from "../../core/auth/infrastructure/auth.controller";
import { asyncHandler } from "./middlewares/async-handler.middleware";
import { FarmController } from "../../core/farms/presentation/farm.controller";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { BreedController } from "../../core/breeds/presentation/breed.controller";
import { ReproductiveStateController } from "../../core/farms/presentation/reproductive-state.controller";
import { PhaseController } from "../../core/farms/presentation/phase.controller";
import { CategoryController } from "../../core/products/presentation/category.controller";
import { ProductController } from "../../core/products/presentation/product.controller";
import { PigController } from "../../core/pigs/presentation/pig.controller";

interface AppRoutesDependencies {
  authCtrl: AuthController;
  farmCtrl: FarmController;
  breedCtrl: BreedController;
  reproductiveStateCtrl: ReproductiveStateController;
  phaseCtrl: PhaseController;
  categoryCtrl: CategoryController;
  productCtrl: ProductController;
  pigCtrl: PigController;
}

export class AppRoutes {
  constructor(private readonly deps: AppRoutesDependencies) {}

  get routes(): Router {
    const router = Router();
    const apiPrefix = "/api/v1";

    router.use(`${apiPrefix}/pig`, this.pigRoutes());
    router.use(`${apiPrefix}/product`, this.productsRoutes());
    router.use(`${apiPrefix}/category`, this.categoriesRoutes());
    router.use(`${apiPrefix}/phase`, this.phasesRoutes());
    router.use(
      `${apiPrefix}/reproductive-state`,
      this.reproductiveStateRoutes()
    );
    router.use(`${apiPrefix}/breed`, this.breedRoutes());
    router.use(`${apiPrefix}/farm`, this.farmRoutes());
    router.use(`${apiPrefix}/auth`, this.authRoutes());

    router.use("/", (req, res) => {
      res.send("API REST SWINE MANAGEMENT");
    });

    return router;
  }

  private pigRoutes(): Router {
    const router = Router();

    router.put(
      "/add-weight/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.pigCtrl.createPigWight)
    );

    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.pigCtrl.getAll)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.pigCtrl.create)
    );
    return router;
  }

  private productsRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.productCtrl.getAll)
    );
    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.productCtrl.update)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.productCtrl.create)
    );
    return router;
  }

  private categoriesRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.categoryCtrl.getAll)
    );
    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.categoryCtrl.update)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.categoryCtrl.create)
    );
    return router;
  }

  private phasesRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.phaseCtrl.getAll)
    );
    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.phaseCtrl.update)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.phaseCtrl.create)
    );
    return router;
  }

  private reproductiveStateRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.reproductiveStateCtrl.getAll)
    );
    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.reproductiveStateCtrl.update)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.reproductiveStateCtrl.create)
    );
    return router;
  }

  private breedRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.breedCtrl.getAll)
    );
    router.put(
      "/:id",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.breedCtrl.update)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.breedCtrl.create)
    );
    return router;
  }

  private farmRoutes(): Router {
    const router = Router();
    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.farmCtrl.getAll)
    );
    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      asyncHandler(this.deps.farmCtrl.createFirst)
    );
    return router;
  }

  private authRoutes(): Router {
    const router = Router();
    router.get("/verify/:token", asyncHandler(this.deps.authCtrl.verify));
    router.post("/sign-in", asyncHandler(this.deps.authCtrl.signIn));
    router.post("/sign-up", asyncHandler(this.deps.authCtrl.signUp));

    return router;
  }
}
