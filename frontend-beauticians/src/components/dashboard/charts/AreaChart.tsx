'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export default function AreaChart({ data, height = 200, color = '#404040' }: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: DataPoint[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const width = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    if (!points.length) {
      ctx.fillStyle = '#9C9C9C';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available yet', canvas.width / 2, canvas.height / 2);
      return;
    }

    const chartPoints = points.length >= 2 ? points : [...points, { ...points[0] }];

    const values = chartPoints.map((d) => d.value);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Draw grid
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Create gradient for area
    const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');

    // Draw area
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    chartPoints.forEach((point, index) => {
      const x = padding + (width / (chartPoints.length - 1 || 1)) * index;
      const normalizedValue = (point.value - minValue) / range;
      const y = canvas.height - padding - normalizedValue * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close the path to create area
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw line on top
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const normalizedValue = (point.value - minValue) / range;
      const y = canvas.height - padding - normalizedValue * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#404040';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    chartPoints.forEach((point, index) => {
      const x = padding + (width / (chartPoints.length - 1 || 1)) * index;
      ctx.fillText(point.label, x, canvas.height - 10);
    });

  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={height}
      className="w-full"
      style={{ maxWidth: '100%' }}
    />
  );
}
