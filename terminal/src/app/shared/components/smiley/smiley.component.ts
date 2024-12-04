import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { range } from 'lodash';

@Component({
  selector: 'app-smiley',
  templateUrl: './smiley.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SmileyComponent),
      multi: true,
    },
  ],
})
export class SmileyComponent implements ControlValueAccessor {
  @Input() formControlName: string;
  @Input() levels: number;
  @Input() k: number;

  // Implement ControlValueAccessor methods
  onChange: any = () => {};
  onTouch: any = () => {};

  ngOnInit() {}

  writeValue(value: any): void {
    // Update the value based on the incoming value
  }

  generateRange(rank: number) {
    return range(rank);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }
}
