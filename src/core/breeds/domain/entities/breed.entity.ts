import { DomainDateTime } from "../../../shared/domain-datetime";

export class Breed {
  private constructor(
    public readonly id: string,
    public readonly farmId: string,
    private _name: string,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  get updatedAt() {
    return this._updatedAt;
  }

  get name() {
    return this._name;
  }

  setName(name: string) {
    this._name = name;
    this._updatedAt = DomainDateTime.now();
  }
  static create(props: { name: string; farmId: string }) {
    const currentDate = DomainDateTime.now();

    return new Breed(
      crypto.randomUUID(),
      props.farmId,
      props.name,
      currentDate,
      currentDate
    );
  }

  static fromPrimitives(props: {
    id: string;
    name: string;
    farmId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Breed {
    return new Breed(
      props.id,
      props.farmId,
      props.name,
      props.createdAt,
      props.updatedAt
    );
  }
}
