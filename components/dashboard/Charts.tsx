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

const barData = {
  labels: [
    "Nairobi",
    "Cape Town",
    "Harara",
    "Bulawayo",
    "Mutare",
    "Gweru",
    "Kwekwe",
    "Chitungwiza",
  ],
  datasets: [
    {
      label: "Most Common Routes",
      data: [33, 25, 20, 15, 10, 5, 0, 0],
      backgroundColor: "#FFCE56",
      borderColor: "#FFCE56",
      borderWidth: 1,
      borderRadius: 20,
      barPercentage: 0.5,
      barThickness: 20,
    },
  ],
};

const barOptions = {
  plugins: {
    legend: {
      display: false, // Hides the legend
    },
  },
  scales: {
    x: {
      grid: {
        display: true, // Hides vertical grid lines
        drawBorder: false, // Hides border on the y-axis
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

const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Income Overview",
      data: [200, 300, 250, 400, 450, 500],
      fill: true,
      backgroundColor: "rgba(245, 40, 145, 0.8)",
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
        display: true, // Hides vertical grid lines
        drawBorder: false, // Hides border on the y-axis
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

export const CommonRoutes = () => (
  <Bar data={barData} options={barOptions} height={100} />
);

export const IncomeChart = () => (
  <Line data={lineData} options={lineOptions} height={100} />
);
