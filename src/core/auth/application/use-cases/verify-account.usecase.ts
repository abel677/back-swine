import { ApiError } from "../../../shared/exceptions/custom-error";
import { UserRepository } from "../../../users/domain/contracts/user.repository";

export class VerifyAccountUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string) {
    const user = await this.userRepository.getByVerificationToken(token);
    if (!user) {
      throw ApiError.unauthorize("No se puedo verificar la cuenta.");
    }
    user.resetVerificationToken();
    user.validate();
    user.updateUpdatedAt();
    await this.userRepository.update(user);

    return {
      message: "Cuenta verifica con exito. Ya puede iniciar sesión.",
    };
  }
}
