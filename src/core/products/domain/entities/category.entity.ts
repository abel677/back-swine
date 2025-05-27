import { DomainDateTime } from "../../../shared/domain-datetime";

export class Category {
  private constructor(
    public readonly id: string,
    public readonly farmId: string,
    private _name: string,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  get name() {
    return this._name;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  update(props: { name?: string; farmId?: string }) {
    if (props.name !== undefined) {
      this._name = props.name;
    }

    this._updatedAt = DomainDateTime.now();
  }

  static create(props: { farmId: string; name: string }) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();
    return new Category(id, props.farmId, props.name, currentDate, currentDate);
  }

  static fromPrimitives(props: {
    id: string;
    farmId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return new Category(
      props.id,
      props.farmId,
      props.name,
      props.createdAt,
      props.updatedAt
    );
  }
}
