"use client";
import { useEffect, useState } from "react";
import { ChartType, Theme, Timeframe } from "@/types";
import Controls from "@/components/Controls";
import ChartContainer from "@/components/ChartContainer";
import BitcoinPrice from "@/components/BitcoinPrice";

const HomePage = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="h-screen bg-white dark:bg-black">
      <div className="w-full px-4 mx-auto max-w-7xl">
        <Controls
          theme={theme}
          setTheme={setTheme}
          chartType={chartType}
          setChartType={setChartType}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
        <ChartContainer
          theme={theme}
          chartType={chartType}
          timeframe={timeframe}
        />
        <BitcoinPrice />
      </div>
    </div>
  );
};

export default HomePage;
