import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-metric-card',
  templateUrl: './dashboard-metric-card.component.html',
  styleUrls: ['./dashboard-metric-card.component.scss'],
})
export class DashboardMetricCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly helper = input.required<string>();
}
