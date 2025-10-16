import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

// Set default configuration
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666';

// Set default responsive behavior
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

export { Chart };
