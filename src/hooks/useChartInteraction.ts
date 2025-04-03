import { useEffect, useRef } from "react";
import { IChartApi } from "lightweight-charts";

// Hook xử lý tương tác với biểu đồ, load thêm data khi người dùng cuộn gần mép trái
const useChartInteraction = (
  chart: IChartApi | null,
  hasMoreData: boolean,
  loading: boolean,
  loadMoreData: () => void,
  data: any[]
) => {
  const isMouseDown = useRef(false);
  const isCalledOnce = useRef(false);

  useEffect(() => {
    if (!chart || !hasMoreData || loading) return;

    const handleMouseDown = () => {
      isMouseDown.current = true;
      isCalledOnce.current = false;
    };

    const handleMouseMove = () => {
      if (
        !isMouseDown.current ||
        loading ||
        !hasMoreData ||
        isCalledOnce.current
      )
        return;

      chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
        if (
          logicalRange &&
          logicalRange.from < 10 &&
          data.length > 0 &&
          hasMoreData
        ) {
          if (!isCalledOnce.current) {
            isCalledOnce.current = true;
            loadMoreData();
          }
        }
      });
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(() => {});
    };

    const chartContainer = chart.chartElement();
    chartContainer?.addEventListener("mousedown", handleMouseDown);
    chartContainer?.addEventListener("mousemove", handleMouseMove);
    chartContainer?.addEventListener("mouseup", handleMouseUp);

    return () => {
      chartContainer?.removeEventListener("mousedown", handleMouseDown);
      chartContainer?.removeEventListener("mousemove", handleMouseMove);
      chartContainer?.removeEventListener("mouseup", handleMouseUp);
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(() => {});
    };
  }, [chart, data, hasMoreData, loading]);
};

export default useChartInteraction;
