import { Injectable } from '@angular/core';
import { Subject, filter, type Observable } from 'rxjs';
import type { DomainEventName } from './domain-event.constants';

export interface DomainEvent<TPayload = unknown> {
  readonly name: DomainEventName;
  readonly payload?: TPayload;
  readonly occurredAt: string;
}

@Injectable({ providedIn: 'root' })
export class DomainEventBusService {
  private readonly eventsSubject = new Subject<DomainEvent>();

  readonly events$ = this.eventsSubject.asObservable();

  publish<TPayload>(name: DomainEventName, payload?: TPayload): void {
    this.eventsSubject.next({
      name,
      payload,
      occurredAt: new Date().toISOString(),
    });
  }

  on(name: DomainEventName): Observable<DomainEvent> {
    return this.events$.pipe(filter((event) => event.name === name));
  }
}
