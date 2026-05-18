import { Component, forwardRef, input } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCheckboxComponent),
      multi: true,
    },
  ],
})
export class FormCheckboxComponent implements ControlValueAccessor {
  readonly label = input.required<string>();

  value = false;
  isDisabled = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.value = Boolean(value);
  }

  registerOnChange(onChange: (value: boolean) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  updateValue(event: Event): void {
    const nextValue = event.target instanceof HTMLInputElement ? event.target.checked : false;
    this.value = nextValue;
    this.onChange(nextValue);
  }

  markTouched(): void {
    this.onTouched();
  }
}
