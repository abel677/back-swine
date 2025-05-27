import { DomainDateTime } from "../../../shared/domain-datetime";

export class Farm {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly ownerId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(props: { name: string; ownerId: string }) {
    return new Farm(
      crypto.randomUUID(),
      props.name,
      props.ownerId,
      DomainDateTime.now(),
      DomainDateTime.now()
    );
  }

  static fromPrimitives(props: {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Farm {
    return new Farm(
      props.id,
      props.name,
      props.ownerId,
      props.createdAt,
      props.updatedAt
    );
  }
}
