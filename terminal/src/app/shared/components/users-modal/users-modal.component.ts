import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'users-modal',
  templateUrl: './users-modal.component.html',
  styleUrls: ['./users-modal.component.scss'],
})
export class UsersModalComponent implements OnInit {
  @Input() selectedUsers: any[] = [];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  dismissModal() {
    this.activeModal.dismiss();
  }
}
