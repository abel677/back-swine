import { DomainDateTime } from "./domain-datetime";

export abstract class DomainEvent {
  private readonly _occurredOn: Date;

  constructor(
    public readonly eventName: string,
    public readonly aggregateId: string
  ) {
    this._occurredOn = DomainDateTime.now();
  }

  get occurredOn(): Date {
    return this._occurredOn;
  }

  //abstract toPrimitives(): Record<string, unknown>;
}
