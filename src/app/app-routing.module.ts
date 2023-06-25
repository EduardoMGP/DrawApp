import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GarticComponent} from "./views/gartic/gartic.component";
import {DesenharComponent} from "./views/desenhar/desenhar.component";
import {DesenhosComponent} from "./views/desenhos/desenhos.component";
import {CanvasComponent} from "./views/canvas/canvas.component";

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
