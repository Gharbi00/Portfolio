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
const date = new Date();
const d = date.getDate();
const m = date.getMonth();
const y = date.getFullYear();
const calendarEvents: EventInput[] = [
  {
    id: createEventId(),
    title: 'All Day Event',
    date: new Date(y, m, 1),
    location: 'test',
    description: 'test',
    className: 'bg-soft-primary',
  },
  {
    id: createEventId(),
    title: 'Visit Online Course',
    date: new Date(y, m, d - 3, 16, 0),
    location: 'test',
    description: 'test',
    className: 'bg-soft-warning',
  },
  {
    id: createEventId(),
    title: 'World Leprosy Day',
    date: new Date(y, m, d - 3, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'Meeting With Designer',
    date: new Date(y, m, d, 10, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-success',
  },
  {
    id: createEventId(),
    title: 'Birthday Party',
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
    title: 'Repeating Event',
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
    title: 'Weekly Strategy Planning',
    date: new Date(y, m, d + 9, 19, 0),
    start: new Date(y, m, d + 9, 20, 30),
    end: new Date(y, m, d + 10, 22, 30),
    location: 'test',
    description: 'test',
    className: 'bg-soft-danger',
  },
  {
    id: createEventId(),
    title: 'International Mother Language Day',
    date: new Date(y, m, d + 19, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'World Thinking Day',
    date: new Date(y, m, d + 20, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'Client Meeting with Alexis',
    date: new Date(y, m, d + 22, 19, 0),
    start: new Date(y, m, d + 22, 21, 30),
    end: new Date(y, m, d + 24, 22, 30),
    location: 'test',
    description: 'test',
    className: 'bg-soft-danger',
  },
  {
    id: createEventId(),
    title: 'Sifca Project Discussion with Team',
    date: new Date(y, m, d + 23, 16, 0),
    start: new Date(y, m, d + 23, 19, 30),
    end: new Date(y, m, d + 24, 22, 30),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
  {
    id: createEventId(),
    title: 'Click for Google',
    date: new Date(y, m, d + 26, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-dark',
  },
  {
    id: createEventId(),
    title: `International Women's Day`,
    date: new Date(y, m, d + 34, 16, 0),
    allDay: false,
    location: 'test',
    description: 'test',
    className: 'bg-soft-info',
  },
];

export { category, calendarEvents };
