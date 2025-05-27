import { ReproductiveHistory } from "../entities/reproductive-state-history.entity";

export interface ReproductiveHistoryRepository {
  getAllBySowId(sowId: string): Promise<ReproductiveHistory[]>;
  getOneBySowId(sowId: string): Promise<ReproductiveHistory | null>;
  create(reproductiveHistory: ReproductiveHistory): Promise<void>;
}
