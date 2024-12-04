import { HttpClient } from '@angular/common/http';

import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BASE_URL } from '../../../environments/environment';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `${BASE_URL}/frame/assets/i18n/`, '.json');
}
export const TRANSLATE_LOADER_CONFIGS: any = {
  loader: {
    deps: [HttpClient],
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
  },
};
export const MODAL_DATA: Array<string> = [
  'or',
  'male',
  'email',
  'login',
  'signin',
  'female',
  'register',
  'birthday',
  'lastname',
  'password',
  'username',
  'firstname',
  'loginError',
  'sendEmail',
  'loginHere',
  'loginHeader',
  'googleLogIn',
  'registerHere',
  'facebookLogIn',
  'formErrorEmail',
  'registerHeader',
  'forgotPassword',
  'invalidPassword',
  'confirmPassword',
  'passwordMismatch',
  'formErrorRequired',
  'forgotPasswordHeader',
];
