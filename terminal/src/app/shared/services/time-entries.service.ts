import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TimeTrackType } from '@sifca-monorepo/terminal-generator';
import {
  CommentHolderInput,
  CreateTimeTrackGQL,
  GetTimeTracksByHolderPaginatedGQL,
  TimetrackGQL,
  TimeTrackInput,
  TimeTrackPaginateType,
  UpdateTimeTrackGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({ providedIn: 'root' })
export class TimeEntriesService {
  posId: string;
  private times: BehaviorSubject<TimeTrackType[] | null> = new BehaviorSubject(null);

  constructor(
    private timetrackGQL: TimetrackGQL,
    private updateTimeTrackGQL: UpdateTimeTrackGQL,
    private createTimeTrackGQL: CreateTimeTrackGQL,
    private getTimeTracksByHolderPaginatedGQL: GetTimeTracksByHolderPaginatedGQL,
  ) {}

  get times$(): Observable<TimeTrackType[]> {
    return this.times.asObservable();
  }

  createTimeTrack(input: TimeTrackInput): Observable<TimeTrackType> {
    return this.createTimeTrackGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        this.times.next([data.createTimeTrack, ...this.times.value]);
        return data.createTimeTrack;
      }),
    );
  }

  updateTimeTrack(input: TimeTrackInput, id: string): Observable<TimeTrackType> {
    return this.updateTimeTrackGQL.mutate({ input, id }).pipe(
      map(({ data }: any) => {
        const times = this.times.value;
        const index = times?.findIndex((a) => a.id === id);
        times[index] = data.updateTimeTrack;
        this.times.next(times);
        return data.updateTimeTrack;
      }),
    );
  }

  findTimetrackById(id: string): Observable<TimeTrackType> {
    return this.timetrackGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        return data.timetrack;
      }),
    );
  }

  getTimeTracksByHolderPaginated(holder: CommentHolderInput): Observable<TimeTrackPaginateType> {
    return this.getTimeTracksByHolderPaginatedGQL.fetch({ holder }).pipe(
      map(({ data }: any) => {
        this.times.next(data.getTimeTracksByHolderPaginated.objects);
        return data.getTimeTracksByHolderPaginated;
      }),
    );
  }
}
