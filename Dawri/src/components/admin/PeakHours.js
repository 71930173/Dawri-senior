import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FaFire, FaMapMarkerAlt, FaFilePdf, FaSync, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styled from 'styled-components';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -5px rgba(0,0,0,0.15);
  }

  .icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;

    ${props => props.type === 'peak' && `
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #d97706;
    `}
    ${props => props.type === 'section' && `
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #2563eb;
    `}
    ${props => props.type === 'avg' && `
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #059669;
    `}
  }

  .info {
    .label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .value {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }

    .change {
      font-size: 12px;
      color: #94a3b8;
    }
  }
`;

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

const SectionCard = styled.div`
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 14px 16px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  tr {
    transition: all 0.2s;

    &:hover td {
      background: #f8fafc;
    }
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 8px;

    .bar {
      height: 8px;
      border-radius: 4px;
      background: #e2e8f0;
      flex: 1;
      overflow: hidden;

      .fill {
        height: 100%;
        border-radius: 4px;
        background: linear-gradient(90deg, #2563eb, #1d4ed8);
        transition: width 0.3s;
      }
    }

    .text {
      font-size: 12px;
      color: #64748b;
      min-width: 40px;
      font-weight: 500;
    }
  }

  .badge {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    &.high {
      background: #fee2e2;
      color: #dc2626;
    }

    &.medium {
      background: #fef3c7;
      color: #d97706;
    }

    &.low {
      background: #d1fae5;
      color: #059669;
    }
  }
`;

const PeakHours = () => {
  const [period, setPeriod] = useState('day');
  const [peakData, setPeakData] = useState({
    peakHour: '10:00 AM',
    busiestSection: 'Admission',
    busiestPercentage: 45,
    avgWaitTime: 12,
    hourlyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadPeakHours = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getPeakHours(period);
      if (res.data) {
        setPeakData(res.data);
      }
    } catch (err) {
      console.error('Peak hours error:', err);
      const serverData = err.response?.data || {};
      const serverMsg = serverData.error || serverData.details || err.message;
      const fullError = serverData.sql ? `${serverMsg} (SQL: ${serverData.sql})` : serverMsg;
      toast.error(`Peak hours failed: ${fullError}`, { autoClose: 10000 });
      setPeakData({
        peakHour: 'N/A',
        busiestSection: 'N/A',
        busiestPercentage: 0,
        avgWaitTime: 0,
        hourlyData: [],
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadPeakHours();
  }, [loadPeakHours]);

  const chartData = useMemo(() => ({
    labels: peakData.hourlyData.map(d => d.hour),
    datasets: [
      {
        label: 'Students',
        data: peakData.hourlyData.map(d => d.students),
        backgroundColor: '#2563eb',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 48,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: 'Parents',
        data: peakData.hourlyData.map(d => d.parents),
        backgroundColor: '#10b981',
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 48,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }), [peakData.hourlyData]);

  const waitTimeData = useMemo(() => ({
    labels: peakData.hourlyData.map(d => d.hour),
    datasets: [{
      label: 'Average Wait Time (min)',
      data: peakData.hourlyData.map(d => d.avgWait),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  }), [peakData.hourlyData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: () => {},
    onHover: (event, chartElement) => {
      if (event?.native?.target) {
        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    },
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

  const lineOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onClick: () => {},
    onHover: (event, chartElement) => {
      if (event?.native?.target) {
        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    },
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

  const getTrafficBadge = useCallback((total) => {
    if (total >= 50) return { class: 'high', text: 'High' };
    if (total >= 30) return { class: 'medium', text: 'Medium' };
    return { class: 'low', text: 'Low' };
  }, []);

  const maxTotal = useMemo(() => 
    Math.max(...peakData.hourlyData.map(d => d.total), 1)
  , [peakData.hourlyData]);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      window.print();
      toast.success('Exported to PDF');
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

      csvContent = 'PEAK HOURS REPORT\n';
      csvContent += `Period,${period}\n`;
      csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;

      csvContent += 'SUMMARY STATS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Peak Hour,${peakData.peakHour}\n`;
      csvContent += `Busiest Section,${peakData.busiestSection}\n`;
      csvContent += `Busiest Percentage,${peakData.busiestPercentage}%\n`;
      csvContent += `Avg Wait Time (min),${peakData.avgWaitTime || 12}\n\n`;

      csvContent += 'TRAFFIC BY HOUR CHART\n';
      csvContent += 'Hour,Students,Parents,Total,Avg Wait (min)\n';
      peakData.hourlyData.forEach(d => {
        csvContent += `${d.hour},${d.students},${d.parents},${d.total},${d.avgWait}\n`;
      });
      csvContent += '\n';

      csvContent += 'WAIT TIME TRENDS CHART\n';
      csvContent += 'Hour,Avg Wait (min)\n';
      peakData.hourlyData.forEach(d => {
        csvContent += `${d.hour},${d.avgWait}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `peak_hours_${period}_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Peak hours exported to CSV with chart data');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  }, [peakData, period]);

  return (
    <div>
      <ActionBar>
        <PeriodSelector>
          {['day', 'week', 'month'].map(p => (
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
          <button onClick={loadPeakHours} disabled={loading}>
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
        </ExportButtons>
      </ActionBar>

      <StatsGrid>
        <StatCard type="peak">
          <div className="icon"><FaFire /></div>
          <div className="info">
            <div className="label">Peak Hour</div>
            <div className="value">{peakData.peakHour}</div>
            <div className="change">Highest traffic period</div>
          </div>
        </StatCard>

        <StatCard type="section">
          <div className="icon"><FaMapMarkerAlt /></div>
          <div className="info">
            <div className="label">Busiest Section</div>
            <div className="value">{peakData.busiestSection}</div>
            <div className="change">{peakData.busiestPercentage}% of total traffic</div>
          </div>
        </StatCard>

        <StatCard type="avg">
          <div className="icon"><FaClock /></div>
          <div className="info">
            <div className="label">Avg Wait Time</div>
            <div className="value">{peakData.avgWaitTime || 12} min</div>
            <div className="change">During peak hours</div>
          </div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <div className="header">
            <h3>Traffic by Hour - {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
          </div>
          <div className="body">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>

      <ChartsGrid>
        <ChartCard>
          <div className="header">
            <h3>Wait Time Trends</h3>
          </div>
          <div className="body">
            <Line data={waitTimeData} options={lineOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>

      <SectionCard>
        <div className="header">
          <h3>Hourly Breakdown</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th>Hour</th>
                <th>Students</th>
                <th>Parents</th>
                <th>Total</th>
                <th>Traffic Level</th>
                <th>Avg Wait</th>
              </tr>
            </thead>
            <tbody>
              {peakData.hourlyData.map((row, idx) => {
                const badge = getTrafficBadge(row.total);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.hour}</td>
                    <td>{row.students}</td>
                    <td>{row.parents}</td>
                    <td>
                      <div className="status-bar">
                        <div className="bar">
                          <div 
                            className="fill" 
                            style={{ width: `${(row.total / maxTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text">{row.total}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badge.class}`}>{badge.text}</span>
                    </td>
                    <td>{row.avgWait} min</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
};

export default React.memo(PeakHours);