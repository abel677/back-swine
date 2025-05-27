import { SettingRepository } from "../../../farms/domain/contracts/setting.repository";
import { DomainDateTime } from "../../../shared/domain-datetime";
import { PigReproductiveState } from "../../../shared/domain/enums";

interface ReproductiveTimeline {
  state: PigReproductiveState;
  startDate: Date;
  endDate: Date;
  nextState: PigReproductiveState;
  keyDates: {
    date: Date;
    description: string;
  }[];
}

export class PigReproductiveCalculatorUseCase {
  constructor(private readonly settingRepository: SettingRepository) {}

  private calculateHeatDates(
    startDate: Date = DomainDateTime.now(),
    durationDays: number
  ): ReproductiveTimeline {
    const endDate = DomainDateTime.addDays(startDate, durationDays);
    return {
      state: PigReproductiveState.Heat,
      startDate,
      endDate,
      nextState: PigReproductiveState.Insemination,
      keyDates: [
        {
          date: DomainDateTime.addDays(
            startDate,
            durationDays - (durationDays - 1)
          ),
          description: "Mejor momento para inseminación",
        },
        {
          date: DomainDateTime.addDays(startDate, durationDays - 1),
          description: "Fin de ventana fértil",
        },
      ],
    };
  }

  private calculateInseminationDates(
    startDate: Date,
    durationDays: number
  ): ReproductiveTimeline {
    const endDate = DomainDateTime.addDays(startDate, durationDays);
    return {
      state: PigReproductiveState.Insemination,
      startDate,
      endDate,
      nextState: PigReproductiveState.Gestation,
      keyDates: [
        {
          date: DomainDateTime.addDays(startDate, durationDays),
          description: "Ecografía de confirmación",
        },
      ],
    };
  }

  private calculateGestationDates(
    startDate: Date,
    durationDays: number
  ): ReproductiveTimeline {
    const endDate = DomainDateTime.addDays(startDate, durationDays);
    return {
      state: PigReproductiveState.Gestation,
      startDate,
      endDate,
      nextState: PigReproductiveState.Lactation,
      keyDates: [
        {
          date: DomainDateTime.addDays(startDate, 30),
          description: "Control de desarrollo fetal",
        },
        {
          date: DomainDateTime.addDays(startDate, 90),
          description: "Preparación parto",
        },
        {
          date: DomainDateTime.addDays(endDate, -7),
          description: "Última semana de gestación",
        },
        {
          date: DomainDateTime.addDays(endDate, -3),
          description: "Ventana estimada para el parto",
        },
      ],
    };
  }

  private calculateLactationDates(
    startDate: Date,
    durationDays: number
  ): ReproductiveTimeline {
    const endDate = DomainDateTime.addDays(startDate, durationDays);
    return {
      state: PigReproductiveState.Lactation,
      startDate,
      endDate,
      nextState: PigReproductiveState.Rest,
      keyDates: [
        {
          date: DomainDateTime.addDays(startDate, 7),
          description: "Primer control lechones",
        },
        {
          date: DomainDateTime.addDays(startDate, 14),
          description: "Inicio destete progresivo",
        },
      ],
    };
  }

  private calculateWeaningDates(startDate: Date): ReproductiveTimeline {
    const endDate = DomainDateTime.now();
    return {
      state: PigReproductiveState.Weaning,
      startDate,
      endDate,
      nextState: PigReproductiveState.Rest,
      keyDates: [],
    };
  }

  private calculateRestPeriod(
    startDate: Date,
    durationDays: number
  ): ReproductiveTimeline {
    const endDate = DomainDateTime.addDays(startDate, durationDays);
    return {
      state: PigReproductiveState.Rest,
      startDate,
      endDate,
      nextState: PigReproductiveState.Heat,
      keyDates: [
        {
          date: DomainDateTime.addDays(startDate, durationDays - 2),
          description: "Preparación próximo ciclo",
        },
      ],
    };
  }

  private validateStateDuration(
    state: PigReproductiveState,
    startDate: Date,
    endDate: Date
  ): boolean {
    const maxDurations = {
      [PigReproductiveState.Heat]: 3,
      [PigReproductiveState.Insemination]: 30,
      [PigReproductiveState.Gestation]: 115,
      [PigReproductiveState.Lactation]: 28,
      [PigReproductiveState.Rest]: 7,
    };

    const duration = Math.abs(
      DomainDateTime.differenceInDays(startDate, endDate)
    );
    return duration <= maxDurations[state];
  }

  // calculateFullCycle(
  //   startDate: Date = DomainDateTime.now()
  // ): ReproductiveTimeline[] {
  //   const cycle = [];
  //   let currentDate = startDate;

  //   const states = [
  //     PigReproductiveState.Heat,
  //     PigReproductiveState.Insemination,
  //     PigReproductiveState.Gestation,
  //     PigReproductiveState.Lactation,
  //     PigReproductiveState.Weaning,
  //     PigReproductiveState.Rest,
  //   ];

  //   for (const state of states) {
  //     const timeline = this.calculateStateTimeline(state, currentDate);
  //     cycle.push(timeline);
  //     currentDate = timeline.endDate;
  //   }

  //   return cycle;
  // }

  async execute(
    farmId: string,
    state: PigReproductiveState,
    startDate: Date
  ): Promise<ReproductiveTimeline> {
    const setting = await this.settingRepository.getByFarmId(farmId);
    switch (state) {
      case PigReproductiveState.Heat:
        return this.calculateHeatDates(
          startDate,
          setting.matingHeatDurationDays
        );
      case PigReproductiveState.Insemination:
        return this.calculateInseminationDates(
          startDate,
          setting.inseminationDurationDays
        );
      case PigReproductiveState.Gestation:
        return this.calculateGestationDates(
          startDate,
          setting.gestationDurationDays
        );

      case PigReproductiveState.Lactation:
        return this.calculateLactationDates(
          startDate,
          setting.lactationDurationDays
        );
      case PigReproductiveState.Weaning:
        return this.calculateWeaningDates(startDate);
      case PigReproductiveState.Rest:
        return this.calculateRestPeriod(startDate, setting.restingDurationDays);
      default:
        throw new Error("Invalid reproductive state");
    }
  }
}
