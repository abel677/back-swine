import { DomainDateTime } from "../../../shared/domain-datetime";

export class Phase {
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
  static create(props: { farmId: string; name: string }) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new Phase(id, props.farmId, props.name, currentDate, currentDate);
  }

  static fromPrimitives(props: {
    id: string;
    farmId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Phase(
      props.id,
      props.farmId,
      props.name,
      props.createdAt,
      props.updatedAt
    );
  }
}
