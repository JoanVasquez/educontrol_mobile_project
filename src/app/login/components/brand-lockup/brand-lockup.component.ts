import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-lockup',
  templateUrl: './brand-lockup.component.html',
  styleUrls: ['./brand-lockup.component.scss'],
})
export class BrandLockupComponent {
  readonly crestSrc = input.required<string>();
}
