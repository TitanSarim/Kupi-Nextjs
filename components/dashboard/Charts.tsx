import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOptions } from "chart.js";

interface LineChartInterface {
  labels: string[];
  data: number[];
}

interface BarChartInterface {
  labels: string[];
  count: number[];
}

type TickCallback = (value: number) => string;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const CommonRoutes: React.FC<BarChartInterface> = ({
  labels,
  count,
}) => {
  const combinedData = labels.map((label, index) => ({
    label,
    count: count[index],
  }));

  combinedData.sort((a, b) => b.count - a.count);

  const limitedData = combinedData.slice(0, 10);

  const limitedLabels = limitedData.map((item) => item.label);
  const limitedCounts = limitedData.map((item) => item.count);

  const barData = {
    labels: limitedLabels,
    datasets: [
      {
        label: "Most Common Routes",
        data: limitedCounts,
        backgroundColor: "#FFCE56",
        borderColor: "#FFCE56",
        borderWidth: 1,
        borderRadius: 20,
        barPercentage: 0.5,
        barThickness: 20,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
        },
        ticks: {
          callback: (value: string | number): string => {
            if (typeof value === "number") {
              const label = limitedLabels[value];
              const parts = label.split("\n");
              const departureCity = parts[0]?.replace("D - ", "").trim();
              return departureCity;
            }
            return "";
          },
          font: {
            size: 10,
            family: "Arial",
            weight: "bold",
          },
        },
      },
      y: {
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
        },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={barData} options={barOptions} height={100} />;
};

export const IncomeChart: React.FC<LineChartInterface> = ({ labels, data }) => {
  const lineData = {
    labels, // Use labels from props
    datasets: [
      {
        label: "Income",
        data, // Use data from props
        fill: true,
        backgroundColor: "rgba(228, 228, 228, 0.3)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
    },
    scales: {
      x: {
        grid: {
          display: true, // Shows vertical grid lines
          drawBorder: false, // Hides border on the x-axis
          drawOnChartArea: false, // Keeps the grid in the chart area
          drawTicks: true,
        },
      },
      y: {
        grid: {
          display: true, // Shows horizontal grid lines
          drawBorder: false, // Hides border on the y-axis
          drawOnChartArea: false, // Keeps the grid in the chart area
          drawTicks: true, // Shows ticks on the y-axis
        },
        beginAtZero: true, // Ensures y-axis starts at zero
      },
    },
  };

  return <Line data={lineData} options={lineOptions} height={100} />;
};
