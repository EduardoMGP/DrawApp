import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import { GarticComponent } from './gartic/gartic.component';
import { DesenharComponent } from './desenhar/desenhar.component';
import { DesenhosComponent } from './desenhos/desenhos.component';
import { CanvasComponent } from './canvas/canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    GarticComponent,
    DesenharComponent,
    DesenhosComponent,
    CanvasComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
