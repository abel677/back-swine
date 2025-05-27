import { ApiError } from "../../../shared/exceptions/custom-error";
import { UserRepository } from "../../domain/contracts/user.repository";
import { User } from "../../domain/entities/user.entity";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: {
    name: string;
    email: string;
    password: string;
    isOwner: boolean;
  }) {
    const alreadyExist = await this.userRepository.getByEmail(dto.email);
    if (alreadyExist) {
      throw ApiError.badRequest("No se pudo crear el usuario.");
    }

    const user = User.create({
        email: dto.email,
      isOwner: dto.isOwner,
      password: dto.password,
    });
    await this.userRepository.create(user);

    return user;
  }
}
