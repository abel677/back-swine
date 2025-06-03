import { ReproductiveState } from "../../../farms/domain/entities/reproductive-state.entity";
import { Birth } from "./birth.entity";

interface ReproductiveHistoryProps {
  sequential: number;
  reproductiveState: ReproductiveState;
  startDate: Date;
  endDate: Date;
  sowId: string;
  birth: Birth;
  boarId: string;
}

interface CreateReproductiveHistoryProps
  extends Omit<ReproductiveHistoryProps,"birth"> {}

export class ReproductiveHistory {
  private constructor(
    public readonly id: string,
    private readonly props: ReproductiveHistoryProps
  ) {}

  static create(props: CreateReproductiveHistoryProps) {
    return new ReproductiveHistory(crypto.randomUUID(), {
      ...props,
      birth: null,
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
    this.props.birth = birth;
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
  get birth() {
    return this.props.birth;
  }
  get boarId() {
    return this.props.boarId;
  }
}
