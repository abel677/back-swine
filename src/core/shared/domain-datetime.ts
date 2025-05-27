export class DomainDateTime {
  static now(): Date {
    const localDate = new Date();
    const offset = localDate.getTimezoneOffset() * 60000;
    return new Date(localDate.getTime() - offset);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static differenceInDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  static normalizeToUTCMidnight = (date: Date) => {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  };
}
