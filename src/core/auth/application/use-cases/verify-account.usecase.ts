import { ApiError } from "../../../shared/exceptions/custom-error";
import { UserResponseDto } from "../../../users/application/dtos/user-response.dto";
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
      token: token,
      user: UserResponseDto.toHttpResponse(user),
    };
  }
}
