import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PictureType } from '@sifca-monorepo/terminal-generator';

import { AuthService } from '../../../core/auth/auth.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'sifca-monorepo-lockscreen',
  templateUrl: './lockscreen.component.html',
  styleUrls: ['./lockscreen.component.scss'],
})
export class LockscreenComponent implements OnInit {
  elevokLogo = ELEVOK_LOGO;
  lockscreenForm!: FormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  year: number = new Date().getFullYear();
  name: string;
  email: string;
  picture: PictureType;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    public toastService: ToastService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.name = user.firstName + ' ' + user.lastName;
      this.email = user.email;
      this.picture = user.picture;
    });
    this.lockscreenForm = this.formBuilder.group({
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.lockscreenForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.lockscreenForm.invalid) {
      return;
    }

    this.authService
      .unlockSession({
        login: this.email ?? '',
        password: this.lockscreenForm.get('password').value,
      })
      .subscribe((data) => {
        if (data) {
          const redirectURL = this.activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/';
          this.router.navigateByUrl(redirectURL);
        } else {
          this.toastService.show(data.errors[0].extensions.exception.response.error, { classname: 'bg-danger text-white', delay: 15000 });
        }
      });
  }
}
