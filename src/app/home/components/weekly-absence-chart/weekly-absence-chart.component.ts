import { Component, input } from '@angular/core';

export interface WeeklyAbsencePoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-weekly-absence-chart',
  templateUrl: './weekly-absence-chart.component.html',
  styleUrls: ['./weekly-absence-chart.component.scss'],
})
export class WeeklyAbsenceChartComponent {
  readonly points = input.required<WeeklyAbsencePoint[]>();

  readonly plotPoints = '8,26 56,49 104,112 152,66 200,58 248,18';
  readonly areaPoints = `${this.plotPoints} 248,126 8,126`;
  readonly horizontalGuides = [18, 40, 62, 84, 106, 126];
  readonly yLabels = [30, 20, 10, 0, -10, -20];
}
