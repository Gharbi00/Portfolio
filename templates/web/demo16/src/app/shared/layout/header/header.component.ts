import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public modalService: ModalService,) { }

  ngOnInit(): void {
  }
  showLoginModal(event: Event): void {
    event.preventDefault();
    this.modalService.showLoginModal();
  }

}
