declare module 'web-vitals' {
  interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    id: string;
    delta: number;
    navigationType: string;
  }

  type ReportCallback = (metric: Metric) => void;

  export function onCLS(callback: ReportCallback): void;
  export function onLCP(callback: ReportCallback): void;
  export function onTTFB(callback: ReportCallback): void;
  export function onINP(callback: ReportCallback): void;
  export type { Metric };
}
