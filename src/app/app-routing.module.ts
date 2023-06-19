import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GarticComponent} from "./gartic/gartic.component";
import {DesenharComponent} from "./desenhar/desenhar.component";
import {DesenhosComponent} from "./desenhos/desenhos.component";
import {CanvasComponent} from "./canvas/canvas.component";

const routes: Routes = [
  {
    path: '',
    component: GarticComponent
  },
  {
    path: 'desenhar',
    component: DesenharComponent
  },
  {
    path: 'canvas',
    component: DesenhosComponent
  },
  {
    path: 'canvas/:id',
    component: CanvasComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
