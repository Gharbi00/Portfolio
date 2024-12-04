import { Component, OnInit, QueryList, ViewChildren, TemplateRef, Inject } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { teamModel } from './employees.model';
import { Team } from './data';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-team',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})

/**
 * Team Component
 */
export class EmployeesComponent {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  Team!: teamModel[];
  submitted = false;
  teamForm!: FormGroup;
  term: any;

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HR').subscribe((hr: string) => {
      this.translate.get('MENUITEMS.TS.EMPLOYEES').subscribe((employees: string) => {
        this.breadCrumbItems = [{ label: hr }, { label: employees, active: true }];
      });
    });

    /**
     * Form Validation
     */
    this.teamForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      projects: ['', [Validators.required]],
      tasks: ['', [Validators.required]],
    });

    // Chat Data Get Function
    this._fetchData();
  }

  // Chat Data Fetch
  private _fetchData() {
    this.Team = Team;
  }

  /**
   * Open modal
   * @param content modal content
   */
  openModal(content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  /**
   * Form data get
   */
  get form() {
    return this.teamForm.controls;
  }

  /**
   * Save Team
   */
  saveTeam() {
    if (this.teamForm.valid) {
      const id = '10';
      const backgroundImg = 'assets/images/small/img-6.jpg';
      const userImage = null;
      const name = this.teamForm.get('name')?.value;
      const jobPosition = this.teamForm.get('designation')?.value;
      const projectCount = this.teamForm.get('projects')?.value;
      const taskCount = this.teamForm.get('tasks')?.value;
      this.Team.push({
        id,
        backgroundImg,
        userImage,
        name,
        jobPosition,
        projectCount,
        taskCount,
      });
      this.modalService.dismissAll();
    }
    this.submitted = true;
  }

  /**
   * Active Toggle navbar
   */
  activeMenu(id: any) {
    this.document.querySelector('.star_' + id)?.classList.toggle('active');
  }

  /**
   * Delete Model Open
   */
  deleteId: any;
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  // Delete Data
  deleteData(id: any) {
    this.document.getElementById('t_' + id)?.remove();
  }

  // View Data Get
  viewDataGet(id: any) {
    var teamData = this.Team.filter((team: any) => {
      return team.id === id;
    });
    var profile_img = teamData[0].userImage
      ? `<img src="` + teamData[0].userImage + `" alt="" class="avatar-lg img-thumbnail rounded-circle mx-auto">`
      : `<div class="avatar-lg img-thumbnail rounded-circle flex-shrink-0 mx-auto fs-20">
        <div class="avatar-title bg-soft-danger text-danger rounded-circle">` +
        teamData[0].name[0] +
        `</div>
      </div>`;
    var img_data = this.document.querySelector('.profile-offcanvas .team-cover img') as HTMLImageElement;
    img_data.src = teamData[0].backgroundImg;
    var profile = this.document.querySelector('.profileImg') as HTMLImageElement;
    profile.innerHTML = profile_img;
    (this.document.querySelector('.profile-offcanvas .p-3 .mt-3 h5') as HTMLImageElement).innerHTML = teamData[0].name;
    (this.document.querySelector('.profile-offcanvas .p-3 .mt-3 p') as HTMLImageElement).innerHTML = teamData[0].jobPosition;
    (this.document.querySelector('.project_count') as HTMLImageElement).innerHTML = teamData[0].projectCount;
    (this.document.querySelector('.task_count') as HTMLImageElement).innerHTML = teamData[0].taskCount;
  }

  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  // File Upload
  imageURL: string | undefined;
  fileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.document.getElementById('');
    this.teamForm.patchValue({
      // image_src: file.name
      image_src: 'avatar-8.jpg',
    });
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      (this.document.getElementById('member-img') as HTMLImageElement).src = this.imageURL;
    };
    reader.readAsDataURL(file);
  }

  // File Upload
  bgimageURL: string | undefined;
  bgfileChange(event: any) {
    let fileList: any = event.target as HTMLInputElement;
    let file: File = fileList.files[0];
    this.document.getElementById('');
    this.teamForm.patchValue({
      // image_src: file.name
      image_src: 'avatar-8.jpg',
    });
    const reader = new FileReader();
    reader.onload = () => {
      this.bgimageURL = reader.result as string;
      (this.document.getElementById('cover-img') as HTMLImageElement).src = this.bgimageURL;
    };
    reader.readAsDataURL(file);
  }
}
