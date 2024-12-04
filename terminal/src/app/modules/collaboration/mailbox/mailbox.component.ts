/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Ck Editer
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Email Data Get
import { emailData } from './data';
import { Email } from './mailbox.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-mailbox',
  templateUrl: './mailbox.component.html',
  styleUrls: ['./mailbox.component.scss'],
})

/**
 * Mailbox Component
 */
export class MailboxComponent implements OnInit {
  // public Editor = ClassicEditor;
  emailData!: Email[];
  emailIds: number[] = [];
  emailDatas: any;
  dataCount: any;
  masterSelected!: boolean;
  singleData: any = [];
  userName: any;
  profile: any = 'user-dummy-img.jpg';

  constructor(private modalService: NgbModal, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    /**
     * Fetches the data
     */
    this.fetchData();

    // Compose Model Hide/Show
    let isShowMenu = false;
    this.document.querySelectorAll('.email-menu-btn').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        isShowMenu = true;
        this.document.getElementById('menusidebar')?.classList.add('menubar-show');
      });
    });
    this.document.querySelector('.email-wrapper')?.addEventListener('click', () => {
      if (this.document.querySelector('.email-menu-sidebar')?.classList.contains('menubar-show')) {
        if (!isShowMenu) {
          this.document.querySelector('.email-menu-sidebar')?.classList.remove('menubar-show');
        }
        isShowMenu = false;
      }
    });
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.document.getElementById('emaildata')?.classList.add('d-none');
    setTimeout(() => {
      this.document.getElementById('emaildata')?.classList.remove('d-none');
      this.emailData = emailData;
      this.emailDatas = Object.assign([], this.emailData);
      this.dataCount = this.emailDatas.length;
      this.document.getElementById('elmLoader')?.classList.add('d-none');
    }, 1000);
  }

  /**
   * Open modal
   * @param content content
   */
  open(content: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked(event: any, id: any) {
    this.singleData = this.emailData.filter((order: any) => {
      return order.id === id;
    });
    this.singleData.forEach((item: any) => {
      this.singleData = item;
    });
    this.document.body.classList.add('email-detail-show');
  }

  /**
   * Hide the sidebar
   */
  public hide() {
    this.document.body.classList.remove('email-detail-show');
  }

  /**
   * Confirmation mail model
   */
  confirm(content: any) {
    this.modalService.open(content, { centered: true });
    const checkboxes: any = this.document.getElementsByName('checkAll');
    const checkedVal: any[] = [];
    let result;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    this.emailIds = checkedVal;
  }

  /***
   * Delete Mail
   */
  deleteData() {
    this.emailIds.forEach((item: any) => {
      this.document.getElementById('chk-' + item)?.remove();
    });
    (this.document.getElementById('email-topbar-actions') as HTMLElement).style.display = 'none';
  }

  /***
   * send mail select multiple mail
   */
  selectMail(event: any, id: any) {
    const checkboxes: any = this.document.getElementsByName('checkAll');
    const checkedVal: any[] = [];
    let result;
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    this.emailIds = checkedVal;
    this.emailIds.length > 0
      ? ((this.document.getElementById('email-topbar-actions') as HTMLElement).style.display = 'block')
      : ((this.document.getElementById('email-topbar-actions') as HTMLElement).style.display = 'none');
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll(ev: any) {
    this.emailDatas.forEach((x: { state: any }) => (x.state = ev.target.checked));
    if (ev.target.checked) {
      (this.document.getElementById('email-topbar-actions') as HTMLElement).style.display = 'block';
    } else {
      (this.document.getElementById('email-topbar-actions') as HTMLElement).style.display = 'none';
    }
  }

  // Active Star
  activeStar(id: any) {
    this.document.querySelector('.star_' + id)?.classList.toggle('active');
  }

  /**
   * Category Filtering
   */
  categoryFilter(e: any, name: any) {
    const removeClass = this.document.querySelectorAll('.mail-list a');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    e.target.closest('.mail-list a').classList.add('active');
    if (name === 'all') {
      this.emailDatas = this.emailData;
    } else {
      this.emailDatas = this.emailData.filter((email: any) => {
        return email.category === name;
      });
    }
  }

  /**
   * Label Filtering
   */
  labelsFilter(e: any, name: any) {
    const removeClass = this.document.querySelectorAll('.mail-list a');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    e.target.closest('.mail-list a').classList.add('active');
    this.emailDatas = this.emailData.filter((email: any) => {
      return email.label === name;
    });
  }

  /**
   * Chat Filtering
   */
  chatFilter(e: any, name: any, image: any) {
    (this.document.getElementById('emailchat-detailElem') as HTMLElement).style.display = 'block';
    this.userName = name;
    this.profile = image ? image : 'user-dummy-img.jpg';
  }

  // Close Chat
  closeChat() {
    (this.document.getElementById('emailchat-detailElem') as HTMLElement).style.display = 'none';
  }
}
