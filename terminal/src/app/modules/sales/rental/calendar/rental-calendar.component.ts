import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';

// Calendar option
import { CalendarOptions, EventClickArg, EventApi } from '@fullcalendar/angular';
// BootStrap
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
// Sweet Alert
import Swal from 'sweetalert2';

import { category, calendarEvents, createEventId } from './data';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-calendar',
  templateUrl: './rental-calendar.component.html',
  styleUrls: ['./rental-calendar.component.scss'],
})

/**
 * Calendar Component
 */
export class RentalCalendarComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  // calendar
  calendarEvents!: any[];
  editEvent: any;
  formEditData!: FormGroup;
  newEventDate: any;
  category!: any[];
  submitted = false;

  // Calendar click Event
  formData!: FormGroup;
  @ViewChild('editmodalShow') editmodalShow!: TemplateRef<any>;
  @ViewChild('modalShow') modalShow!: TemplateRef<any>;

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private datePipe: DatePipe, private translate: TranslateService) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.CALENDAR').subscribe((calendar: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: calendar, active: true }];
      });
    });

    // Validation
    this.formData = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
      location: ['', [Validators.required]],
      desription: ['', [Validators.required]],
      date: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
    });

    this._fetchData();
  }

  /**
   * Fetches the data
   */
  private _fetchData() {
    // Event category
    this.category = category;

    // Calender Event Data
    this.calendarEvents = calendarEvents;
  }

  /***
   * Calender Set
   */
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear',
    },
    initialView: 'dayGridMonth',
    themeSystem: 'bootstrap',
    initialEvents: calendarEvents,
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.openModal.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
  };
  currentEvents: EventApi[] = [];

  /**
   * Event add modal
   */
  openModal(event?: any) {
    this.newEventDate = event;
    this.modalService.open(this.modalShow, { centered: true });
  }

  /**
   * Event click modal show
   */
  handleEventClick(clickInfo: EventClickArg) {
    this.editEvent = clickInfo.event;

    this.formEditData = this.formBuilder.group({
      editTitle: clickInfo.event.title,
      editCategory: clickInfo.event.classNames[0],
      editlocation: clickInfo.event.extendedProps['location'],
      editDescription: clickInfo.event.extendedProps['description'],
      editDate: clickInfo.event.start,
      editStart: clickInfo.event.start,
      editEnd: clickInfo.event.end,
    });
    this.modalService.open(this.editmodalShow, { centered: true });
  }

  /**
   * Events bind in calander
   * @param events events
   */
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  /**
   * Close event modal
   */
  closeEventModal() {
    this.formData = this.formBuilder.group({
      title: '',
      category: '',
    });
    this.modalService.dismissAll();
  }

  /***
   * Model Position Set
   */
  position() {
    this.translate.get('MENUITEMS.TS.EVENT_SAVED').subscribe((eventSaved: string) => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: eventSaved,
        showConfirmButton: false,
        timer: 1000,
      });
    });
  }

  /***
   * Model Edit Position Set
   */
  Editposition() {
    this.translate.get('MENUITEMS.TS.EVENT_UPDATED').subscribe((eventUpdated: string) => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: eventUpdated,
        showConfirmButton: false,
        timer: 1000,
      });
    });
  }

  /**
   * Event Data Get
   */
  get form() {
    return this.formData.controls;
  }

  /**
   * Save the event
   */
  saveEvent() {
    if (this.formData.valid) {
      const title = this.formData.get('title')!.value;
      const className = this.formData.get('category')!.value;
      const location = this.formData.get('location')!.value;
      const description = this.formData.get('desription')!.value;
      const date = this.formData.get('date')!.value;
      const start = this.formData.get('start')!.value;
      const enddate = this.formData.get('end')!.value;
      const convertdate = this.datePipe.transform(date, 'mediumDate');
      const convertendend = this.datePipe.transform(convertdate + ' ' + enddate, 'full');
      const calendarApi = this.newEventDate.view.calendar;
      calendarApi.addEvent({
        id: createEventId(),
        title,
        date,
        // start,
        // enddate,
        location,
        description,
        className: className + ' ' + 'text-white',
      });
      this.position();
      this.formData = this.formBuilder.group({
        title: '',
        category: '',
        location: '',
        desription: '',
        date: '',
        start: '',
        end: '',
      });
      this.modalService.dismissAll();
    }
    this.submitted = true;
  }

  /**
   * save edit event data
   */
  editEventSave() {
    const editTitle = this.formEditData.get('editTitle')!.value;
    const editCategory = this.formEditData.get('editCategory')!.value;

    const editId = this.calendarEvents.findIndex((x) => x.id + '' === this.editEvent.id + '');

    this.editEvent.setProp('title', editTitle);
    this.editEvent.setProp('classNames', editCategory);

    this.calendarEvents[editId] = {
      ...this.editEvent,
      title: editTitle,
      id: this.editEvent.id,
      classNames: editCategory,
    };
    this.Editposition();
    this.formEditData = this.formBuilder.group({
      editTitle: '',
      editCategory: '',
    });
    this.modalService.dismissAll();
  }

  /**
   * Delete-confirm
   */
  confirm() {
    this.translate.get('MENUITEMS.TS.ARE_YOU_SURE').subscribe((areYouSure: string) => {
      this.translate.get('MENUITEMS.TS.IMPOSSIBLE_TO_REVERT').subscribe((impossibleRevert: string) => {
        this.translate.get('COMMON.YES_DELETE_IT').subscribe((yesDelete: string) => {
          this.translate.get('MENUITEMS.TS.DELETED').subscribe((deleted: string) => {
            this.translate.get('MENUITEMS.TS.EVENT_DELETED').subscribe((eventDeleted: string) => {
              this.translate.get('MENUITEMS.TS.SUCCESS').subscribe((success: any) => {
                Swal.fire({
                  title: areYouSure,
                  text: impossibleRevert,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#34c38f',
                  cancelButtonColor: '#f46a6a',
                  confirmButtonText: yesDelete,
                }).then((result) => {
                  if (result.value) {
                    this.deleteEventData();
                    Swal.fire(deleted, eventDeleted, success);
                  }
                });
              });
            });
          });
        });
      });
    });
  }

  /**
   * Delete event
   */
  deleteEventData() {
    this.editEvent.remove();
    this.modalService.dismissAll();
  }
}
