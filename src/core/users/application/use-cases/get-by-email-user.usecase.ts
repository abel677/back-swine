import { UserRepository } from "../../domain/contracts/user.repository";

export class GetByEmailUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}
  async execute(email: string) {
    return await this.userRepository.getByEmail(email);
  }
}
