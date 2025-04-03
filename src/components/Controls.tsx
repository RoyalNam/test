import { ChartType, Theme, Timeframe } from "@/types";
import Icon from "./Icon";
import {
  CANDLESTICK_CHART_PATH,
  VOLUME_CHART_PATH,
  MOON_PATH,
  SUN_PATH,
} from "@/types/iconsPath";

interface ControlsProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  chartType: ChartType;
  setChartType: (chartType: ChartType) => void;
  timeframe: Timeframe;
  setTimeframe: (timeframe: Timeframe) => void;
}

const Controls = ({
  theme,
  setTheme,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
}: ControlsProps) => {
  const timeframes: { value: Timeframe; label: string }[] = [
    { value: "1m", label: "1 minute" },
    { value: "5m", label: "5 minutes" },
    { value: "30m", label: "30 minutes" },
    { value: "1h", label: "1 hour" },
    { value: "4h", label: "4 hours" },
    { value: "1d", label: "1 day" },
    { value: "1w", label: "1 week" },
    { value: "1M", label: "1 month" },
  ];

  return (
    <div
      className={`w-full flex gap-6 items-center justify-between pt-4 pb-2 border-b dark:border-white/30 mb-6`}
    >
      <div className="flex items-center gap-6">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`p-1.5 rounded bg-cyan-600 hover:bg-cyan-700 transition`}
        >
          <Icon path={theme === "dark" ? SUN_PATH : MOON_PATH} />
        </button>

        <div className={`flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1`}>
          <button
            onClick={() => setChartType("volume")}
            className={`flex items-center gap-0.5 justify-center w-12 h-10 rounded-md transition ${
              chartType === "volume"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Icon path={VOLUME_CHART_PATH} />
          </button>
          <button
            onClick={() => setChartType("candlestick")}
            className={`flex items-center justify-center w-12 h-10 rounded-md transition ${
              chartType === "candlestick"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Icon path={CANDLESTICK_CHART_PATH} />
          </button>
        </div>
      </div>

      <div
        className={`hidden md:flex gap-0.5 bg-gray-200 dark:bg-gray-500 rounded-lg p-1`}
      >
        {timeframes.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeframe(option.value)}
            className={`rounded-md transition w-12 h-10 ${
              timeframe === option.value
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-700"
            }`}
          >
            {option.value}
          </button>
        ))}
      </div>

      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        className="p-3 bg-gray-500 rounded md:hidden "
      >
        {timeframes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Controls;
