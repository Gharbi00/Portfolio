import { isEqual } from 'lodash';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PictureType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'alt-pictures',
  templateUrl: './alt-pictures.component.html',
  styleUrls: ['./alt-pictures.component.scss'],
})
export class AltPicturesComponent implements OnInit {
  @Input() picture: PictureType;

  altForm: FormGroup;
  isButtonDisabled = true;

  constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.altForm = this.formBuilder.group({
      picture: this.formBuilder.group({
        alt: [this.picture?.alt || '', Validators.required],
        path: [this.picture?.path || ''],
        baseUrl: [this.picture?.baseUrl || ''],
        width: [this.picture?.width],
        heigth: [this.picture?.height],
      }),
    });
    const initialValues = this.altForm.value;
    this.altForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  save() {
    this.activeModal.close(this.altForm.value);
  }
  dismissModal() {
    this.activeModal.close();
  }
}
