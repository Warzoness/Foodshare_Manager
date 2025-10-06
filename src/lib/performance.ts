// Performance monitoring and optimization utilities
import React, { useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCallTime: number;
  bundleSize: number;
  memoryUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number };
          if (fidEntry.processingStart) {
            console.log('FID:', fidEntry.processingStart - entry.startTime);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
          }
        });
        console.log('CLS:', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers.push(lcpObserver, fidObserver, clsObserver);
    }
  }

  // Measure API call performance
  measureApiCall<T>(apiCall: () => Promise<T>, endpoint: string): Promise<T> {
    const startTime = performance.now();
    
    return apiCall().then((result) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`API Call ${endpoint}: ${duration.toFixed(2)}ms`);
      
      this.metrics.push({
        loadTime: 0,
        renderTime: 0,
        apiCallTime: duration,
        bundleSize: 0,
      });
      
      return result;
    });
  }

  // Measure component render time
  measureRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Render ${componentName}: ${duration.toFixed(2)}ms`);
    
    this.metrics.push({
      loadTime: 0,
      renderTime: duration,
      apiCallTime: 0,
      bundleSize: 0,
    });
    
    return result;
  }

  // Get performance summary
  getSummary() {
    const totalMetrics = this.metrics.length;
    if (totalMetrics === 0) return null;

    const avgApiTime = this.metrics.reduce((sum, m) => sum + m.apiCallTime, 0) / totalMetrics;
    const avgRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalMetrics;

    return {
      totalMeasurements: totalMetrics,
      averageApiTime: avgApiTime,
      averageRenderTime: avgRenderTime,
      recommendations: this.getRecommendations(avgApiTime, avgRenderTime),
    };
  }

  private getRecommendations(avgApiTime: number, avgRenderTime: number): string[] {
    const recommendations: string[] = [];

    if (avgApiTime > 1000) {
      recommendations.push('API calls are slow (>1s). Consider implementing caching or optimizing backend.');
    }

    if (avgRenderTime > 100) {
      recommendations.push('Component renders are slow (>100ms). Consider using React.memo or useMemo.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Keep monitoring for any regressions.');
    }

    return recommendations;
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const measureRender = useCallback((renderFn: () => React.ReactNode) => {
    return performanceMonitor.measureRender(componentName, renderFn);
  }, [componentName]);

  const measureApiCall = useCallback(<T>(apiCall: () => Promise<T>, endpoint: string) => {
    return performanceMonitor.measureApiCall(apiCall, endpoint);
  }, []);

  return { measureRender, measureApiCall };
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return null;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const totalScriptSize = scripts.reduce((total, script) => {
    const src = script.getAttribute('src');
    if (src && src.includes('_next/static')) {
      // Estimate size based on URL patterns
      return total + 50; // Rough estimate in KB
    }
    return total;
  }, 0);

  return {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    estimatedTotalSize: totalScriptSize,
  };
}

  // Memory usage monitor
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return null;
  }

  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  if (!memory) return null;
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
  };
}

// Performance recommendations
export const PERFORMANCE_RECOMMENDATIONS = {
  IMAGES: [
    'Use Next.js Image component for automatic optimization',
    'Implement lazy loading for images below the fold',
    'Use WebP/AVIF formats for better compression',
    'Set appropriate sizes attribute for responsive images',
  ],
  
  BUNDLE: [
    'Implement code splitting for large components',
    'Use dynamic imports for heavy libraries',
    'Remove unused dependencies',
    'Optimize bundle with webpack-bundle-analyzer',
  ],
  
  API: [
    'Implement request caching with appropriate TTL',
    'Use pagination for large data sets',
    'Implement request deduplication',
    'Add request timeout handling',
  ],
  
  RENDERING: [
    'Use React.memo for expensive components',
    'Implement useMemo for expensive calculations',
    'Use useCallback for event handlers',
    'Avoid creating objects in render methods',
  ],
} as const;
