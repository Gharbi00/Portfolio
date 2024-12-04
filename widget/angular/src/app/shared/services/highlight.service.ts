import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  private vibrating: BehaviorSubject<boolean> = new BehaviorSubject(false);

  get vibrating$(): Observable<boolean> {
    return this.vibrating.asObservable();
  }
  set vibrating$(value: any) {
    this.vibrating.next(value);
  }
}
