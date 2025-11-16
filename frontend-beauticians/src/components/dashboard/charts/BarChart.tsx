'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export default function BarChart({ data, height = 200, color = '#000000' }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Validate data
    if (!data || !Array.isArray(data) || data.length === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const width = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
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

    // Draw bars
    const barWidth = width / data.length * 0.6;
    const barSpacing = width / data.length;

    data.forEach((point, index) => {
      const barHeight = ((point.value - minValue) / range) * chartHeight;
      const x = padding + barSpacing * index + barSpacing / 2 - barWidth / 2;
      const y = padding + chartHeight - barHeight;

      // Gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, '#000000');
      gradient.addColorStop(1, '#666666');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [8, 8, 0, 0]);
      ctx.fill();

      // Draw value on top
      ctx.fillStyle = '#666666';
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5);
    });

    // Draw labels
    ctx.fillStyle = '#404040';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      const x = padding + barSpacing * index + barSpacing / 2;
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
