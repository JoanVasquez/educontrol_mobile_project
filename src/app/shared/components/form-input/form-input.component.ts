import { Component, forwardRef, input } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';

type FormInputType = 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';

@Component({
  selector: 'app-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  imports: [IonIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor {
  readonly type = input<FormInputType>('text');
  readonly iconName = input<string>();
  readonly label = input<string>();
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string>('off');
  readonly invalid = input(false);

  value = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  updateValue(event: Event): void {
    const nextValue = event.target instanceof HTMLInputElement ? event.target.value : '';
    this.value = nextValue;
    this.onChange(nextValue);
  }

  markTouched(): void {
    this.onTouched();
  }
}
