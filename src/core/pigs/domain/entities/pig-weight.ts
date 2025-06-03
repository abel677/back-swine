import { DomainDateTime } from "../../../shared/domain-datetime";

interface PigWightProps {
  pigId: string;
  days: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePigWeight = Omit<PigWightProps, "createdAt" | "updatedAt">;

export class PigWeight {
  private constructor(
    public readonly id: string,
    private readonly props: PigWightProps
  ) {}

  static create(props: CreatePigWeight) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();
    return new PigWeight(id, {
      ...props,
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }

  static fromPrimitives(data: { id: string } & PigWightProps): PigWeight {
    return new PigWeight(data.id, {
      ...data,
    });
  }

  get pigId() {
    return this.props.pigId;
  }

  get days() {
    return this.props.days;
  }

  get weight() {
    return this.props.weight;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
