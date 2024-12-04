import { finalize } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../../core/auth/auth.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss'],
})
export class PassResetComponent implements OnInit {
  error = '';
  submitted = false;
  returnUrl!: string;
  elevokLogo = ELEVOK_LOGO;
  fieldTextType!: boolean;
  passresetForm!: FormGroup;
  year: number = new Date().getFullYear();

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.passresetForm = this.formBuilder.group({
      email: ['', [Validators.required]],
    });
  }

  get f() {
    return this.passresetForm.controls;
  }

  onSubmit() {
    if (this.passresetForm.invalid) {
      return;
    }
    this.authService
      .forgotPassword(this.passresetForm.get('email').value)
      .pipe(
        finalize(() => {
          this.passresetForm.enable();
          this.submitted = true;
        }),
      )
      .subscribe(() => {
        // TODO: add alert here success or error
      });
  }
}
