"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AnalyticsChartProps {
  data: { name: string; count: number }[];
  title: string;
}

const CHART_COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#ddd6fe",
  "#ede9fe",
];

export default function AnalyticsChart({ data, title }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm">
        No data available yet
      </div>
    );
  }

  return (
    <div data-testid="analytics-chart" className="w-full">
      <h3 className="text-white/70 text-sm font-medium mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,15,25,0.95)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "12px",
              color: "white",
              padding: "12px 16px",
            }}
            cursor={{ fill: "rgba(139,92,246,0.08)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
