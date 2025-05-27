import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../domain/contracts/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserMapper } from "../mappers/user.mapper";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: UserMapper.toPersistence(user),
    });
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
    });
  }

  async getByVerificationToken(token: string): Promise<User | null> {
    const entity = await this.prisma.user.findFirst({
      where: { verificationToken: token },
      include: {
        userPlan: true,
      },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async getByEmail(email: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userPlan: true,
      },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  // async getByName(name: string): Promise<User | null> {
  //   const entity = await this.prisma.user.findUnique({
  //     where: { name },
  //     include: {
  //       userPlan: true,
  //     },
  //   });
  //   if (!entity) return null;
  //   return UserMapper.toDomain(entity);
  // }

  async getById(id: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userPlan: true,
      },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }
}
