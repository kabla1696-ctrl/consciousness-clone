'use client';

import { useEffect } from 'react';
import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

function reportMetric(metric: Metric) {
  // In development, skip analytics reporting
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // In production, report to analytics endpoint
  // Replace with your actual analytics service
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  // Use `navigator.sendBeacon()` when available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', {
      body,
      method: 'POST',
      keepalive: true,
    });
  }
}

export default function WebVitals() {
  useEffect(() => {
    onCLS(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
    onINP(reportMetric);
  }, []);

  return null;
}
