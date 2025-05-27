import { Breed } from "../../../breeds/domain/entities/breed.entity";
import { Farm } from "../../../farms/domain/entities/farm.entity";
import { Phase } from "../../../farms/domain/entities/phase.entity";
import { DomainDateTime } from "../../../shared/domain-datetime";
import {
  PigPhase,
  PigSex,
  PigState,
  PigType,
} from "../../../shared/domain/enums";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { PigWeight } from "./pig-weight";
import { ReproductiveHistory } from "./reproductive-state-history.entity";

export interface PigProps {
  farm: Farm;
  type: PigType;
  sex: PigSex;
  phase: Phase;
  breed: Breed;
  code: string;
  ageDays: number;
  initialPrice: number;
  investedPrice: number;
  weights: PigWeight[];
  sowReproductiveHistory: ReproductiveHistory[];
  state: PigState;
  motherId?: string;
  fatherId?: string;
  birthId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreatePigProps
  extends Omit<
    PigProps,
    | "weights"
    | "investedPrice"
    | "sowReproductiveHistory"
    | "state"
    | "createdAt"
    | "updatedAt"
  > {}

export class Pig {
  private constructor(public readonly id: string, private props: PigProps) {}

  static create(props: CreatePigProps) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new Pig(id, {
      ...props,
      investedPrice: 0,
      state: PigState.Alive,
      weights: [],
      sowReproductiveHistory: [],
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }

  static fromPrimitives(data: { id: string } & PigProps) {
    return new Pig(data.id, { ...data });
  }

  private updateTimestamp() {
    this.props.updatedAt = DomainDateTime.now();
  }

  isSow() {
    const sex = this.sex;
    const type = this.type;
    if (sex === PigSex.Female && type === PigType.Reproduction) {
      return true;
    }
    return false;
  }
  isBoar() {
    const sex = this.sex;
    const type = this.type;
    if (sex === PigSex.Male && type === PigType.Reproduction) {
      return true;
    }
    return false;
  }

  cannotAssignReproductiveState(): boolean {
    const forbiddenPhases: PigPhase[] = [
      PigPhase.Neonatal,
      PigPhase.Weaning,
      PigPhase.Starter,
    ];
    return (
      this.props.ageDays < 150 ||
      forbiddenPhases.includes(this.props.phase.name as PigPhase)
    );
  }

  addSowReproductiveHistory(history: ReproductiveHistory) {
    if (!this.isSow()) {
      throw ApiError.badRequest(
        "No se puede asignar un estado reproductivo a un cerdo que no sea reproductora."
      );
    }

    if (this.cannotAssignReproductiveState()) {
      throw ApiError.badRequest(
        "No se puede asignar un estado reproductivo por edad o fase no permitida."
      );
    }
    this.props.sowReproductiveHistory.unshift(history);
  }

  updatePhase(newPhase: Phase) {
    this.props.phase = newPhase;
    this.updateTimestamp();
  }

  updateBreed(newBreed: Breed) {
    this.props.breed = newBreed;
    this.updateTimestamp();
  }

  addWeight(weight: PigWeight) {
    this.props.weights.unshift(weight);
  }

  updateWeight(weightId: string, newValue: PigWeight) {
    let index = this.props.weights.findIndex((w) => w.id === weightId);
    if (!index) throw ApiError.notFound(`Peso no encontrado`);
    this.props.weights[index] = newValue;
    this.updateTimestamp();
  }

  updateAgeDays(ageDays: number) {
    this.props.ageDays = ageDays;
    this.updateTimestamp();
  }

  get farm() {
    return this.props.farm;
  }

  get type() {
    return this.props.type;
  }
  get sex() {
    return this.props.sex;
  }
  get phase() {
    return this.props.phase;
  }
  get breed() {
    return this.props.breed;
  }
  get code() {
    return this.props.code;
  }
  get ageDays() {
    return this.props.ageDays;
  }
  get initialPrice() {
    return this.props.initialPrice;
  }
  get investedPrice() {
    return this.props.investedPrice;
  }
  get state() {
    return this.props.state;
  }
  get weights() {
    return this.props.weights;
  }
  get sowReproductiveHistory() {
    return this.props.sowReproductiveHistory;
  }
  get motherId() {
    return this.props.motherId;
  }
  get fatherId() {
    return this.props.fatherId;
  }
  get birthId() {
    return this.props.birthId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
