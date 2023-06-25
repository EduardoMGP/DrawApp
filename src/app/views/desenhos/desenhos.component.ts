import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {ResponseCode} from "../../services/ResponseCode";

@Component({
  selector: 'app-desenhos',
  templateUrl: './desenhos.component.html',
  styleUrls: ['./desenhos.component.scss']
})
export class DesenhosComponent implements AfterViewInit, OnDestroy {

  private listener: any;
  public salas: any[] = [];


  constructor() {
    this.listener = SocketService.on((event: any) => {
      console.log(event)
      if (event.code == ResponseCode.PARTY_LIST) {
        this.salas = JSON.parse(event.data.parties);
      }
    });
  }

  ngOnDestroy(): void {
    SocketService.removeEvent(this.listener);
  }

  ngAfterViewInit(): void {
    SocketService.listParties();
  }

}
