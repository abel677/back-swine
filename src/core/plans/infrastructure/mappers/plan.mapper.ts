import { Plan } from "../../domain/entities/plan.entity";

export class PlanMapper {
  static toDomain(data: {
    id: string;
    name: string;
    maxFarms: number;
    maxUsersPerFarm: number;
    price: number;
  }): Plan {
    return Plan.fromPrimitives({
      id: data.id,
      name: data.name,
      maxFarms: data.maxFarms,
      maxUsersPerFarm: data.maxUsersPerFarm,
      price: data.price,
    });
  }
}
