import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { HomeComponent } from './home.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
 /*  {
    path: 'fashion-2',
    component: HomeComponent
  },
  {
    path: 'fashion-3',
    component: FashionThreeComponent
  },
  {
    path: 'vegetable',
    component: VegetableComponent
  },
  {
    path: 'watch',
    component: WatchComponent
  },
  {
    path: 'furniture',
    component: FurnitureComponent
  },
  {
    path: 'flower',
    component: FlowerComponent
  },
  {
    path: 'beauty',
    component: BeautyComponent
  },
  {
    path: 'electronics',
    component: ElectronicsComponent
  },
  {
    path: 'pets',
    component: PetsComponent
  },
  {
    path: 'gym',
    component: GymComponent
  },
  {
    path: 'tools',
    component: ToolsComponent
  },
  {
    path: 'shoes',
    component: ShoesComponent
  },
  {
    path: 'bags',
    component: BagsComponent
  },
  {
    path: 'marijuana',
    component: MarijuanaComponent
  } */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
