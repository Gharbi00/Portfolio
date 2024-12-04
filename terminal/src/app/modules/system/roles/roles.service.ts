import { Injectable } from '@angular/core';
import { map as rxMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  PermissionInput,
  CreatePermissionGQL,
  UpdatePermissionGQL,
  DeletePermissionGQL,
  GetPermissionsByTargetGQL,
  GetPermissionDefinitionGQL,
} from '@sifca-monorepo/terminal-generator';

import { StorageHelper } from '@diktup/frontend/helpers';
import { PermissionDefinitionType, PermissionType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private permissions: BehaviorSubject<PermissionType[]> = new BehaviorSubject<PermissionType[]>(null);
  private loadingPermissions: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private permissionsDef: BehaviorSubject<PermissionDefinitionType[]> = new BehaviorSubject<PermissionDefinitionType[]>(null);

  page = 0;
  limit = 50;
  searchString = '';

  get permissionsDef$(): Observable<PermissionDefinitionType[]> {
    return this.permissionsDef.asObservable();
  }

  get permissions$(): Observable<PermissionType[]> {
    return this.permissions.asObservable();
  }

  get loadingPermissions$(): Observable<boolean> {
    return this.loadingPermissions.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updatePermissionGQL: UpdatePermissionGQL,
    private deletePermissionGQL: DeletePermissionGQL,
    private createPermissionGQL: CreatePermissionGQL,
    private getPermissionsByTargetGQL: GetPermissionsByTargetGQL,
    private getPermissionDefinitionGQL: GetPermissionDefinitionGQL,
  ) {}

  getPermissionDefinition(): Observable<PermissionDefinitionType[]> {
    return this.getPermissionDefinitionGQL.fetch().pipe(
      rxMap(({ data }: any) => {
        this.permissionsDef.next(data.getPermissionDefinition);
        return data.getPermissionDefinition;
      }),
    );
  }

  deletePermission(id: string): Observable<boolean> {
    return this.deletePermissionGQL.mutate({ id }).pipe(
      rxMap(({ data }: any) => {
        if (data.deletePermission) {
          const permissions = this.permissions.value.filter((item) => item.id !== id);
          this.permissions.next(permissions);
          return true;
        }
        return false;
      }),
    );
  }

  updatePermission(id: string, input: PermissionInput): Observable<PermissionType> {
    return this.updatePermissionGQL.mutate({ id, input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          const permissions = this.permissions.value;
          const index = this.permissions.value?.findIndex((a) => a.id === id);
          permissions[index] = data.updatePermission;
          this.permissions.next(permissions);
          return data.updatePermission;
        }
        return null;
      }),
    );
  }

  createPermission(input: PermissionInput): Observable<PermissionType> {
    return this.createPermissionGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      rxMap(({ data }: any) => {
        this.permissions.next([data.createPermission, ...(this.permissions.value || [])]);
        return data.createPermission;
      }),
    );
  }

  getPermissionsByTarget(): Observable<PermissionType[]> {
    this.loadingPermissions.next(true);
    return this.getPermissionsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        this.loadingPermissions.next(false);
        this.permissions.next(data.getPermissionsByTarget);
        return data.getPermissionsByTarget;
      }),
    );
  }
}
