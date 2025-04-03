"use client";
import { useState } from "react";
import { GetCandles, GetCryptoPrice } from "@/services/api-binance";

const BitcoinPrice = () => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);

  const fetchCurrentAndPreviousPrice = async () => {
    const now = Date.now();
    const endTime = now - 60000;
    const price = await GetCryptoPrice("BTCUSDT");
    setCurrentPrice(price);

    const candles = await GetCandles("1m", "BTCUSDT", 1, endTime);
    const previousCandle = candles[0];
    const previousPrice = previousCandle ? previousCandle.close : 0;
    setPreviousPrice(previousPrice);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={fetchCurrentAndPreviousPrice}
        className="px-6 py-3 text-white transition-colors duration-300 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Lấy giá Bitcoin
      </button>

      <div className="mt-6 text-center">
        {currentPrice !== null && (
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            Giá hiện tại:{" "}
            <span className="text-green-500">{currentPrice} USDT</span>
          </p>
        )}
      </div>
      <div className="mt-4 text-center">
        {previousPrice !== null && (
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            Giá 1 phút trước:{" "}
            <span className="text-red-500">{previousPrice} USDT</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default BitcoinPrice;
