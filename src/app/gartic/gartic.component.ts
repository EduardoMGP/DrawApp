import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-gartic',
  templateUrl: './gartic.component.html',
  styleUrls: ['./gartic.component.scss']
})
export class GarticComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef;

  private ctx!: CanvasRenderingContext2D;

  private cursorr: HTMLDivElement | undefined;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  public colors: string[] = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#00ffff', '#ff00ff', '#c0c0c0', '#808080', '#800000', '#808000',
  ];

  public sizes: string[] = ['11', '13', '15', '20']
  public eraserSize: string[] = ['10', '15', '20', '25', '50']

  private eraser: boolean = false;

  private currentColor: string = '#000000';
  private currentSize: number = 10;
  messages: any;
  messageText: any;

  ngAfterViewInit(): void {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d');

    canvas.addEventListener('mouseout', (e: MouseEvent) => {
      this.stopDrawn()
    });

    canvas.addEventListener('mouseup', (e: MouseEvent) => {
      this.stopDrawn()
      console.log("mouseup")
    });

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.lastX = e.offsetX;
      this.lastY = e.offsetY;
      this.startDrawn()
      this.draw(e.offsetX, e.offsetY)
      console.log("mousedown")
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const mouseY = e.offsetY;
      const mouseX = e.offsetX;
      this.draw(mouseX, mouseY)
    });
  }

  private draw(x: number, y: number): void {

    if (!this.isDrawing) return;
    if (this.eraser) {
      this.ctx.clearRect(x - this.currentSize / 2, y - this.currentSize / 2, this.currentSize, this.currentSize);
      return;
    }

    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.lineWidth = this.currentSize;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }


  private startDrawn(): void {
    this.isDrawing = true;
  }

  private stopDrawn(): void {
    this.isDrawing = false;
  }

  setColor(color: string) {
    this.currentColor = color;
    this.ctx.fillStyle = this.currentColor;
    this.eraser = false;
  }

  setSize(size: any) {
    this.ctx.lineWidth = size;
    this.eraser = false;
    this.currentSize = size;
  }

  setEraser(size: string) {
    this.eraser = true;
    this.currentSize = parseInt(size);
  }

  fill(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  sendMessage() {

  }
}
