'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export default function LineChart({ data, height = 200, color = '#000000' }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Normalise incoming data into a consistent array shape
    const points: DataPoint[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const width = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Early return with placeholder text when no data is available
    if (!points.length) {
      ctx.fillStyle = '#9C9C9C';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available yet', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Ensure we always have at least two points to avoid divide-by-zero when drawing the line
    const chartPoints = points.length >= 2 ? points : [...points, { ...points[0] }];

    // Find min and max values
    const values = chartPoints.map((d) => d.value);
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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
    ctx.stroke();

    // Draw points
    chartPoints.forEach((point, index) => {
      const x = padding + (width / (chartPoints.length - 1 || 1)) * index;
      const normalizedValue = (point.value - minValue) / range;
      const y = canvas.height - padding - normalizedValue * chartHeight;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

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
