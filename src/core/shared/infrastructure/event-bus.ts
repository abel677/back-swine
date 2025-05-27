import { DomainEvent } from "../domain-event";
import { EventHandler, IEventBus } from "../domain/event-bus.port";

export class EventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const eventName = event.constructor.name;
      const handlers = this.handlers.get(eventName) || [];
      await Promise.all(handlers.map((handler) => handler(event)));
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const currentHandlers = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, [...currentHandlers, handler]);
  }
}
