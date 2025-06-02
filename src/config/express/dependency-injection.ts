import { SignInUseCase } from "../../core/auth/application/use-cases/sign-in.usecase";
import { SignUpUseCase } from "../../core/auth/application/use-cases/sign-up.usecase";
import { VerifyAccountUseCase } from "../../core/auth/application/use-cases/verify-account.usecase";
import { AuthController } from "../../core/auth/infrastructure/auth.controller";
import { CreateBreedUseCase } from "../../core/breeds/application/use-cases/create-breed.usecase";
import { GetAllBreedUseCase } from "../../core/breeds/application/use-cases/get-all-breed.usecase";
import { UpdateBreedUseCase } from "../../core/breeds/application/use-cases/update-breed.usecase";
import { PrismaBreedRepository } from "../../core/breeds/infrastructure/persistence/prisma-breed.repository";
import { BreedController } from "../../core/breeds/presentation/breed.controller";
import { CreateFirstFarmUseCase } from "../../core/farms/application/use-cases/create-first-farm.usecase";
import { GetAllFarmsUseCase } from "../../core/farms/application/use-cases/get-all-farms.usecase";
import { CreatePhaseUseCase } from "../../core/farms/application/use-cases/phase/create-phase.usecase";
import { GetAllPhaseUseCase } from "../../core/farms/application/use-cases/phase/get-all-phase.usecase";
import { UpdatePhaseUseCase } from "../../core/farms/application/use-cases/phase/update-phase.usecase";
import { CreateReproductiveStateUseCase } from "../../core/farms/application/use-cases/reproductive-state/create-reproductive-state.usecase";
import { GetAllReproductiveStateUseCase } from "../../core/farms/application/use-cases/reproductive-state/get-all-reproductive-state.usecase";
import { UpdateReproductiveStateUseCase } from "../../core/farms/application/use-cases/reproductive-state/update-reproductive-state.usecase";
import { PrismaFarmRepository } from "../../core/farms/infrastructure/persistence/prisma-farm.repository";
import { PrismaPhaseRepository } from "../../core/farms/infrastructure/persistence/prisma-phase.repository";
import { PrismaReproductiveStateRepository } from "../../core/farms/infrastructure/persistence/prisma-reproductive-state.repository";
import { PrismaSettingRepository } from "../../core/farms/infrastructure/persistence/prisma-setting.repository";
import { FarmController } from "../../core/farms/presentation/farm.controller";
import { PhaseController } from "../../core/farms/presentation/phase.controller";
import { ReproductiveStateController } from "../../core/farms/presentation/reproductive-state.controller";
import { CreateSowNotificationsUseCase } from "../../core/notifications/application/use-cases/create-sow-notification.usecase";
import { DeleteSowNotificationUseCase } from "../../core/notifications/application/use-cases/delete-sow-notification.usecase";
import { PrismaNotificationRepository } from "../../core/notifications/infrastructure/prisma-notification.repository";
import { CreatePigUseCase } from "../../core/pigs/application/use-cases/create-pig.usecase";
import { GetAllPigUseCase } from "../../core/pigs/application/use-cases/get-all-pig.usecase";
import { PigReproductiveCalculatorUseCase } from "../../core/pigs/application/use-cases/pig-reproductive-calculator.usecase";
import { UpdatePigUseCase } from "../../core/pigs/application/use-cases/update-pig.usecase";
import { PrismaBirthRepository } from "../../core/pigs/infrastructure/persistence/prisma-birth.repository";
import { PrismaPigRepository } from "../../core/pigs/infrastructure/persistence/prisma-pig.repository.ts";
import { PrismaReproductiveHistory } from "../../core/pigs/infrastructure/persistence/prisma-reproductive-history.repository";
import { PigController } from "../../core/pigs/presentation/pig.controller";
import { PrismaPlanRepository } from "../../core/plans/infrastructure/persistence/prisma-plan.repository";
import { CreateCategoryUseCase } from "../../core/products/application/use-cases/create-category.usecase";
import { CreateProductUseCase } from "../../core/products/application/use-cases/create-product.usecase";
import { GetAllCategoryUseCase } from "../../core/products/application/use-cases/get-all-category.usecase";
import { GetAllProductUseCase } from "../../core/products/application/use-cases/get-all-product.usecase";
import { UpdateCategoryUseCase } from "../../core/products/application/use-cases/update-category.usecase";
import { UpdateProductUseCase } from "../../core/products/application/use-cases/update-product.usecase";
import { PrismaCategoryRepository } from "../../core/products/infrastructure/persistence/prisma-category.repository";
import { PrismaProductRepository } from "../../core/products/infrastructure/persistence/prisma-product.repository";
import { CategoryController } from "../../core/products/presentation/category.controller";
import { ProductController } from "../../core/products/presentation/product.controller";
import { BcryptHashedService } from "../../core/shared/infrastructure/bcryptjs.service";
import { JwtService } from "../../core/shared/infrastructure/jwt.service";
import { MailtrapService } from "../../core/shared/infrastructure/mailtrap.service";
import { PrismaUserPlanRepository } from "../../core/users/infrastructure/persistence/prisma-user-plan.repository";
import { PrismaUserRepository } from "../../core/users/infrastructure/persistence/prisma-user.repository";
import { envConfig } from "../envs";
import { PrismaConnection } from "../prisma/prisma.connection";

const { JWT_SECRET } = envConfig;
const prismaClient = PrismaConnection.getInstance();

// 2. Servicios
const services = {
  mailService: new MailtrapService(),
  hashService: new BcryptHashedService(),
  tokenService: new JwtService(JWT_SECRET),
};

// 3. Repositorios
const repositories = {
  planRepository: new PrismaPlanRepository(prismaClient),
  userRepository: new PrismaUserRepository(prismaClient),
  userPlanRepository: new PrismaUserPlanRepository(prismaClient),
  farmRepository: new PrismaFarmRepository(prismaClient),
  breedRepository: new PrismaBreedRepository(prismaClient),
  reproductiveStateRepository: new PrismaReproductiveStateRepository(
    prismaClient
  ),
  phaseRepository: new PrismaPhaseRepository(prismaClient),
  categoryRepository: new PrismaCategoryRepository(prismaClient),
  productRepository: new PrismaProductRepository(prismaClient),
  notificationRepository: new PrismaNotificationRepository(prismaClient),
  pigRepository: new PrismaPigRepository(prismaClient),
  reproductiveHistoryRepository: new PrismaReproductiveHistory(prismaClient),
  birthRepository: new PrismaBirthRepository(prismaClient),
  settingRepository: new PrismaSettingRepository(prismaClient),
};

// casos de usos

const pigReproductiveCalculatorUseCase = new PigReproductiveCalculatorUseCase(
  repositories.settingRepository
);

const notificationUseCases = {
  createSowNotifications: new CreateSowNotificationsUseCase(
    repositories.notificationRepository,
    pigReproductiveCalculatorUseCase
  ),
  deleteSowNotifications: new DeleteSowNotificationUseCase(
    repositories.notificationRepository
  ),
};
const farmUseCases = {
  createFirst: new CreateFirstFarmUseCase(
    repositories.farmRepository,
    repositories.breedRepository,
    repositories.reproductiveStateRepository,
    repositories.phaseRepository,
    repositories.settingRepository,
    repositories.categoryRepository
  ),
  getAll: new GetAllFarmsUseCase(repositories.farmRepository),
};
const authUseCases = {
  signUp: new SignUpUseCase(
    services.hashService,
    services.mailService,
    repositories.userRepository,
    repositories.planRepository,
    repositories.userPlanRepository,
    farmUseCases.createFirst
  ),
  signIn: new SignInUseCase(
    repositories.userRepository,
    services.hashService,
    services.tokenService
  ),
  verifyAccount: new VerifyAccountUseCase(repositories.userRepository),
};
const breedUseCases = {
  create: new CreateBreedUseCase(
    repositories.breedRepository,
    repositories.farmRepository
  ),
  update: new UpdateBreedUseCase(repositories.breedRepository),
  getAll: new GetAllBreedUseCase(repositories.breedRepository),
};
const reproductiveStateUseCases = {
  create: new CreateReproductiveStateUseCase(
    repositories.reproductiveStateRepository
  ),
  update: new UpdateReproductiveStateUseCase(
    repositories.reproductiveStateRepository
  ),
  getAll: new GetAllReproductiveStateUseCase(
    repositories.reproductiveStateRepository
  ),
};
const phaseUseCases = {
  create: new CreatePhaseUseCase(repositories.phaseRepository),
  update: new UpdatePhaseUseCase(repositories.phaseRepository),
  getAll: new GetAllPhaseUseCase(repositories.phaseRepository),
};
const categoryUseCases = {
  create: new CreateCategoryUseCase(
    repositories.categoryRepository,
    repositories.farmRepository
  ),
  update: new UpdateCategoryUseCase(repositories.categoryRepository),
  getAll: new GetAllCategoryUseCase(repositories.categoryRepository),
};
const productUseCases = {
  create: new CreateProductUseCase(
    repositories.productRepository,
    repositories.categoryRepository,
    repositories.farmRepository
  ),
  update: new UpdateProductUseCase(
    repositories.productRepository,
    repositories.categoryRepository,
    repositories.farmRepository
  ),
  getAll: new GetAllProductUseCase(repositories.productRepository),
};

const pigUseCases = {
  create: new CreatePigUseCase(
    repositories.farmRepository,
    repositories.breedRepository,
    repositories.phaseRepository,
    repositories.pigRepository,
    repositories.reproductiveStateRepository,
    pigReproductiveCalculatorUseCase,
    notificationUseCases.createSowNotifications,
    repositories.settingRepository
  ),
  update: new UpdatePigUseCase(
    repositories.farmRepository,
    repositories.breedRepository,
    repositories.phaseRepository,
    repositories.pigRepository,
    repositories.productRepository,
    repositories.reproductiveStateRepository,
    pigReproductiveCalculatorUseCase,
    notificationUseCases.createSowNotifications,
    repositories.settingRepository
  ),
  getAll: new GetAllPigUseCase(repositories.pigRepository),
};

// 5. Controladores
const controllers = {
  authCtrl: new AuthController(
    authUseCases.signUp,
    authUseCases.signIn,
    authUseCases.verifyAccount
  ),
  farmCtrl: new FarmController(farmUseCases.createFirst, farmUseCases.getAll),
  breedCtrl: new BreedController(
    breedUseCases.create,
    breedUseCases.update,
    breedUseCases.getAll
  ),
  reproductiveStateCtrl: new ReproductiveStateController(
    reproductiveStateUseCases.create,
    reproductiveStateUseCases.update,
    reproductiveStateUseCases.getAll
  ),
  phaseCtrl: new PhaseController(
    phaseUseCases.create,
    phaseUseCases.update,
    phaseUseCases.getAll
  ),
  categoryCtrl: new CategoryController(
    categoryUseCases.create,
    categoryUseCases.update,
    categoryUseCases.getAll
  ),
  productCtrl: new ProductController(
    productUseCases.create,
    productUseCases.update,
    productUseCases.getAll
  ),
  pigCtrl: new PigController(
    pigUseCases.create,
    pigUseCases.getAll,
    pigUseCases.update
  ),
};

export const dependencyInjection = { controllers };
