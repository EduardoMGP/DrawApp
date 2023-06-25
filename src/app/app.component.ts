import {AfterViewInit, Component} from '@angular/core';
import {SocketService} from "./services/socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {

  public socket: WebSocket | undefined;
  constructor() {
    SocketService.connect();
  }

  ngAfterViewInit(): void {
    // SocketService.connect();
  }

}
