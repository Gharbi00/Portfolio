import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  primaryColor: string = environment.primaryColor;
  secondaryColor: string = environment.secondaryColor;
  private resetFilter: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private navigating: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
  set isLoading$(value: any) {
    this.isLoading.next(value);
  }
  get navigating$(): Observable<boolean> {
    return this.navigating.asObservable();
  }
  set navigating$(value: any) {
    this.navigating.next(value);
  }

  get resetFilter$(): Observable<boolean> {
    return this.resetFilter.asObservable();
  }
  set resetFilter$(value: any) {
    this.resetFilter.next(value);
  }
}
