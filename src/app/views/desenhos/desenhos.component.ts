import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {ResponseCode} from "../../services/ResponseCode";
import {timeInterval} from "rxjs";
import {Party} from "../../models/Party";

@Component({
  selector: 'app-desenhos',
  templateUrl: './desenhos.component.html',
  styleUrls: ['./desenhos.component.scss']
})
export class DesenhosComponent implements AfterViewInit, OnDestroy {

  private listener: any;
  public salas: Party[] = [];
  private interval: any;


  constructor() {
    this.listener = SocketService.on((event: any) => {
      if (event.code == ResponseCode.PARTY_LIST) {
        this.salas = JSON.parse(event.data.parties);
      }
    });
  }

  ngOnDestroy(): void {
    SocketService.removeEvent(this.listener);
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    SocketService.listParties();
    this.interval = setInterval(() => {
      SocketService.listParties();
    }, 1000);
  }

}
