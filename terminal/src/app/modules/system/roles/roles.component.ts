import { isEqual, map } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, combineLatest, of, takeUntil } from 'rxjs';

import { PermissionDefinitionType, PermissionPermissionsType, PermissionType } from '@sifca-monorepo/terminal-generator';

import Swal from 'sweetalert2';
import { RolesService } from './roles.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-team-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  matchingPermissionsCount = 0;
  rolesForm: FormGroup;
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  permissions: PermissionType[];
  definitions: PermissionDefinitionType[];
  selectedPermession: PermissionType;
  loadingPermissions$: Observable<boolean> = this.rolesService.loadingPermissions$;

  get permissionsArray() {
    return this.rolesForm.get('permissions');
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.SYSTEM').subscribe((system: string) => {
      this.translate.get('MENUITEMS.TS.ROLES').subscribe((roles: string) => {
        this.breadCrumbItems = [{ label: system }, { label: roles, active: true }];
      });
    });
    combineLatest([this.rolesService.permissionsDef$, this.rolesService.permissions$])
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(([definitions, permissions]) => {
        this.permissions = permissions;
        this.definitions = definitions;
        this.changeDetectorRef.markForCheck();
      });
  }

  permissionsCount(permissions: PermissionPermissionsType[]) {
    return permissions.filter((role) => role?.create || role?.read || role?.write).length;
  }

  openPermissionModal(content: any, permission: PermissionType) {
    this.selectedPermession = permission;
    this.modalService.open(content, { centered: true, size: 'lg' });
    this.rolesForm = this.formBuilder.group({
      name: [permission?.name || ''],
      permissions: this.formBuilder.array(
        permission?.permissions?.length
          ? map(permission.permissions, (role) => {
              return this.formBuilder.group({
                permission: [role?.permission],
                read: [role?.read === true ? true : false],
                write: [role?.write === true ? true : false],
                create: [role?.create === true ? true : false],
              });
            })
          : this.definitions.map((role) => {
              return this.formBuilder.group({
                permission: [role],
                read: [false],
                write: [false],
                create: [false],
              });
            }),
      ),
    });
    const initialValue = this.rolesForm.value;
    this.rolesForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(values, initialValue);
    });
  }

  ngAfterViewInit() {
    this.rolesService.getPermissionDefinition().subscribe();
  }

  save() {
    const input: any = {
      name: this.rolesForm.get('name').value,
      permissions: map(this.permissionsArray.value, (role) => {
        return {
          permission: role?.permission?.id,
          read: role?.read,
          write: role?.write,
          create: role?.create,
        };
      }),
    };
    if (this.selectedPermession?.id) {
      this.rolesService
        .updatePermission(this.selectedPermession?.id, input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.successModal();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.rolesService
        .createPermission(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.successModal();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  openDeleteModal(content: any, permession: any) {
    this.selectedPermession = permession;
    this.modalService.open(content, { centered: true });
  }

  deletePermission() {
    this.rolesService
      .deletePermission(this.selectedPermession.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.successModal();
        this.modalService.dismissAll();
      });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  successModal() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }
}
