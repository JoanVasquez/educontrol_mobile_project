import { Component, computed, input } from '@angular/core';

export interface WeeklyAbsencePoint {
  label: string;
  value: number;
}

interface ChartPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-weekly-absence-chart',
  templateUrl: './weekly-absence-chart.component.html',
  styleUrls: ['./weekly-absence-chart.component.scss'],
})
export class WeeklyAbsenceChartComponent {
  readonly points = input.required<WeeklyAbsencePoint[]>();

  readonly horizontalGuides = [18, 40, 62, 84, 106, 126];
  readonly yLabels = computed(() => {
    const max = this.maxValue();
    const step = max / (this.horizontalGuides.length - 1);

    return this.horizontalGuides.map((_, index) => Math.round(max - step * index));
  });
  readonly chartPoints = computed(() => this.createChartPoints());
  readonly plotPoints = computed(() => this.chartPoints().map((point) => `${point.x},${point.y}`).join(' '));
  readonly areaPoints = computed(() => `${this.plotPoints()} 248,126 8,126`);

  private readonly chartLeft = 8;
  private readonly chartRight = 248;
  private readonly chartTop = 18;
  private readonly chartBottom = 126;

  private createChartPoints(): ChartPoint[] {
    const points = this.points();
    const max = this.maxValue();
    const xStep = points.length > 1 ? (this.chartRight - this.chartLeft) / (points.length - 1) : 0;

    return points.map((point, index) => ({
      x: Math.round(this.chartLeft + xStep * index),
      y: Math.round(this.chartBottom - (point.value / max) * (this.chartBottom - this.chartTop)),
    }));
  }

  private maxValue(): number {
    return Math.max(1, ...this.points().map((point) => point.value));
  }
}
