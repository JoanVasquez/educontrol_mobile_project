import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { BreakdownService } from '../../firebase/breakdown.service';
import type { BreakdownStatus, Priority } from '../../models/breakdown.model';
import type { BreakdownStatusResult } from './breakdown-status.model';
import { BreakdownStatusPresenter } from './breakdown-status.presenter';

@Injectable({ providedIn: 'root' })
export class BreakdownStatusService {
  private readonly breakdownService = inject(BreakdownService);
  private readonly presenter = new BreakdownStatusPresenter();

  load(): Observable<BreakdownStatusResult> {
    return this.breakdownService.getAllBreakdowns().pipe(
      map((breakdowns) => this.presenter.present(breakdowns)),
    );
  }

  priorityLabel(priority: Priority): string {
    return this.presenter.priorityLabel(priority);
  }

  statusLabel(status: BreakdownStatus): string {
    return this.presenter.statusLabel(status);
  }
}
