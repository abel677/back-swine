import { envConfig } from "../../../../config/envs";
import { HashedService } from "../../../shared/domain/hashed-service.port";
import { MailService } from "../../../shared/domain/mail-service.port";
import { ApiError } from "../../../shared/exceptions/custom-error";
import fs from "fs";
import { SignUpDto } from "../dtos/sign-up.dto";
import { PlanRepository } from "../../../plans/domain/contracts/plan.repository";
import { UserPlan } from "../../../users/domain/entities/user-plan.entity";
import { UserPlanRepository } from "../../../users/domain/contracts/user-plan.repository";
import { UserRepository } from "../../../users/domain/contracts/user.repository";
import { User } from "../../../users/domain/entities/user.entity";
import { CreateFirstFarmUseCase } from "../../../farms/application/use-cases/create-first-farm.usecase";

const { DOMAIN } = envConfig;

export class SignUpUseCase {
  constructor(
    private readonly hashService: HashedService,
    private readonly emailService: MailService,
    private readonly userRepository: UserRepository,
    private readonly planRepository: PlanRepository,
    private readonly userPlansRepository: UserPlanRepository,
    private readonly createFirstFarmUseCase: CreateFirstFarmUseCase
  ) {}

  async execute(dto: SignUpDto) {
    const plan = await this.planRepository.getByName("Free");
    if (!plan) {
      throw ApiError.notFound("Ocurrió un error, comuniquese con soporte.");
    }

    const alreadyExist = await this.userRepository.getByEmail(dto.email);
    if (alreadyExist) {
      return this.sendEmail(alreadyExist);
    }

    const passwordHashed = await this.hashService.hash(dto.password);
    const user = User.create({
      email: dto.email,
      isOwner: true,
      password: passwordHashed,
    });
    await this.userRepository.create(user);

    const userPlan = UserPlan.create({
      userId: user.id,
      planId: plan.id,
    });

    await this.userPlansRepository.create(userPlan);
    await this.createFirstFarmUseCase.execute({
      name: dto.email,
      ownerId: user.id,
    });
    return this.sendEmail(user);
  }

  private async sendEmail(user: User) {
    try {
      const verificationLink = `${DOMAIN}/auth/verify/${user.verificationToken}`;
      const templatePath =
        process.cwd() + "/src/core/shared/presentation/verification-email.html";
      let emailBody = fs.readFileSync(templatePath, "utf-8");
      emailBody = emailBody.replace("{{verificationLink}}", verificationLink);

      await this.emailService.send({
        to: { name: user.email, email: user.email },
        from: {
          name: "EQUIPO PIG MANAGEMENT",
          email: "abelandrade677@gmail.com",
        },
        subject: "Verifica tu cuenta",
        body: emailBody,
      });
    } catch (error) {
      throw ApiError.internalServer(
        "Ocurrió un error al enviar el correo electrónico."
      );
    }
    return {
      message:
        "Se ha enviado un correo de verificación. Por favor revise su bandeja de entrada y siga las instrucciones para validar su cuenta.",
    };
  }
}
