import { Injectable } from '@angular/core';
import {
  CreateVisualsGQL,
  FindVisualsByTargetGQL,
  UpdateVisualsGQL,
  UpdateVisualsInput,
  VisualsInput,
  VisualsType,
} from '@sifca-monorepo/terminal-generator';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class VisualsService {
  private visuals: BehaviorSubject<VisualsType | null> = new BehaviorSubject(null);

  constructor(
    private storageHelper: StorageHelper,
    private createVisualsGQL: CreateVisualsGQL,
    private updateVisualsGQL: UpdateVisualsGQL,
    private findVisualsByTargetGQL: FindVisualsByTargetGQL,
  ) {}

  get visuals$(): Observable<VisualsType> {
    return this.visuals.asObservable();
  }
  set visuals$(value: any){
    this.visuals.next(value);
  }

  getVisuals(): Observable<VisualsType> {
    return this.findVisualsByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.visuals.next(response.data.findVisualsByTarget);
            return response.data.findVisualsByTarget;
          }
        }),
      );
  }

  createVisuals(input: VisualsInput): Observable<VisualsType> {
    return this.createVisualsGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.visuals.next(response.data.createVisuals);
          return [response.data.createVisuals];
        }
      }),
    );
  }

  updateVisuals(id: string, input: UpdateVisualsInput): Observable<VisualsType> {
    return this.updateVisualsGQL.mutate({ id, input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.visuals.next(response.data.updateVisuals);
          return response.data.updateVisuals;
        }
      }),
    );
  }
}
