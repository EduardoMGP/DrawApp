import {AfterViewInit, Component, ViewChild} from '@angular/core';

@Component({
  selector: 'app-desenhar',
  templateUrl: './desenhar.component.html',
  styleUrls: ['./desenhar.component.scss']
})
export class DesenharComponent implements AfterViewInit {

  @ViewChild('canvas', {static: true}) canvasEle: any;
  private ctx: CanvasRenderingContext2D | undefined;
  private socket: any;

  public colors: string[] = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#00ffff', '#ff00ff', '#c0c0c0', '#808080', '#800000', '#808000',
  ];

  private currentColor: string = '#000000';
  private currentSize: number = 5;

  private eraser: boolean = false;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  private history: any;

  private undo_list: any[] = [];
  private redo_list: any[] = [];
  private undo_limit: number = 10;

  constructor() {
  }

  public connectSpcket() {

    const socket = new WebSocket('ws://localhost:8080')

    // console.log(socket)
    socket.addEventListener('open', function (event) {
      console.log('Conectado');

      setInterval(() => {
        socket.send(
          new TextEncoder().encode(
            JSON.stringify({
                type: 'draw',
                data: {
                  x: 10,
                }
              }
            )
          )
        );
      }, 500);
    });

    socket.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
    });

    socket.addEventListener('error', function (event) {
      console.error('Erro na conexão WebSocket:', event);
    });


  }

  public ngAfterViewInit() {

    this.connectSpcket();
    // this.socket.onopen = () => {
    //   console.log('Conectado');
    // }
    //
    // this.socket.on('message', (data: any) => {
    //   console.log(data);
    // });

    const canvas = this.canvasEle.nativeElement;

    this.ctx = canvas.getContext('2d');
    if (this.ctx) {

      canvas.addEventListener('mouseup', (e: MouseEvent) => {
        this.stopDrawn()
      });

      canvas.addEventListener('mousedown', (e: MouseEvent) => {
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
        this.startDrawn()
        this.draw(e.offsetX, e.offsetY)
      });

      canvas.addEventListener('mousemove', (e: MouseEvent) => {
        const mouseY = e.offsetY;
        const mouseX = e.offsetX;
        this.draw(mouseX, mouseY)
      });

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, 800, 600);

    }
  }

  public startDrawn(): void {
    this.isDrawing = true;
  }

  public stopDrawn(): void {
    this.isDrawing = false;
    this.history = this.ctx?.getImageData(0, 0, 800, 600)
    console.log(this.history)

    this.undo_list.push(this.ctx?.getImageData(0, 0, 800, 600));
    if (this.undo_list.length > this.undo_limit) {
      this.undo_list.shift();
    }
  }

  private draw(x: number, y: number): void {
    if (this.ctx) {
      if (!this.isDrawing) return;

      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this.currentSize;

      if (this.eraser) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 30;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.lastX = x;
      this.lastY = y;
    }
  }

  public clearCanvas(): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, 800, 600);
    }
  }

  public changeColor(color: string): void {
    this.currentColor = color;
    this.eraser = false;
  }

  public setEraser(val: boolean): void {
    this.eraser = val;
  }

  fill(s: string) {
    if (this.ctx) {
      this.ctx.fillStyle = s;
      this.ctx.fillRect(0, 0, 800, 600);
    }
  }

  redo() {
    if (this.ctx) {

      if (this.redo_list.length < 1) return;

      this.undo_list.push(this.redo_list.pop());
      let redo = this.undo_list[this.undo_list.length - 1];
      if (redo)
        this.ctx.putImageData(redo, 0, 0);
    }
  }

  undo() {
    if (this.ctx) {

      if (this.undo_list.length < 1) {
        return;
      }

      this.redo_list.push(this.undo_list.pop());
      let undo = this.undo_list[this.undo_list.length - 1];
      if (undo)
        this.ctx.putImageData(undo, 0, 0);
    }
  }
}
