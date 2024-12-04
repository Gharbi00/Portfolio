import { ChangeDetectorRef, Directive, ElementRef, Input, OnInit } from '@angular/core';
import ProgressBar from 'progressbar.js';

@Directive({
  selector: '[appProgressBar]'
})
export class ProgressBarDirective implements OnInit {
  @Input() height: number = 6;
  @Input() lineColor: string = '#e7e8ee';
  @Input() gradientColors?: string[];
  @Input() start: number = 0;
  @Input() end: number = 100;
  @Input() stop: number = 0;
  @Input()trailWidth: number = 4;
  @Input() shape: 'line' | 'circle' | 'hexagon' = 'line'; // Added shape input

  private bar: ProgressBar.Path | ProgressBar.Circle | ProgressBar.Line | undefined;

  constructor(private el: ElementRef, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.initProgressBar();
  }

  private initProgressBar() {
    const options: any = {
      strokeWidth: this.height,
      color: this.lineColor,
      trailColor: '#eee',
      trailWidth: 4,
      svgStyle: { width: '100%', height: '100%' }
    };

    if (this.gradientColors) {
      options.from = { color: this.gradientColors[1] };
      options.to = { color: this.gradientColors[0] };
      options.step = (state: any, bar: any) => {
        bar.path.setAttribute('stroke', state.color);
      };
    }

    if (this.shape === 'circle') {
      this.bar = new ProgressBar.Circle(this.el.nativeElement, options);
    } else if (this.shape === 'hexagon') {
      const hexagonSvg = this.createHexagonSvg();
      this.el.nativeElement.appendChild(hexagonSvg);
      this.bar = new ProgressBar.Path(hexagonSvg.querySelector('path'), options);
    } else {
      this.bar = new ProgressBar.Line(this.el.nativeElement, options);
    }
    this.setProgress((this.stop - this.start) / (this.end - this.start));
  }

  private setProgress(value: number) {
    if (this.bar) {
      this.bar.animate(value); // Number from 0.0 to 1.0
    }
  }

  private createHexagonSvg(): SVGSVGElement {
    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = '100%';

    const hexagonPath = document.createElementNS(svgNs, 'path');
    const size = 95;
    const hexagonPoints = [
      { x: size * 0.5, y: 0 },
      { x: size, y: size * 0.25 },
      { x: size, y: size * 0.75 },
      { x: size * 0.5, y: size },
      { x: 0, y: size * 0.75 },
      { x: 0, y: size * 0.25 },
    ];

    const pathData = `M ${hexagonPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    hexagonPath.setAttribute('d', pathData);
    hexagonPath.setAttribute('fill', 'none');
    hexagonPath.setAttribute('stroke', this.lineColor);
    hexagonPath.setAttribute('stroke-width', this.height.toString());

    svg.appendChild(hexagonPath);
    return svg;
  }
}
