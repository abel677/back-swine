import { Phase } from "../../../farms/domain/entities/phase.entity";
import { DomainDateTime } from "../../../shared/domain-datetime";
import { ApiError } from "../../../shared/exceptions/custom-error";
import { Pig } from "./pig.entity";

export interface BirthProps {
  reproductiveHistoryId: string;
  numberBirth: number;
  birthDate: Date;
  malePiglets: number;
  femalePiglets: number;
  deadPiglets: number;
  averageLitterWeight: number;
  isLitterWeaned: boolean;
  createdAt: Date;
  updatedAt: Date;
  piglets: Pig[];
}

interface CreateBirthProps
  extends Omit<
    BirthProps,
    "isLitterWeaned" | "createdAt" | "updatedAt" | "piglets"
  > {}

export class Birth {
  private constructor(
    public readonly id: string,
    private readonly props: BirthProps
  ) {}

  static create(props: CreateBirthProps) {
    const currentDate = DomainDateTime.now();
    return new Birth(crypto.randomUUID(), {
      ...props,
      isLitterWeaned: false,
      piglets: [],
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  }
  static fromPrimitives(data: { id: string } & BirthProps): Birth {
    return new Birth(data.id, {
      ...data,
    });
  }

  private updateTimeStamps() {
    this.props.updatedAt = DomainDateTime.now();
  }

  private calculatePigletAge(): number {
    return DomainDateTime.differenceInDays(
      this.props.birthDate,
      DomainDateTime.now()
    );
  }

  addPiglet(piglet: Pig) {
    this.props.piglets.unshift(piglet);
    this.updateTimeStamps();
  }

  updatePiglet(id: string, piglet: Pig) {
    const index = this.props.piglets.findIndex((p) => p.id === id);
    if (!index) throw ApiError.notFound("Cerdo no encontrado");
    this.props.piglets[index] = piglet;
    this.updateTimeStamps();
  }

  weanLitter(phaseStarter: Phase): void {
    if (this.props.isLitterWeaned) {
      throw ApiError.badRequest("La camada ya está marcado como destetada.");
    }

    this.props.isLitterWeaned = true;
    this.updateTimeStamps();

    this.props.piglets.forEach((piglet) => {
      const ageDays = this.calculatePigletAge();
      piglet.updatePhase(phaseStarter);
      piglet.updateAgeDays(ageDays);
    });
  }

  get reproductiveHistoryId() {
    return this.props.reproductiveHistoryId;
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
