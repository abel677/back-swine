import { DomainDateTime } from "../../../shared/domain-datetime";

export interface SettingProps {
  farmId: string;
  matingHeatDurationDays: number;
  inseminationDurationDays: number;
  gestationDurationDays: number;
  lactationDurationDays: number;
  weaningDurationDays: number;
  restingDurationDays: number;
  initialPigletPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingCreateProps
  extends Omit<SettingProps, "createdAt" | "updatedAt"> {}

export class Setting {
  private constructor(
    public readonly id: string,
    private readonly props: SettingProps
  ) {}

  static create(props: SettingCreateProps): Setting {
    const now = DomainDateTime.now();
    return new Setting(crypto.randomUUID(), {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPrimitives(data: { id: string } & SettingProps) {
    return new Setting(data.id, data);
  }

  get farmId() {
    return this.props.farmId;
  }

  get matingHeatDurationDays() {
    return this.props.matingHeatDurationDays;
  }

  get inseminationDurationDays() {
    return this.props.inseminationDurationDays;
  }

  get gestationDurationDays() {
    return this.props.gestationDurationDays;
  }

  get lactationDurationDays() {
    return this.props.lactationDurationDays;
  }

  get weaningDurationDays() {
    return this.props.weaningDurationDays;
  }

  get restingDurationDays() {
    return this.props.restingDurationDays;
  }
  get initialPigletPrice() {
    return this.props.initialPigletPrice;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  updateDurations(
    update: Partial<Omit<SettingProps, "createdAt" | "updatedAt">>
  ): Setting {
    const now = DomainDateTime.now();
    return new Setting(this.id, {
      ...this.props,
      ...update,
      updatedAt: now,
    });
  }
}
