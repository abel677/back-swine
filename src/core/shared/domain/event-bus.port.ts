import { DomainEvent } from "../domain-event";
export type EventHandler = (event: DomainEvent) => Promise<void>;
export interface IEventBus {
  publish(event: DomainEvent[]): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
}
