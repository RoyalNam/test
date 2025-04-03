import { useState, useEffect, useCallback } from "react";
import { GetCandles } from "@/services/api-binance";
import { Timeframe } from "@/types";

// hook để lấy dữ liệu Bitcoin từ API với một interval
const useBitcoinData = (interval: Timeframe = "1m") => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadMoreFlag, setLoadMoreFlag] = useState(false);

  // fetch data
  const fetchBitcoinData = useCallback(
    async (endTime: number | null = null) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const candles = await GetCandles(interval, "BTCUSDT", 1000, endTime);

        if (candles?.length > 0) {
          const formattedData = candles.map((candle) => ({
            time: candle.openTime,
            ...candle,
          }));

          setData((prevData) => {
            const mergedData = [...prevData, ...formattedData];
            const uniqueData = Array.from(
              new Map(mergedData.map((item) => [item.time, item])).values()
            ).sort((a, b) => a.time - b.time);

            return uniqueData;
          });

          if (candles.length < 1000) {
            setHasMoreData(false);
          }
        }
      } catch {
        setError("Error fetching Bitcoin data");
      } finally {
        setLoading(false);
      }
    },
    [interval]
  );

  // reset
  const resetData = useCallback(() => {
    setData([]);
    setHasMoreData(true);
  }, []);

  // reset và lấy data khi interval thay đổi
  useEffect(() => {
    resetData();
    fetchBitcoinData();
  }, [interval]);

  // load thêm dữ liệu khi có flagLoadmore
  useEffect(() => {
    if (loadMoreFlag && hasMoreData && !loading && data.length > 0) {
      const endTime = data[0].time - 60;
      if (endTime) {
        fetchBitcoinData(endTime);
      }
      setLoadMoreFlag(false);
    }
  }, [loadMoreFlag, data, hasMoreData, loading, fetchBitcoinData]);

  // Kích hoạt flag loadmore
  const loadMoreData = () => {
    if (!loading && hasMoreData) {
      setLoadMoreFlag(true);
    }
  };

  return {
    data,
    loading,
    error,
    hasMoreData,
    resetData,
    loadMoreData,
  };
};

export default useBitcoinData;
