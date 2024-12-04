import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';

import { AuthService } from '../../../core/auth/auth.service';
import { ELEVOK_LOGO, ELEVOK_SMALL_LOGO } from '../../../../environments/environment';
import { ToastService } from '../../../shared/services/toast.service';
import { StorageHelper } from '@diktup/frontend/helpers';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { RequestTypeEnum } from '@sifca-monorepo/terminal-generator';
import { isEqual, keys, omit } from 'lodash';
import { FormHelper } from '@sifca-monorepo/clients';

@Component({
  selector: 'sifca-monorepo-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class LoginComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  error = '';
  mode: string;
  token: string;
  isHidden = true;
  loginView = true;
  submitted = false;
  returnUrl!: string;
  initialValues: any;
  loginForm!: FormGroup;
  requestForm: FormGroup;
  fieldTextType!: boolean;
  isResetPassword = false;
  elevokLogo = ELEVOK_LOGO;
  isButtonDisabled = false;
  isForgotPassword = false;
  forgotPwdSubmitted = false;
  forgotPasswordForm: FormGroup;
  isResetButtonDisabled = false;
  elevokSmallLogo = ELEVOK_SMALL_LOGO;
  year: number = new Date().getFullYear();
  isRequestButtonDisabled = true;

  get loginControls() {
    return this.loginForm.controls;
  }

  get forgotControls() {
    return this.forgotPasswordForm.controls;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public toastService: ToastService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private activatedRoute: ActivatedRoute,
    public changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.token = this.activatedRoute.snapshot.paramMap.get('token');
    if (this.token) {
      this.isResetPassword = true;
    }
    this.requestForm = this.formBuilder.group({
      requestor: this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        // phone: this.formBuilder.group({
        //   countryCode: [''],
        //   number: [''],
        // }),
      }),
      request: this.formBuilder.group({
        subject: ['', Validators.required],
        content: ['', Validators.required],
      }),
      type: [RequestTypeEnum.CONTACT],
    });
    this.initialValues = this.requestForm.value;
    this.requestForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isRequestButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  ngOnInit(): void {
    if (this.document.body.getAttribute('data-layout-mode') === 'dark') {
      this.document.body.setAttribute('data-layout-mode', 'light');
    }
    if (this.storageHelper.getData('accessToken')) {
      this.storageHelper.clearLocalStorage();
    }
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.forgotPasswordForm.valueChanges.subscribe((ivalues) => {
      this.isResetButtonDisabled = false;
    });

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.loginForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((value) => {
      this.isButtonDisabled = false;
    });
  }

  createRequest() {
    this.isRequestButtonDisabled = true;
    const requestor: any = {
      ...FormHelper.getDifference(omit(this.initialValues.requestor, 'phone'), omit(this.requestForm.value.requestor, 'phone')),
      // ...(this.initialValues.requestor.phone.number === this.requestForm.value.requestor.phone.number
      //   ? { phone: this.requestForm.value.requestor.phone }
      //   : {}),
    };
    const request: any = {
      ...FormHelper.getDifference(this.initialValues.request, this.requestForm.value.request),
    };
    const input: any = {
      ...(keys(request)?.length ? { request } : {}),
      ...(keys(requestor)?.length ? { requestor } : {}),
    };
    this.authService.createRequest(input)
    .pipe(catchError(() => {
      this.modalError('Something went wrong!');
      return of (null);
    }))
    .subscribe((res) => {
      if (res) {
        this.position('Your request has been sent successfully!');
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  resetPassword() {
    this.isButtonDisabled = true;
    this.authService
      .resetPassword(this.loginControls['password'].value, this.token)
      .pipe(
        catchError(() => {
          this.modalError('Something went wrong!');
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.isResetPassword = false;
          this.isForgotPassword = false;
          this.position('Your password has been reset successfully!');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  signIn() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.isButtonDisabled = true;
    this.authService.signIn({ login: this.loginControls['email'].value, password: this.loginControls['password'].value }).subscribe((data) => {
      if (data.data) {
        this.router.navigate(['/']);
      } else {
        this.modalError(data.errors[0]?.extensions.exception?.response?.error);
      }
    });
  }

  sendResetLink(): void {
    this.translate.get('MENUITEMS.TS.PASSWORD_RESET_SENT').subscribe((passwordResetSent: string) => {
      this.forgotPwdSubmitted = true;
      if (this.forgotPasswordForm.invalid) {
        return;
      }
      this.isResetButtonDisabled = true;
      this.authService
        .forgotPassword(this.forgotPasswordForm.get('email')?.value)
        .pipe(
          catchError(() => {
            this.modalError('No user with this email');
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.isResetPassword = false;
            this.isForgotPassword = false;
            this.position(passwordResetSent);
            this.changeDetectorRef.markForCheck();
          }
        });
    });
  }

  position(title) {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 1500,
    });
  }

  modalError(text) {
    Swal.fire({
      title: 'Oops...',
      text,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
