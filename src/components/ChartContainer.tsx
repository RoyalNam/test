import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  IChartApi,
  HistogramSeries,
} from "lightweight-charts";
import useBitcoinData from "@/hooks/useBitcoinData";
import useChartInteraction from "../hooks/useChartInteraction";
import { ChartType, Theme, Timeframe } from "@/types";

interface ChartContainerProps {
  theme: Theme;
  chartType: ChartType;
  timeframe: Timeframe;
}

const ChartContainer = ({
  theme,
  chartType,
  timeframe,
}: ChartContainerProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const firstLoad = useRef(true);

  const { data, loading, error, hasMoreData, loadMoreData } =
    useBitcoinData(timeframe);

  // Khởi tạo biểu đồ và series
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const newChart = createChart(chartContainerRef.current, {
      height: 500,
      layout: {
        background: { color: theme === "dark" ? "#1e1e1e" : "#ffffff" },
        textColor: theme === "dark" ? "#ffffff" : "#000000",
      },
    });

    setChart(newChart);

    candlestickSeriesRef.current = newChart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    volumeSeries.current = newChart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
    });

    // Tự động resize biểu đồ khi kích thước thay đổi
    const resizeObserver = new ResizeObserver(() => {
      newChart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
      });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      newChart.remove();
    };
  }, []);

  // cap nhat theme
  useEffect(() => {
    if (!chart) return;
    chart.applyOptions({
      layout: {
        background: { color: theme === "dark" ? "#1e1e1e" : "#ffffff" },
        textColor: theme === "dark" ? "#ffffff" : "#000000",
      },
    });
  }, [theme]);

  // reset dữ liệu khi timeframe thay đổi
  useEffect(() => {
    if (!chart || !candlestickSeriesRef.current || !volumeSeries.current)
      return;

    firstLoad.current = true;
    candlestickSeriesRef.current.setData([]);
    volumeSeries.current.setData([]);
  }, [timeframe]);

  // Update data lên biểu đồ
  useEffect(() => {
    if (
      !chart ||
      !candlestickSeriesRef.current ||
      !volumeSeries.current ||
      loading ||
      error
    )
      return;

    if (chartType === "candlestick") {
      candlestickSeriesRef.current.setData(data);
      volumeSeries.current.setData([]);
    } else {
      volumeSeries.current.setData(
        data.map((d) => ({
          time: d.time,
          value: d.volume,
          color: d.close > d.open ? "green" : "red",
        }))
      );
      candlestickSeriesRef.current.setData([]);
    }

    if (firstLoad.current) {
      chart.timeScale().fitContent();
      firstLoad.current = false;
    }
  }, [data, chartType, loading, error]);

  // Xử lý tương tác với biểu đồ
  useChartInteraction(chart, hasMoreData, loading, loadMoreData, data);

  return <div ref={chartContainerRef} className="w-full"></div>;
};

export default ChartContainer;
