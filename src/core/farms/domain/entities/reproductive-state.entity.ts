import { DomainDateTime } from "../../../shared/domain-datetime";

export class ReproductiveState {
  private constructor(
    public readonly id: string,
    public readonly farmId: string,
    private _name: string,
    private _order: number,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  get updatedAt() {
    return this._updatedAt;
  }

  get order() {
    return this._order;
  }
  get name() {
    return this._name;
  }

  setName(name: string) {
    this._name = name;
    this._updatedAt = DomainDateTime.now();
  }

  static create(props: { farmId: string; name: string; order: number }) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new ReproductiveState(
      id,
      props.farmId,
      props.name,
      props.order,
      currentDate,
      currentDate
    );
  }

  static fromPrimitives(props: {
    id: string;
    farmId: string;
    name: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new ReproductiveState(
      props.id,
      props.farmId,
      props.name,
      props.order,
      props.createdAt,
      props.updatedAt
    );
  }
}
