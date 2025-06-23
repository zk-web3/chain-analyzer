'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip as ChartJSTooltip,
  Legend,
} from 'chart.js';
import { useChainData } from '../utils/useChainData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartJSTooltip, Legend);

export type ChartData = { time: string; value: number };

function isChartData(obj: any): obj is { labels: any[]; values: any[] } {
  return obj && Array.isArray(obj.labels) && Array.isArray(obj.values);
}

export default function ChainChart({ chainKey }: { chainKey: string }) {
  const { stats, loading } = useChainData(chainKey);
  const chartData = (stats && 'chartData' in stats && isChartData(stats.chartData)) ? stats.chartData : { labels: [], values: [] };
  const chartJsData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Transactions',
        data: chartData.values,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.2)',
        tension: 0.4,
      },
    ],
  };
  return (
    <div className="glass-card glow-border p-4 rounded-xl w-full">
      <div className="font-bold text-lg mb-2 neon-text">Transactions Over Time</div>
      {loading ? (
        <div className="animate-pulse">Loading chart...</div>
      ) : (
        <Line data={chartJsData} options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: '#222' } }, y: { grid: { color: '#222' } } },
        }} />
      )}
    </div>
  );
} 