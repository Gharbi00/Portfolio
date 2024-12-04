import Cookie from 'js-cookie';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';


import { environment } from '../../../environments/environment';
import { SignInComponent } from '../../modules/auth/sign-in/sign-in.component';
import { AuthComponent } from '../../modules/auth/auth/auth.component';

@Injectable({
	providedIn: 'root'
})

export class ModalService {
	products = [];
	timer: any;




	private modalOption2: NgbModalOptions = {
		centered: true,
		size: 'lg',
		windowClass: 'login-modal',
		beforeDismiss: async () => {
			

			await new Promise((resolve) => {
				setTimeout(() => {
					resolve('success');
				}, 300)
			});

			(document.querySelector('.logo') as HTMLElement).focus({ preventScroll: true });

			return true;
		}
	}

	constructor(private modalService: NgbModal, private router: Router, private http: HttpClient) {
	}


	showLoginModal() {
		(document.querySelector('.logo') as HTMLElement).focus({ preventScroll: true });
		this.modalService.open(
			AuthComponent,
			this.modalOption2
		)
	}



}