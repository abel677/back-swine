import { Phase } from "../../../farms/domain/entities/phase.entity";
import { DomainDateTime } from "../../../shared/domain-datetime";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { Pig } from "./pig.entity";

export interface BirthProps {
  reproductiveHistoryId: string;
  birthDate: Date;
  malePiglets: number;
  femalePiglets: number;
  deadPiglets: number;
  averageLitterWeight: number;

  // no obligatorios para creación
  description?: string;
  numberBirth: number;
  isLitterWeaned: boolean;
  piglets: Pig[];
  createdAt: Date;
  updatedAt: Date;
}

interface CreateBirthProps
  extends Omit<
    BirthProps,
    "numberBirth" | "isLitterWeaned" | "piglets" | "createdAt" | "updatedAt"
  > {}

export class Birth {
  private constructor(
    public readonly id: string,
    private readonly props: BirthProps
  ) {}

  static fromPrimitives(data: { id: string } & BirthProps): Birth {
    return new Birth(data.id, {
      ...data,
    });
  }
  static validate(props: CreateBirthProps) {
    if (
      props.femalePiglets <= 0 &&
      props.malePiglets <= 0 &&
      props.averageLitterWeight > 0
    ) {
      throw ApiError.badRequest(
        "averageLitterWeight: No se encontraron lechones, no puede agregar un peso mayor a cero."
      );
    }
  }

  static create(props: CreateBirthProps) {
    this.validate(props);
    const currentDate = DomainDateTime.now();
    return new Birth(crypto.randomUUID(), {
      ...props,
      numberBirth: 1,
      isLitterWeaned: false,
      piglets: [],
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }

  saveNumberBirth(numberBirth: number) {
    this.props.numberBirth = numberBirth;
  }

  savePiglet(pig: Pig) {
    const index = this.props.piglets.findIndex(
      (piglet) => piglet.id === pig.id
    );
    if (index !== -1) {
      this.props.piglets[index] = pig;
    } else {
      this.props.piglets.unshift(pig);
    }
    this.updateTimeStamps();
  }

  weanLitter(phaseStarter: Phase): void {
    this.props.isLitterWeaned = true;
    this.updateTimeStamps();

    this.props.piglets.forEach((piglet) => {
      const ageDays = this.calculatePigletAge();
      piglet.savePhase(phaseStarter);
      piglet.saveAgeDays(ageDays);
    });
  }

  private calculatePigletAge(): number {
    return DomainDateTime.differenceInDays(
      this.props.birthDate,
      DomainDateTime.now()
    );
  }
  private updateTimeStamps() {
    this.props.updatedAt = DomainDateTime.now();
  }

  get reproductiveHistoryId() {
    return this.props.reproductiveHistoryId;
  }
  get description() {
    return this.props.description;
  }
  get numberBirth() {
    return this.props.numberBirth;
  }
  get birthDate() {
    return this.props.birthDate;
  }
  get malePiglets() {
    return this.props.malePiglets;
  }
  get femalePiglets() {
    return this.props.femalePiglets;
  }
  get deadPiglets() {
    return this.props.deadPiglets;
  }
  get averageLitterWeight() {
    return this.props.averageLitterWeight;
  }
  get isLitterWeaned() {
    return this.props.isLitterWeaned;
  }
  get piglets() {
    return this.props.piglets;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
