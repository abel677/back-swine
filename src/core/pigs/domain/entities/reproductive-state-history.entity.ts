import { ReproductiveState } from "../../../farms/domain/entities/reproductive-state.entity";
import { Birth } from "./birth.entity";

interface ReproductiveHistoryProps {
  sequential: number;
  reproductiveState: ReproductiveState;
  startDate: Date;
  endDate: Date;
  sowId: string;
  births: Birth[];
  boarId: string;
}

interface CreateReproductiveHistoryProps
  extends Omit<ReproductiveHistoryProps, "sequential" | "births"> {}

export class ReproductiveHistory {
  private constructor(
    public readonly id: string,
    public readonly props: ReproductiveHistoryProps
  ) {}

  static create(props: CreateReproductiveHistoryProps) {
    return new ReproductiveHistory(crypto.randomUUID(), {
      ...props,
      sequential: 1,
      births: [],
    });
  }
  static fromPrimitives(
    data: { id: string } & ReproductiveHistoryProps
  ): ReproductiveHistory {
    return new ReproductiveHistory(data.id, {
      ...data,
    });
  }

  addBirth(birth: Birth) {
    this.props.births.unshift(birth);
  }

  get sequential() {
    return this.props.sequential;
  }
  get reproductiveState() {
    return this.props.reproductiveState;
  }
  get startDate() {
    return this.props.startDate;
  }
  get endDate() {
    return this.props.endDate;
  }
  get sowId() {
    return this.props.sowId;
  }
  get births() {
    return this.props.births;
  }
  get boarId() {
    return this.props.boarId;
  }
}
