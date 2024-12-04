import { ChangeDetectorRef, Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import ProgressBar from 'progressbar.js';

@Directive({
  selector: '[appProgressBar]'
})
export class ProgressBarDirective implements OnChanges {
  @Input() height: number = 6;
  @Input() lineColor: string = '#e7e8ee';
  @Input() gradientColors?: string[];
  @Input() start: number = 0;
  @Input() end: number = 100;
  @Input() stop: number = 0; // Bound to currentLevelPercentage
  @Input() shape: 'line' | 'circle' | 'hexagon' = 'line';

  private bar: ProgressBar.Path | ProgressBar.Circle | ProgressBar.Line | undefined;

  constructor(private el: ElementRef, private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    // Initialize the progress bar if it's not initialized yet
    if (!this.bar) {
      this.initProgressBar();
    }

    // Check if `stop` has changed and update progress
    if (changes['stop']) {
      this.updateProgress();
      // Manually mark for change detection to ensure view update
      this.cd.detectChanges();
    }
  }

  private initProgressBar() {
    const options: any = {
      strokeWidth: this.height,
      color: this.lineColor,
      trailColor: '#eee',
      trailWidth: 1,
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

    // Initially set progress
    this.updateProgress();
  }

  private updateProgress() {
    const progressValue = (this.stop - this.start) / (this.end - this.start);
    this.setProgress(progressValue);
  }

  private setProgress(value: number) {
    if (this.bar) {
      this.bar.animate(value); // Animate the progress value (from 0.0 to 1.0)
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
