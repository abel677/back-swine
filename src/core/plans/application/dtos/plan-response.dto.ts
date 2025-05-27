export class PlanResponseDto {
  private constructor(
    public id: string,
    public name: string,
    public maxFarms: number,
    public maxUsersPerFarm: number,
    public price: number
  ) {}
}
