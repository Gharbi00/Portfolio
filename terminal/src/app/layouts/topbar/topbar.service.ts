import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import {
  ShortcutType,
  ShortcutInput,
  InsertShortcutGQL,
  UpdateShortcutGQL,
  DeleteShortcutGQL,
  ShortcutUpdateInput,
  GetShortcutsByUserAndTargetPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { UserService } from '../../core/services/user.service';
import { StorageHelper } from '@diktup/frontend/helpers';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class TopBarService {
  private shortcuts: BehaviorSubject<ShortcutType[]> = new BehaviorSubject<ShortcutType[]>(null);

  get shortcuts$(): Observable<ShortcutType[]> {
    return this.shortcuts.asObservable();
  }

  constructor(
    private userService: UserService,
    private storageHelper: StorageHelper,
    private insertShortcut: InsertShortcutGQL,
    private updateShortcutGQL: UpdateShortcutGQL,
    private deleteShortcut: DeleteShortcutGQL,
    private getShortcutsByUserAndTargetPaginationGQL: GetShortcutsByUserAndTargetPaginationGQL,
  ) {}

  getAllShortcuts(fetchPolicy: FetchPolicy = 'cache-first'): Observable<ShortcutType[]> {
    return this.userService.user$.pipe(
      take(1),
      switchMap((user) =>
        this.getShortcutsByUserAndTargetPaginationGQL
          .fetch({ userId: user.id, pagination: { limit: 100, page: 0 }, target: { pos: this.storageHelper.getData('posId') } }, { fetchPolicy })
          .pipe(
            map((response: any) => {
              this.shortcuts.next(response.data.getShortcutsByUserAndTargetPagination.objects);
              return response.data.getShortcutsByUserAndTargetPagination.objects;
            }),
          ),
      ),
    );
  }

  create(input: ShortcutInput): Observable<ShortcutType> {
    return this.shortcuts$.pipe(
      take(1),
      switchMap((shortcuts) =>
        this.insertShortcut.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
          map((res) => {
            this.shortcuts.next([...shortcuts, res.data.insertShortcut] as any);
            return res.data.insertShortcut as any;
          }),
        ),
      ),
    );
  }

  updateShortcut(id: string, input: ShortcutUpdateInput): Observable<ShortcutType> {
    return this.shortcuts$.pipe(
      take(1),
      switchMap((shortcuts) =>
        this.updateShortcutGQL.mutate({ id, input }).pipe(
          map((res) => {
            const index = shortcuts.findIndex((item) => item.id === id);
            shortcuts[index] = res.data.updateShortcut as any;
            this.shortcuts.next(shortcuts as any);
            return res.data.updateShortcut as any;
          }),
        ),
      ),
    );
  }

  delete(id: string): Observable<boolean> {
    return this.shortcuts$.pipe(
      take(1),
      switchMap((shortcuts) =>
        this.deleteShortcut.mutate({ id }).pipe(
          map((res) => {
            if (res.data.deleteShortcut) {
              const index = shortcuts.findIndex((item) => item.id === id);
              shortcuts.splice(index, 1);
              this.shortcuts.next(shortcuts);
              return true;
            }
            return false;
          }),
        ),
      ),
    );
  }
}
