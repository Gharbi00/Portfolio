import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ELEVOK_LOGO } from '../../../../environments/environment';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  submitted = false;
  SignupForm!: FormGroup;
  elevokLogo = ELEVOK_LOGO;
  fieldTextType!: boolean;
  year: number = new Date().getFullYear();

  constructor(private formBuilder: FormBuilder, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.SignupForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      name: ['', [Validators.required]],
      password: ['', Validators.required],
    });

    // Password Validation set
    const myInput = this.document.getElementById('password-input') as HTMLInputElement;
    const letter = this.document.getElementById('pass-lower');
    const capital = this.document.getElementById('pass-upper');
    const num = this.document.getElementById('pass-number');
    const length = this.document.getElementById('pass-length');

    // When the user clicks on the password field, show the message box
    myInput.onfocus = () => {
      const input = this.document.getElementById('password-contain') as HTMLElement;
      input.style.display = 'block';
    };

    // When the user clicks outside of the password field, hide the password-contain box
    myInput.onblur = () => {
      const input = this.document.getElementById('password-contain') as HTMLElement;
      input.style.display = 'none';
    };

    // When the user starts to type something inside the password field
    myInput.onkeyup = () => {
      // Validate lowercase letters
      const lowerCaseLetters = /[a-z]/g;
      if (myInput.value.match(lowerCaseLetters)) {
        letter?.classList.remove('invalid');
        letter?.classList.add('valid');
      } else {
        letter?.classList.remove('valid');
        letter?.classList.add('invalid');
      }

      // Validate capital letters
      const upperCaseLetters = /[A-Z]/g;
      if (myInput.value.match(upperCaseLetters)) {
        capital?.classList.remove('invalid');
        capital?.classList.add('valid');
      } else {
        capital?.classList.remove('valid');
        capital?.classList.add('invalid');
      }

      // Validate numbers
      const numbers = /[0-9]/g;
      if (myInput.value.match(numbers)) {
        num?.classList.remove('invalid');
        num?.classList.add('valid');
      } else {
        num?.classList.remove('valid');
        num?.classList.add('invalid');
      }

      // Validate length
      if (myInput.value.length >= 8) {
        length?.classList.remove('invalid');
        length?.classList.add('valid');
      } else {
        length?.classList.remove('valid');
        length?.classList.add('invalid');
      }
    };
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.SignupForm.controls;
  }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.SignupForm.invalid) {
      return;
    }
  }

  /**
   * Password Hide/Show
   */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }
}
