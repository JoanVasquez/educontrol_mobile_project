import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { map, switchMap, throwError } from 'rxjs';
import { BreakdownService } from '../../firebase/breakdown.service';
import type { BreakdownUpdateForm, BreakdownUpdateViewModel } from './breakdown-update.model';
import { BreakdownUpdatePresenter } from './breakdown-update.presenter';
import { BreakdownUpdateValidator } from './breakdown-update.validator';

@Injectable({ providedIn: 'root' })
export class BreakdownUpdateService {
  private readonly breakdownService = inject(BreakdownService);
  private readonly presenter = new BreakdownUpdatePresenter();
  private readonly validator = new BreakdownUpdateValidator();

  load(id: string): Observable<BreakdownUpdateViewModel> {
    return this.breakdownService.getBreakdown(id).pipe(
      map((breakdown) => this.presenter.present(breakdown)),
    );
  }

  save(id: string, form: BreakdownUpdateForm): Observable<BreakdownUpdateViewModel> {
    const validation = this.validator.validate(form);

    if (!validation.isValid) {
      return throwError(() => new Error(validation.message));
    }

    return this.breakdownService.updateBreakdown(id, this.presenter.toUpdate(form)).pipe(
      switchMap(() => this.load(id)),
    );
  }
}
