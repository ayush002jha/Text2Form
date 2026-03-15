"use client";

import React, { useEffect, useState, memo, useMemo } from "react";

const COLORS = ["bg-primary", "bg-secondary", "bg-accent"];

const GridCell = memo(() => {
  const config = useMemo(() => ({
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4
  }), []);

  return (
    <div className="w-16 h-16 border-[1px] border-border/[0.03] relative overflow-hidden">
      <div 
        className={`absolute inset-0 ${config.color} opacity-0 animate-grid-pulse`}
        style={{ 
          "--pulse-delay": `${config.delay}s`, 
          "--pulse-duration": `${config.duration}s` 
        } as any}
      />
    </div>
  );
});

GridCell.displayName = "GridCell";

export const InteractiveGrid = () => {
  const [cells, setCells] = useState(0);

  useEffect(() => {
    const calculateCells = () => {
      const columns = Math.ceil(window.innerWidth / 64) + 1;
      const rows = Math.ceil(window.innerHeight / 64) + 1;
      setCells(columns * rows);
    };

    calculateCells();
    window.addEventListener("resize", calculateCells);
    return () => window.removeEventListener("resize", calculateCells);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div 
        className="flex flex-wrap"
        style={{ width: 'calc(100% + 64px)' }}
      >
        {Array.from({ length: cells }).map((_, i) => (
          <GridCell key={i} />
        ))}
      </div>
    </div>
  );
};
