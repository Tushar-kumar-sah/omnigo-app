'use client';
import dynamic from 'next/dynamic';
import React from 'react';

// Recharts does not support SSR — use dynamic imports to avoid prerender crash
const LazyLoad = (importFn: () => Promise<any>, exportName: string) =>
  dynamic(() => importFn().then((mod: any) => ({ default: mod[exportName] })), { ssr: false });

export const ResponsiveContainer = LazyLoad(() => import('recharts'), 'ResponsiveContainer');
export const LineChart = LazyLoad(() => import('recharts'), 'LineChart');
export const Line = LazyLoad(() => import('recharts'), 'Line');
export const XAxis = LazyLoad(() => import('recharts'), 'XAxis');
export const YAxis = LazyLoad(() => import('recharts'), 'YAxis');
export const Tooltip = LazyLoad(() => import('recharts'), 'Tooltip');
export const BarChart = LazyLoad(() => import('recharts'), 'BarChart');
export const Bar = LazyLoad(() => import('recharts'), 'Bar');
export const AreaChart = LazyLoad(() => import('recharts'), 'AreaChart');
export const Area = LazyLoad(() => import('recharts'), 'Area');
export const PieChart = LazyLoad(() => import('recharts'), 'PieChart');
export const Pie = LazyLoad(() => import('recharts'), 'Pie');
export const Cell = LazyLoad(() => import('recharts'), 'Cell');
