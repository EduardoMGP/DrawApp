import {AfterViewInit, Component, OnDestroy, Renderer2, ViewChild} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {ResponseCode} from "../../services/ResponseCode";
import {Action, History} from "../../models/History";

@Component({
  selector: 'app-desenhar',
  templateUrl: './desenhar.component.html',
  styleUrls: ['./desenhar.component.scss']
})
export class DesenharComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', {static: true}) canvasEle: any;
  @ViewChild('canvas_div', {static: true}) canvasDivEle: any;
  @ViewChild('cursor', {static: true}) cursorEle: any;
  private cursorElement: HTMLDivElement | undefined
  private ctx: CanvasRenderingContext2D | undefined;
  public party_name: string | undefined;
  public party_url: string | undefined;

  public colors: string[] = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#00ffff', '#ff00ff', '#c0c0c0', '#808080', '#800000', '#808000',
  ];

  public connectedPeoples: number = 0;
  public currentColor: string = '#000000';
  public currentColorBg: string = '#ffffff';
  public currentSize: number = 5;
  private eraser: boolean = false;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  private lastHistory: History | null = null;
  private history: History[] = [];

  private undo_list: any[] = [];
  private redo_list: any[] = [];
  private undo_limit: number = 50;

  private listener: any;

  constructor(private renderer: Renderer2) {

    const component = this;
    this.listener = SocketService.on((event: any) => {
      console.log(event);

      if (ResponseCode.DRAWN === event.code ||
        ResponseCode.PARTY_CLIENT_JOINED === event.code ||
        ResponseCode.PARTY_CLIENT_LEFT === event.code) {
        this.connectedPeoples = event.data.peoples;
      }

      if (ResponseCode.PARTY_CREATED === event.code) {

        component.party_name = event.data.partyName;
        component.party_url = new URL(window.location.href).origin + '/canvas/' + component.party_name;

        let canvas_div = component.canvasDivEle.nativeElement;
        canvas_div.classList.remove('disabled');
        let canvas = component.canvasEle.nativeElement;
        canvas.addEventListener('mouseup', (e: MouseEvent) => {
          this.stopDrawn()
        });

        canvas.addEventListener('mousedown', (e: MouseEvent) => {
          this.lastX = e.offsetX;
          this.lastY = e.offsetY;
          this.startDrawn()
          this.draw(e.offsetX, e.offsetY)
          console.log(e.offsetX, e.offsetY)
        });

        canvas.addEventListener('mousemove', (e: MouseEvent) => {
          const mouseY = e.offsetY;
          const mouseX = e.offsetX;
          this.draw(mouseX, mouseY)

          this.renderer.setStyle(component.cursorElement, 'width', this.currentSize + 'px');
          this.renderer.setStyle(component.cursorElement, 'height', this.currentSize + 'px');
          this.renderer.setStyle(component.cursorElement, 'left', (e.pageX - this.currentSize / 2) + 'px');
          this.renderer.setStyle(component.cursorElement, 'top', (e.pageY - this.currentSize / 2) + 'px');
          this.renderer.setStyle(component.cursorElement, 'background-color', 'rgba(255, 255, 255, 0.5)');

          if (!this.eraser) {
            this.renderer.setStyle(component.cursorElement, 'background-color', this.currentColor);
          }

        });

        canvas.addEventListener('mouseout', (e: MouseEvent) => {
          this.renderer.setStyle(component.cursorElement, 'display', 'none');
        });

        canvas.addEventListener('mouseover', (e: MouseEvent) => {
          this.renderer.setStyle(component.cursorElement, 'display', 'block');
        });

        addEventListener('draw', () => {
          if (this.party_name) {
            SocketService.sendDrawn(this.party_name, this.history);
            this.history = [];
          }
        });

      }
    });
  }

  ngOnDestroy(): void {
    if (this.party_name)
      SocketService.leaveParty(this.party_name);
    SocketService.removeEvent(this.listener);
  }

  public ngAfterViewInit() {
    SocketService.createParty();

    this.cursorElement = this.cursorEle.nativeElement;
    const canvas = this.canvasEle.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, 800, 600);
    }

  }

  public startDrawn(): void {
    if (this.ctx) {
      this.isDrawing = true;
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this.currentSize;

      if (this.eraser) {
        this.ctx.strokeStyle = this.currentColorBg;
      }

      this.lastHistory = {
        c: this.ctx.strokeStyle,
        s: this.ctx.lineWidth,
        a: this.eraser ? Action.ERASER : Action.DRAW,
        data: []
      };

      this.undo_list.push(this.ctx.getImageData(0, 0, 800, 600));
      if (this.undo_list.length > this.undo_limit) {
        this.undo_list.shift();
      }

    }
  }

  public stopDrawn(): void {
    this.isDrawing = false;

    if (this.ctx && this.party_name) {

      if (this.lastHistory !== null) {
        this.history.push(this.lastHistory);
        this.lastHistory = null;
      }

      if (this.history.length > 0)
        SocketService.sendDrawn(this.party_name, this.history);

      this.history = [];
    }
  }

  public addHistory(x: number, y: number, sx: number, sy: number): void {
    if (this.lastHistory === null) return;
    this.lastHistory.data.push({x: x, y: y, sx: sx, sy: sy});

    if (this.lastHistory && this.party_name) {
      if (this.lastHistory.data.length > 5) {
        SocketService.sendDrawn(this.party_name, [this.lastHistory]);
        this.lastHistory.data = [];
      }
    }
  }

  private draw(x: number, y: number): void {
    if (this.ctx) {
      if (!this.isDrawing) return;

      this.addHistory(x, y, this.lastX, this.lastY);
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.lastX = x;
      this.lastY = y;

    }
  }

  public changeColor(color: any): void {

    let element = color.target;
    let value: string = '';
    if (element instanceof HTMLInputElement)
      value = element.value;
    else if (element instanceof HTMLElement)
      value = element.getAttribute('data-color') || '';

    if (value !== null) {
      this.currentColor = value;
      this.eraser = false;
    }

  }

  public setEraser(val: boolean): void {
    this.eraser = val;
  }

  fill(color: any) {
    if (this.ctx) {
      let element = color.target;
      let value: string = '';
      if (element instanceof HTMLInputElement)
        value = element.value;
      else if (element instanceof HTMLElement) {
        value = element.getAttribute('data-color') || '';
        console.log(value)
      }

      if (value !== null) {
        this.currentColorBg = value;
        this.ctx.fillStyle = value;
        this.undo_list.push(this.ctx.getImageData(0, 0, 800, 600));
        this.ctx.fillRect(0, 0, 800, 600);
        if (this.party_name) {
          SocketService.sendDrawn(this.party_name, [{
            c: value, a: Action.FILL
          }]);
        }
      }
    }
  }

  redo() {
    if (this.ctx) {
      if (this.redo_list.length > 0) {
        console.log(this.redo_list)
        let redo = this.redo_list.pop();
        this.undo_list.push(this.ctx.getImageData(0, 0, 800, 600));
        this.ctx.putImageData(redo as ImageData, 0, 0);
      }
    }
  }

  undo() {
    if (this.ctx) {
      if (this.undo_list.length > 0) {
        let undo = this.undo_list.pop();
        this.redo_list.push(this.ctx.getImageData(0, 0, 800, 600));
        this.ctx.putImageData(undo as ImageData, 0, 0);
      }
    }
  }

  changeSize($event: any) {
    if (this.ctx) {
      let element = $event.target;
      if (element instanceof HTMLInputElement) {
        this.currentSize = parseInt(element.value);
      }
    }
  }

  copy(party_url: string | undefined) {
    if (party_url) {
      navigator.clipboard.writeText(party_url).then(() => {
        alert('Link copiado com sucesso!');
      });
    }
  }
}
