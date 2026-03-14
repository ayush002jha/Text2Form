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
      <div className="flex items-center justify-center h-64 text-muted-foreground font-pixel text-xl uppercase tracking-widest">
        No data available yet
      </div>
    );
  }

  return (
    <div data-testid="analytics-chart" className="w-full">
      <h3 className="text-foreground font-pixel text-xl uppercase tracking-widest mb-6 border-b-4 border-border/10 pb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" strokeOpacity={0.2} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--color-border)"
            tick={{ fill: "var(--color-foreground)", fontSize: 14, fontFamily: "var(--font-pixel)" }}
            tickLine={{ stroke: "var(--color-border)" }}
            tickMargin={12}
          />
          <YAxis
            stroke="var(--color-border)"
            tick={{ fill: "var(--color-foreground)", fontSize: 14, fontFamily: "var(--font-pixel)" }}
            tickLine={{ stroke: "var(--color-border)" }}
            allowDecimals={false}
            tickMargin={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "4px solid var(--color-border)",
              color: "var(--color-foreground)",
              padding: "16px",
              fontFamily: "var(--font-pixel)",
              fontSize: "18px",
              textTransform: "uppercase",
              boxShadow: "4px 4px 0px var(--color-border)"
            }}
            cursor={{ fill: "var(--color-secondary)", opacity: 0.1 }}
          />
          <Bar dataKey="count" radius={[0, 0, 0, 0]} maxBarSize={50}>
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
