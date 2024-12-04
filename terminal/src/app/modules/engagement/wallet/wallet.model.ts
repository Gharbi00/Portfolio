import {
  ApexGrid,
  ApexFill,
  ApexTheme,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexLegend,
  ApexMarkers,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexAnnotations,
  ApexTitleSubtitle,
  ApexAxisChartSeries,
} from 'ng-apexcharts';

export type ChartOptions = {
  series?: ApexAxisChartSeries | any;
  chart?: ApexChart;
  yaxis?: ApexYAxis | ApexYAxis[];
  xaxis?: ApexXAxis;
  dataLabels?: ApexDataLabels;
  markers?: ApexMarkers;
  tooltip?: ApexTooltip;
  fill?: ApexFill;
  grid?: ApexGrid;
  stroke?: ApexStroke;
  title?: ApexTitleSubtitle;
  colors?: string[];
  legend?: ApexLegend;
  annotations?: ApexAnnotations;
  labels?: string[] | number[];
  toolbar?: any;
  subtitle?: ApexTitleSubtitle;
  plotOptions?: ApexPlotOptions;
  theme?: ApexTheme;
};

export interface WalletModel {
  img: string;
  coinName: string;
  quantity: string;
  avgPrice: string;
  value: string;
  returns: string;
  icon: string;
  percentage: string;
  percentageClass: string;
}
