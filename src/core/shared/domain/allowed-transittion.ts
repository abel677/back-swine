import { PigReproductiveState } from "./enums";

export const ALLOWED_TRANSITIONS: Readonly<
  Record<PigReproductiveState, readonly PigReproductiveState[]>
> = {
  [PigReproductiveState.Rest]: [
    PigReproductiveState.Heat,
    PigReproductiveState.Insemination,
    PigReproductiveState.Gestation,
    PigReproductiveState.Lactation,
    PigReproductiveState.Weaning,
  ] as const,
  [PigReproductiveState.Heat]: [
    PigReproductiveState.Insemination,
    PigReproductiveState.Rest,
  ] as const,
  [PigReproductiveState.Insemination]: [
    PigReproductiveState.Gestation,
    PigReproductiveState.Rest,
  ] as const,
  [PigReproductiveState.Gestation]: [PigReproductiveState.Lactation] as const,
  [PigReproductiveState.Lactation]: [PigReproductiveState.Weaning] as const,
  [PigReproductiveState.Weaning]: [PigReproductiveState.Rest] as const,
};
