import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { MailboxComponent } from './mailbox/mailbox.component';

const routes: Routes = [
  {
    path: 'projects',
    loadChildren: () => import('./projects/projects/projects.module').then((m) => m.ProjectsModule),
  },
  {
    path: 'tasks',
    loadChildren: () => import('./projects/tasks/tasks.module').then((m) => m.TasksModule),
  },
  {
    path: 'todo',
    loadChildren: () => import('./todo/todo.module').then((m) => m.TodoModule),
  },
  {
    path: 'chat',
    // loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
    loadChildren: () => import('../ecommerce/customers/chat/chat.module').then((m) => m.ChatModule),
    data: {
      action: 'internal',
    },
  },
  {
    path: 'mailbox',
    component: MailboxComponent,
  },
  {
    path: 'calendar',
    component: CalendarComponent,
  },
  {
    path: 'file-manager',
    component: FileManagerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollaborationRoutingModule {}
