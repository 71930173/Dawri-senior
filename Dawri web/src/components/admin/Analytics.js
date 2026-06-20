import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { FaFilePdf, FaSync, FaCalendarAlt, FaChartLine, FaUsers, FaClock } from 'react-icons/fa';
import styled from 'styled-components';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  button {
    padding: 8px 20px;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      border-color: #2563eb;
      color: #2563eb;
      transform: translateY(-1px);
    }

    &.active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-color: #2563eb;
      color: white;
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
  }
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;

    &:hover {
      border-color: #2563eb;
      color: #2563eb;
      transform: translateY(-1px);
    }

    &.export-pdf {
      border-color: #ef4444;
      color: #ef4444;

      &:hover {
        background: #fee2e2;
        border-color: #dc2626;
        color: #dc2626;
      }
    }

    &.export-csv {
      border-color: #f59e0b;
      color: #f59e0b;

      &:hover {
        background: #fef3c7;
        border-color: #d97706;
        color: #d97706;
      }
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 24px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .body {
    height: 350px;
    position: relative;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    background: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    text-align: center;

    .value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }

    .label {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
  }
`;

const Analytics = () => {
  const [period, setPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState({
    servedOverTime: [],
    staffPerformance: [],
    waitTimeTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics(period);
      if (res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Analytics error:', err);
      toast.error('Failed to load analytics data');
      setAnalyticsData({
        servedOverTime: { labels: [], students: [], parents: [] },
        staffPerformance: { labels: [], served: [], avgTime: [] },
        waitTimeTrends: { labels: [], avgWait: [], peakWait: [] },
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const servedChartData = useMemo(() => ({
    labels: analyticsData.servedOverTime.labels || [],
    datasets: [
      {
        label: 'Students',
        data: analyticsData.servedOverTime.students || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Parents',
        data: analyticsData.servedOverTime.parents || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }), [analyticsData.servedOverTime]);

  const staffPerformanceData = useMemo(() => ({
    labels: analyticsData.staffPerformance.labels || [],
    datasets: [{
      label: 'People Served',
      data: analyticsData.staffPerformance.served || [],
      backgroundColor: '#2563eb',
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 48,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    }],
  }), [analyticsData.staffPerformance]);

  const waitTimeData = useMemo(() => ({
    labels: analyticsData.waitTimeTrends.labels || [],
    datasets: [
      {
        label: 'Average Wait',
        data: analyticsData.waitTimeTrends.avgWait || [],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
      },
      {
        label: 'Peak Wait',
        data: analyticsData.waitTimeTrends.peakWait || [],
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#ef4444',
      },
    ],
  }), [analyticsData.waitTimeTrends]);

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { padding: 20, font: { size: 13 }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 12 }, color: '#64748b' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: '#64748b' },
      },
    },
  }), []);

  const barOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 12 }, color: '#64748b' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, color: '#64748b' },
      },
    },
  }), []);

  const summaryStats = useMemo(() => {
    const students = analyticsData.servedOverTime.students || [];
    const parents = analyticsData.servedOverTime.parents || [];
    const totalStudents = students.reduce((a, b) => a + b, 0);
    const totalParents = parents.reduce((a, b) => a + b, 0);
    const avgWait = analyticsData.waitTimeTrends.avgWait || [];
    const avgWaitTime = avgWait.length ? Math.round(avgWait.reduce((a, b) => a + b, 0) / avgWait.length) : 0;

    return {
      totalServed: totalStudents + totalParents,
      totalStudents,
      totalParents,
      avgWaitTime,
    };
  }, [analyticsData]);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      window.print();
      toast.success('Analytics exported to PDF');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    try {
      setExporting(true);
      let csvContent = '';
      const dateStr = new Date().toISOString().split('T')[0];

      csvContent = 'ANALYTICS REPORT\n';
      csvContent += `Period,${period}\n`;
      csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;

      csvContent += 'SUMMARY STATS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Served,${summaryStats.totalServed}\n`;
      csvContent += `Total Students,${summaryStats.totalStudents}\n`;
      csvContent += `Total Parents,${summaryStats.totalParents}\n`;
      csvContent += `Avg Wait Time (min),${summaryStats.avgWaitTime}\n\n`;

      csvContent += 'SERVED OVER TIME CHART\n';
      csvContent += 'Period,Students,Parents\n';
      analyticsData.servedOverTime.labels.forEach((label, i) => {
        csvContent += `${label},${analyticsData.servedOverTime.students[i] || 0},${analyticsData.servedOverTime.parents[i] || 0}\n`;
      });
      csvContent += '\n';

      csvContent += 'STAFF PERFORMANCE CHART\n';
      csvContent += 'Staff Name,People Served,Avg Time (min)\n';
      analyticsData.staffPerformance.labels.forEach((label, i) => {
        csvContent += `${label},${analyticsData.staffPerformance.served[i] || 0},${analyticsData.staffPerformance.avgTime[i] || 0}\n`;
      });
      csvContent += '\n';

      csvContent += 'WAIT TIME TRENDS CHART\n';
      csvContent += 'Period,Avg Wait (min),Peak Wait (min)\n';
      analyticsData.waitTimeTrends.labels.forEach((label, i) => {
        csvContent += `${label},${analyticsData.waitTimeTrends.avgWait[i] || 0},${analyticsData.waitTimeTrends.peakWait[i] || 0}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analytics_${period}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Analytics exported to CSV with chart data');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  }, [analyticsData, summaryStats, period]);

  return (
    <div>
      <ActionBar>
        <PeriodSelector>
          {['day', 'week', 'month', 'year'].map(p => (
            <button
              key={p}
              className={period === p ? 'active' : ''}
              onClick={() => setPeriod(p)}
            >
              <FaCalendarAlt />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </PeriodSelector>

        <ExportButtons>
          <button className="export-pdf" onClick={() => handleExport()} disabled={exporting}>
            <FaFilePdf /> Export PDF
          </button>
          <button className="export-csv" onClick={() => handleExportCSV()} disabled={exporting}>
            <span>📄</span> Export CSV
          </button>
          <button onClick={loadAnalytics} disabled={loading}>
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
        </ExportButtons>
      </ActionBar>

      <StatsBar>
        <div className="stat-item">
          <div className="value" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '2px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="value">{summaryStats.totalServed}</div>
          <div className="label">Total Served</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#2563eb' }}>{summaryStats.totalStudents}</div>
          <div className="label">Students</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#10b981' }}>{summaryStats.totalParents}</div>
          <div className="label">Parents</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#f59e0b' }}>{summaryStats.avgWaitTime}m</div>
          <div className="label">Avg Wait</div>
        </div>
      </StatsBar>

      <ChartsGrid>
        <ChartCard>
          <div className="header">
            <h3><FaChartLine style={{ marginRight: '8px', color: '#2563eb' }} /> Served Over Time</h3>
          </div>
          <div className="body">
            <Line data={servedChartData} options={lineOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>

      <TwoColumnGrid>
        <ChartCard>
          <div className="header">
            <h3><FaUsers style={{ marginRight: '8px', color: '#2563eb' }} /> Staff Performance</h3>
          </div>
          <div className="body">
            <Bar data={staffPerformanceData} options={barOptions} />
          </div>
        </ChartCard>

        <ChartCard>
          <div className="header">
            <h3><FaClock style={{ marginRight: '8px', color: '#f59e0b' }} /> Wait Time Trends</h3>
          </div>
          <div className="body">
            <Line data={waitTimeData} options={lineOptions} />
          </div>
        </ChartCard>
      </TwoColumnGrid>
    </div>
  );
};

export default React.memo(Analytics);