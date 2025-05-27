import { HashedService } from "../../../shared/domain/hashed-service.port";
import { TokenService } from "../../../shared/domain/token-service.port";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { UserResponseDto } from "../../../users/application/dtos/user-response.dto";
import { UserRepository } from "../../../users/domain/contracts/user.repository";
import { SignInDto } from "../dtos/sign-in.dto";

export class SignInUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashedService,
    private readonly tokenService: TokenService
  ) {}

  async execute(dto: SignInDto) {
    const user = await this.userRepository.getByEmail(dto.email);
    if (!user) throw ApiError.unauthorize("Credenciales inválidas.");

    const matchPassword = await this.hashService.compare(
      dto.password,
      user.password
    );
    if (!matchPassword) {
      throw ApiError.unauthorize("Credenciales inválidas.");
    }

    if (!user.validated) {
      throw ApiError.unauthorize(
        "Por favor revise su bandeja de entrada y siga las instrucciones para validar su cuenta."
      );
    }

    const token = await this.tokenService.generateToken({ id: user.id });
    return {
      token: token,
      user: UserResponseDto.toHttpResponse(user),
    };
  }
}
