import Swal from 'sweetalert2';
import { catchError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ValidationHelper } from '@diktup/frontend/helpers';

import { AuthService } from '../../../core/auth/auth.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-pass-create',
  templateUrl: './pass-create.component.html',
  styleUrls: ['./pass-create.component.scss'],
})
export class PassCreateComponent implements OnInit {
  error = '';
  token: string;
  submitted = false;
  returnUrl!: string;
  confirmField!: boolean;
  elevokLogo = ELEVOK_LOGO;
  isButtonDisabled = false;
  passwordField!: boolean;
  resetPasswordForm!: FormGroup;
  year: number = new Date().getFullYear();
  path: string;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.activatedRoute.params.subscribe((params) => {
      if (params?.token) {
        this.token = params?.token.split('&')[0];
      }
    });
  }

  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
      },
      { validators: [ValidationHelper.matchingFields('password', 'passwordConfirm')] } as AbstractControlOptions,
    );
    this.resetPasswordForm.valueChanges.subscribe(() => {
      this.isButtonDisabled = false;
    });
    this.path = this.activatedRoute.snapshot.url[0].path;
  }

  get formControls() {
    return this.resetPasswordForm.controls;
  }

  resetPassword(): void {
    this.submitted = true;
    if (this.resetPasswordForm.invalid) {
      return;
    }
    this.isButtonDisabled = true;
    this.authService
      .resetPassword(this.resetPasswordForm.get('password').value, this.token)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.router.navigate(['/auth/login']);
          this.changeDetectorRef.markForCheck();
        }
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
}
