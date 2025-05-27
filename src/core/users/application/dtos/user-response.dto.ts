import { User } from "../../domain/entities/user.entity";

export class UserResponseDto {
  private constructor(
    public readonly id: string,
    //public readonly name: string,
    public readonly email: string,
    public readonly isOwner: boolean,
    public readonly state: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static toHttpResponse(user: User) {
    return new UserResponseDto(
      user.id,
      //user.name,
      user.email,
      user.isOwner,
      user.state,
      user.createdAt,
      user.updatedAt
    );
  }
}
