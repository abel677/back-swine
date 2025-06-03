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
import { PigProduct } from "./pig-product.entity";
import { PigWeight } from "./pig-weight";
import { ReproductiveHistory } from "./reproductive-state-history.entity";

export interface PigProps {
  type: PigType;
  sex: PigSex;
  farm: Farm;
  phase: Phase;
  breed: Breed;
  code: string;
  ageDays: number;
  initialPrice: number;
  investedPrice: number;
  weights: PigWeight[];
  pigProducts: PigProduct[];
  state: PigState;
  createdAt: Date;
  updatedAt: Date;

  // datos de reproductora
  currentSowReproductiveHistory?: ReproductiveHistory;
  sowReproductiveHistory?: ReproductiveHistory[];

  // datos de lechones
  motherId?: string;
  fatherId?: string;
  birthId?: string;
}

interface CreatePigProps
  extends Omit<
    PigProps,
    | "investedPrice"
    | "weights"
    | "pigProducts"
    | "state"
    | "createdAt"
    | "updatedAt"
    | "currentSowReproductiveHistory"
    | "sowReproductiveHistory"
  > {}

export class Pig {
  private constructor(public readonly id: string, private props: PigProps) {}

  static fromPrimitives(data: { id: string } & PigProps) {
    return new Pig(data.id, { ...data });
  }

  static create(props: CreatePigProps) {
    const id = crypto.randomUUID();
    const currentDate = DomainDateTime.now();

    return new Pig(id, {
      ...props,
      investedPrice: 0,
      weights: [],
      pigProducts: [],
      state: PigState.Alive,
      createdAt: currentDate,
      updatedAt: currentDate,
      // datos para reproductoras
      sowReproductiveHistory: [],
      currentSowReproductiveHistory: undefined,
    });
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

  saveFarm(farm: Farm) {
    this.props.farm = farm;
    this.updateTimestamp();
  }
  savePhase(phase: Phase) {
    this.props.phase = phase;
    this.updateTimestamp();
  }
  saveBreed(newBreed: Breed) {
    this.props.breed = newBreed;
    this.updateTimestamp();
  }
  saveCode(code: string) {
    this.props.code = code;
  }
  saveAgeDays(ageDays: number) {
    this.props.ageDays = ageDays;
    this.updateTimestamp();
  }
  saveInitialPrice(initialPrice: number) {
    this.props.initialPrice = initialPrice;
  }
  saveWeight(pigWeight: PigWeight) {
    const index = this.props.weights.findIndex((w) => w.id === pigWeight.id);
    if (index !== -1) {
      this.props.weights[index] = pigWeight;
      this.updateTimestamp();
    } else {
      this.props.weights.unshift(pigWeight);
    }
  }
  savePigProduct(pigProduct: PigProduct) {
    const index = this.props.pigProducts.findIndex(
      (p) => p.id === pigProduct.id
    );

    if (index !== -1) {
      const previousPrice = this.pigProducts[index].price;
      const newPrice = pigProduct.price;
      this.props.investedPrice += newPrice - previousPrice;
      this.pigProducts[index] = pigProduct;
      this.updateTimestamp();
    } else {
      this.props.investedPrice += pigProduct.price;
      this.props.pigProducts.unshift(pigProduct);
    }
  }
  saveState(state: PigState) {
    this.props.state = state;
  }
  private updateTimestamp() {
    this.props.updatedAt = DomainDateTime.now();
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

  saveCurrentSowReproductiveHistory(
    currentSowReproductiveHistory: ReproductiveHistory
  ) {
    this.props.currentSowReproductiveHistory = currentSowReproductiveHistory;
  }
  saveSowReproductiveHistory(sowReproductiveHistory: ReproductiveHistory) {
    if (!this.isSow()) {
      throw ApiError.badRequest(
        "Sexo inválido para asignar estado reproductivo."
      );
    }
    if (this.cannotAssignReproductiveState()) {
      throw ApiError.badRequest(
        "Cerda reproductora no acta para asignar estado reproductivo."
      );
    }
    const index = this.props.sowReproductiveHistory.findIndex(
      (srh) => srh.id === sowReproductiveHistory.id
    );
    if (index !== -1) {
      this.props.sowReproductiveHistory[index] = sowReproductiveHistory;
      this.updateTimestamp();
    } else {
      this.sowReproductiveHistory.unshift(sowReproductiveHistory);
      this.saveCurrentSowReproductiveHistory(sowReproductiveHistory);
    }
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
  get pigProducts() {
    return this.props.pigProducts;
  }
  get sowReproductiveHistory() {
    return this.props.sowReproductiveHistory;
  }
  get currentSowReproductiveHistory() {
    return this.props.currentSowReproductiveHistory;
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
