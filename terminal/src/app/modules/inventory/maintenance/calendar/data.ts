import { EventInput } from '@fullcalendar/angular';

let eventGuid = 0;
export function createEventId() {
  return String(eventGuid++);
}

const category = [
  {
    name: '--Select--',
    value: '',
    option: 'selected',
  },
  {
    name: 'Danger',
    value: 'bg-soft-danger',
    option: '',
  },
  {
    name: 'Success',
    value: 'bg-soft-success',
    option: '',
  },
  {
    name: 'Primary',
    value: 'bg-soft-primary',
    option: '',
  },
  {
    name: 'Info',
    value: 'bg-soft-info',
    option: '',
  },
  {
    name: 'Dark',
    value: 'bg-soft-dark',
    option: '',
  },
  {
    name: 'Warning',
    value: 'bg-soft-warning',
    option: '',
  },
];
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();
const calendarEvents: EventInput[] = [
  {
    id: createEventId(),
    title: 'Preventive Maintenance - Samsung Monitor 24"',
    date: new Date(y, m, 1),
    location: 'test',
    description: 'test',
    className: 'bg-soft-primary',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - Samsung Laptop',
    date: new Date(y, m, d - 3, 16, 0),
    location: 'test',
    description: 'test',
    className: 'bg-soft-warning',
  },
  {
    id: createEventId(),
    title: 'Urgent Maintenance - Samsung Monitor 24"',
    date: new Date(y, m, d - 3, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-danger',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - Acer Monitor 24"',
    date: new Date(y, m, d, 10, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-success',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - AC Carrier',
    date: new Date(y, m, d + 1, 19, 0),
    start: new Date(y, m, d + 1, 20, 30),
    end: new Date(y, m, d + 1, 22, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-success',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - CEO Car oil replacement',
    date: new Date(y, m, d + 4, 19, 0),
    start: new Date(y, m, d + 4, 20, 30),
    end: new Date(y, m, d + 9, 22, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-primary',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - Assistant Car Oil',
    date: new Date(y, m, d + 19, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - CEO Laptop',
    date: new Date(y, m, d + 20, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'Preventive Maintenance - HQ AC',
    date: new Date(y, m, d + 23, 16, 0),
    start: new Date(y, m, d + 23, 19, 30),
    end: new Date(y, m, d + 24, 22, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
];

export { category, calendarEvents };
