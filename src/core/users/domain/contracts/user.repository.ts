import { User } from "../entities/user.entity";

export interface UserRepository {
  update(user: User): Promise<void>;
  create(user: User): Promise<void>;
  getByVerificationToken(token: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  //getByName(name: string): Promise<User | null>;
}
