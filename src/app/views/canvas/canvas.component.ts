import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {SocketService} from "../../services/socket.service";
import {ResponseCode} from "../../services/ResponseCode";
import {Action, Coord, History} from "../../models/History";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', {static: true}) canvasEle: any;

  public sala: string | null = null;
  public connected: boolean = false;
  public error: boolean = false;
  public connectedPeoples: number = 0;

  private ctx: CanvasRenderingContext2D | undefined;
  private canvas = new Map<number, String>();
  private chunkBlock: number = -1;
  private listener: any;

  constructor(public route: ActivatedRoute) {
    const component = this;
    this.listener = SocketService.on((event: any) => {
      console.log(event)
      switch (event.code) {

        case ResponseCode.PARTY_CLOSED: {
          component.error = true;
          this.connectedPeoples = 0;
          break;
        }

        case ResponseCode.PARTY_CONNECT_ERROR: {
          component.error = true;
          break
        }

        case ResponseCode.PARTY_CONNECTED: {
          component.connected = true;
          this.draw(event.data.chunk);
          this.connectedPeoples = event.data.peoples;
          break;
        }

        case ResponseCode.DRAWING_RECEIVED: {
          this.draw(event.data.chunk);
          this.connectedPeoples = event.data.peoples;
          break
        }

        case ResponseCode.PARTY_CLIENT_JOINED:
        case ResponseCode.PARTY_CLIENT_LEFT: {
          this.connectedPeoples = event.data.peoples;
          break;
        }
      }
    });
  }

  private draw(history: History[]) {
    if (history.length > 0 && this.ctx != undefined) {
      for (let chunk of history) {

        let action: Action = chunk.a;
        let color = chunk.c;
        let size = chunk.s;
        let data: Coord[] = chunk.data;

        switch (action) {

          case Action.DRAW:
          case Action.ERASER: {
            for (let coord of data) {

              this.ctx.beginPath();
              this.ctx.strokeStyle = color;
              this.ctx.lineWidth = size;
              this.ctx.lineJoin = 'round';
              this.ctx.lineCap = 'round';
              this.ctx.beginPath();
              this.ctx.moveTo(coord.sx, coord.sy);
              this.ctx.lineTo(coord.x, coord.y);
              this.ctx.stroke();

            }
            break;
          }

          case Action.FILL: {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, 800, 600);
          }

        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.sala)
      SocketService.leaveParty(this.sala);
    SocketService.removeEvent(this.listener);
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvasEle?.nativeElement.getContext('2d');
    this.route.paramMap.subscribe(params => {
      setTimeout(() => {
        this.sala = params.get('id');
        if (this.sala) {
          SocketService.joinParty(this.sala);
        }
      }, 0);
    });
  }
}
