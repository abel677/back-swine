export class Plan {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _maxFarms: number,
    private readonly _maxUsersPerFarm: number,
    private readonly _price: number
  ) {}

  static create(
    id: string,
    name: string,
    maxFarms: number,
    maxUsersPerFarm: number,
    price: number
  ): Plan {
    return new Plan(id, name, maxFarms, maxUsersPerFarm, price);
  }

  static fromPrimitives(props: {
    id: string;
    name: string;
    maxFarms: number;
    maxUsersPerFarm: number;
    price: number;
  }): Plan {
    return new Plan(
      props.id,
      props.name,
      props.maxFarms,
      props.maxUsersPerFarm,
      props.price
    );
  }


  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get maxFarms() {
    return this._maxFarms;
  }

  get maxUsersPerFarm() {
    return this._maxUsersPerFarm;
  }

  get price() {
    return this._price;
  }
}
