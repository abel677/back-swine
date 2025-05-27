import { DomainEvent } from "./domain-event";

export abstract class AggregateRoot<T> {
  private _domainEvents: DomainEvent[] = [];

  constructor(public readonly id: string, protected readonly properties: T) {}

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
