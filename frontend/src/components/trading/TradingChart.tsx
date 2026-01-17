import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickData, Time, IChartApi, CandlestickSeries } from 'lightweight-charts';

interface TradingChartProps {
  data: CandlestickData<Time>[];
  symbol: string;
  className?: string;
}

const TradingChart = ({ data, symbol, className = '' }: TradingChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);

  // Déterminer le nombre de décimales basé sur la valeur du prix
  const getPrecision = (prices: number[]) => {
    if (prices.length === 0) return 2;
    const maxPrice = Math.max(...prices);
    // Actions BVC marocaines (prix élevés en MAD: 120-3850)
    if (maxPrice >= 1000) return 0;  // LBL, GAZ, CDM, MNG (1000-3850 MAD)
    if (maxPrice >= 100) return 1;   // IAM, ATW, BCP, CIH, SNI, TQM (100-900 MAD)
    return 2;                         // Actions USD standards (<100)
  };

  // Formatter pour afficher les prix avec séparateurs de milliers
  const formatPrice = (price: number, precision: number) => {
    return price.toLocaleString('fr-FR', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Calculer la précision basée sur les données
    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const precision = getPrecision(allPrices);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(0 0% 70%)',
      },
      grid: {
        vertLines: { color: 'hsl(240 5% 20%)' },
        horzLines: { color: 'hsl(240 5% 20%)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'hsl(187 100% 50%)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'hsl(187 100% 50%)',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(240 5% 25%)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: 'hsl(240 5% 25%)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      localization: {
        priceFormatter: (price: number) => {
          return formatPrice(price, precision);
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',        // Vert vif pour les bougies haussières
      downColor: '#ef4444',      // Rouge vif pour les bougies baissières
      borderUpColor: '#16a34a',  // Bordure vert foncé pour hausse
      borderDownColor: '#dc2626', // Bordure rouge foncé pour baisse
      wickUpColor: '#22c55e',    // Mèche verte pour hausse
      wickDownColor: '#ef4444',  // Mèche rouge pour baisse
    });

    candlestickSeriesRef.current = candlestickSeries;

    if (data.length > 0) {
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-10">
        <span className="text-lg font-bold text-foreground">{symbol}</span>
      </div>
      <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};

export default TradingChart;
