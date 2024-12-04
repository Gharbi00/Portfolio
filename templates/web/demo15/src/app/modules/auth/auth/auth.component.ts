import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService, BaseLoginComponent, OrdersService, UserService,SharedService } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent extends BaseLoginComponent {
  constructor(
    protected userService: UserService,
    protected activeModal: NgbActiveModal,
    protected toastrService: ToastrService,
    protected authService: AuthService,
    protected formBuilder: FormBuilder,
    protected orderService: OrdersService,
    protected override sharedService: SharedService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(authService, formBuilder, orderService, activeModal, toastrService, sharedService, changeDetectorRef);
  }

  checkPhone() {
    if (this.signUpForm.get('phone').value && !this.authenticated) {
      this.authService
        .isLoginForTargetExist(null, this.signUpForm.get('phone').value)
        .pipe(take(1))
        .subscribe(({ exist }) => {
          if (exist) {
            this.signUpForm.get('phone').setErrors({ alreadyExists: exist });
          }
        });
    }
  }

  checkEmail() {
    if (this.signUpForm.get('email').value) {
      this.authService
        .isLoginForTargetExist(this.signUpForm.get('email').value)
        .pipe(take(1))
        .subscribe(({ exist }) => {
          if (exist) {
            this.signUpForm.get('email').setErrors({ alreadyExists: exist });
          }
        });
    }
  }
  closeModal() {
	let modal = document.querySelector('.login-modal') as HTMLElement;
	if (modal)
		modal.click();
}

}
