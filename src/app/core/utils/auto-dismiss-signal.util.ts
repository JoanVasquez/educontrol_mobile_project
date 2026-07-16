import { UI_TIMING } from '../constants/ui-timing.constants';

export class AutoDismissSignal<TValue> {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly setValue: (value: TValue) => void,
    private readonly emptyValue: TValue,
    private readonly durationMs = UI_TIMING.autoDismissNotificationMs,
  ) {}

  show(value: TValue): void {
    this.setValue(value);
    this.scheduleDismiss();
  }

  clear(): void {
    this.clearTimeout();
    this.setValue(this.emptyValue);
  }

  dispose(): void {
    this.clearTimeout();
  }

  private scheduleDismiss(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      this.setValue(this.emptyValue);
      this.timeoutId = null;
    }, this.durationMs);
  }

  private clearTimeout(): void {
    if (!this.timeoutId) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}
