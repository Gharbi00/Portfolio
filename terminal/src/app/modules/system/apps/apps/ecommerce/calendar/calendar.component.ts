import { Component, Input, AfterContentInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';

import { chain } from 'lodash';
import { map, find, pick, range, indexOf, without, includes, findIndex } from 'lodash-es';
import { UpdateOrderSettingsGQL } from '@sifca-monorepo/terminal-generator';
import { UpdateBookingSettingsGQL } from '@sifca-monorepo/terminal-generator';
import { FormHelper } from '@diktup/frontend/helpers';
import { Observable } from 'rxjs';
import { SharedService } from '../../../../../../shared/services/shared.service';

@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements AfterContentInit {
  @Input() field: string;
  @Input() settingsType: string;
  // @Input() orderSettings: OrderSettingsFullType | BookingSettingsFullType;
  @Input() orderSettings: any;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  public settingsForm: FormGroup;
  public daysRange: Array<any>;
  public weekDays: Array<number> = range(1, 8);
  public year: number = new Date().getFullYear();
  public colorClasses: Array<string> = ['text-primary', 'text-info', 'text-success', 'text-danger', 'text-warning', 'text-secondary'];

  public colorBgClasses: Array<string> = [
    'bg-primary text-white',
    'bg-info text-white',
    'bg-success text-white',
    'bg-danger text-white',
    'bg-warning text-dark',
    'bg-secondary text-white',
  ];

  get nonBookableDays(): FormArray {
    return this.settingsForm.get(this.field) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    public updateOrderSettings: UpdateOrderSettingsGQL,
    public updateBookingSettingsGQL: UpdateBookingSettingsGQL,
  ) {}

  ngAfterContentInit() {
    this.initForm();
  }

  initForm(): void {
    this.daysRange = range(0, 12).map((monthIndex: number) => {
      const lastMonthLastDay: Date = new Date(this.year, monthIndex + 1, 0),
        firstWeekDayIndex: number = new Date(this.year, monthIndex, 1).getDay(),
        daysRange: Array<number> = range(1, new Date(this.year, monthIndex + 1, 0).getDate() + 1),
        weekdays: Array<any> = chain(daysRange).uniqBy(this.getWeekDays(monthIndex)).sortBy(this.getWeekDays(monthIndex)).value(),
        prefixDays: Array<number> = firstWeekDayIndex
          ? range(lastMonthLastDay.getDate() - firstWeekDayIndex + 2, lastMonthLastDay.getDate() + 1)
          : [];
      weekdays.push(weekdays.shift());
      return {
        prefixDays,
        weekDays: weekdays,
        suffixDays: range(1, 43 - (daysRange.length + prefixDays.length)),
        days: daysRange.map((day: number): any => {
          const selectedMonth: any = find(this.orderSettings[this.field], {
            month: monthIndex + 1,
          });
          return {
            value: day,
            selected: selectedMonth && indexOf(selectedMonth.days, day) > -1,
          };
        }),
      };
    });
    this.settingsForm = new FormGroup({
      [this.field]: new FormArray(
        map(
          this.orderSettings[this.field],
          (month: any): FormGroup =>
            new FormGroup({
              days: new FormControl(month.days),
              month: new FormControl(month.month),
            }),
        ),
      ),
    });
    this.settingsForm.valueChanges.subscribe((newValues: any): void => {
      const changedData: any = FormHelper.getNonEmptyAndChangedValues(newValues, pick(this.orderSettings, [this.field]));
      if (this.settingsType === 'booking') {
        this.updateBookingSettingsGQL.mutate({ input: changedData, id: this.orderSettings.id }).subscribe(({ data, errors }) => {
          if (data) {
            this.orderSettings = data.updateBookingSettings;
          }
        });
      } else {
        this.updateOrderSettings.mutate({ input: { ...changedData }, id: this.orderSettings.id }).subscribe(({ data, errors }) => {
          if (data) {
            this.orderSettings = data.updateOrderSettings;
          }
        });
      }
    });
  }

  getWeekDays(monthIndex: number): (day: number) => number {
    return (dayIndex: number): number => new Date(this.year, monthIndex, dayIndex).getDay();
  }

  getDate(monthIndex: number, dayIndex = 1): Date {
    return new Date(this.year, +monthIndex, dayIndex);
  }

  selectDay(month: number, day: any): void {
    const index: number = findIndex(this.nonBookableDays.value, { month: month + 1 }),
      currentMonth: AbstractControl = this.nonBookableDays.at(index);
    day.selected = !day.selected;
    if (currentMonth) {
      const oldDays: Array<string> = currentMonth.get('days').value,
        // tslint:disable-next-line:max-line-length
        newDays: Array<string> = includes(oldDays, day.value) ? without(oldDays, day.value) : [...oldDays, day.value];
      currentMonth.get('days').setValue(newDays);
      if (!newDays.length) {
        this.nonBookableDays.removeAt(index);
      }
    } else {
      this.nonBookableDays.push(
        new FormGroup({
          month: new FormControl(month + 1),
          days: new FormControl([day.value]),
        }),
      );
    }
  }
}
