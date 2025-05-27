import bcrypt from "bcryptjs";
import { HashedService } from "../domain/hashed-service.port";

export class BcryptHashedService implements HashedService {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return await bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}
