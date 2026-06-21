import React, { useState, useEffect, useCallback, useRef } from 'react';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaUserGraduate, FaUserFriends, FaUsers, FaClock, 
  FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaDownload,
  FaExclamationTriangle, FaRedo, FaChartLine, FaSpinner, FaFileCsv
} from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styled, { keyframes } from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  button {
    padding: 10px 20px;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      border-color: #1e40af;
      color: #1e40af;
      transform: translateY(-1px);
    }

    &.active {
      background: #1e40af;
      border-color: #1e40af;
      color: white;
      box-shadow: 0 4px 12px rgba(30,64,175,0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
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
  animation: ${fadeIn} 0.5s ease-out;
  transition: all 0.3s;
  border-left: 4px solid;
  border-color: ${props => {
    switch(props.type) {
      case 'students': return '#1e40af';
      case 'guests': return '#db2777';
      case 'total': return '#10b981';
      case 'avg': return '#f59e0b';
      default: return '#64748b';
    }
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1);
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
    background: ${props => {
      switch(props.type) {
        case 'students': return '#dbeafe';
        case 'guests': return '#fce7f3';
        case 'total': return '#d1fae5';
        case 'avg': return '#fef3c7';
        default: return '#f1f5f9';
      }
    }};
    color: ${props => {
      switch(props.type) {
        case 'students': return '#1e40af';
        case 'guests': return '#db2777';
        case 'total': return '#10b981';
        case 'avg': return '#f59e0b';
        default: return '#64748b';
      }
    }};
  }

  .info {
    flex: 1;

    .label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
    }

    .sub {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.6s ease-out;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .body {
    height: 300px;
    position: relative;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.7s ease-out;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px 16px;
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

  tr:hover td {
    background: #f8fafc;
  }

  .badge {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    &.student {
      background: #dbeafe;
      color: #1e40af;
    }

    &.guest {
      background: #fce7f3;
      color: #db2777;
    }
  }

  .time {
    color: #64748b;
    font-size: 13px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportWrapper = styled.div`
  background: #f8fafc;
  padding: 0 0 20px 0;
`;

const MyStats = () => {
  const [period, setPeriod] = useState('day');
  const [stats, setStats] = useState({
    studentsServed: 0,
    parentsServed: 0,
    totalServed: 0,
    avgServiceTime: 0,
    avgWaitTime: 0,
    peakWaitTime: 0,
    servedOverTime: { labels: [], students: [], parents: [], total: [] },
    waitTimeTrends: { labels: [], avgWait: [], peakWait: [], count: [] },
    recentServed: [],
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const exportRef = useRef(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await staffAPI.getMyStats(period);

      if (res.data?.success) {
        setStats({
          studentsServed: res.data.summary?.studentsServed || 0,
          parentsServed: res.data.summary?.parentsServed || 0,
          totalServed: res.data.summary?.totalServed || 0,
          avgServiceTime: res.data.summary?.avgServiceTime || 0,
          avgWaitTime: res.data.summary?.avgWaitTime || 0,
          peakWaitTime: res.data.summary?.peakWaitTime || 0,
          servedOverTime: res.data.servedOverTime || { labels: [], students: [], parents: [], total: [] },
          waitTimeTrends: res.data.waitTimeTrends || { labels: [], avgWait: [], peakWait: [], count: [] },
          recentServed: res.data.recentServed || [],
        });
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Stats load error:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);

    try {
      const element = exportRef.current;
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        logging: false,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { opacity: 1 !important; }
            canvas { opacity: 1 !important; }
            .StatCard, .ChartCard, .SectionCard, [class*="Card"] { 
              background: #ffffff !important; 
              opacity: 1 !important;
            }
            td, th { background: #ffffff !important; }
            th { background: #f8fafc !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pdfWidth - (margin * 2);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = usableWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      let heightLeft = scaledHeight;

      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Statistics Report - ${period.charAt(0).toUpperCase() + period.slice(1)}`, margin, 12);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 18);

      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, 22, pdfWidth - margin, 22);

      const headerOffset = 28;
      let currentY = headerOffset;

      pdf.addImage(imgData, 'JPEG', margin, currentY, usableWidth, scaledHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - headerOffset);

      while (heightLeft > 0) {
        pdf.addPage();
        const position = heightLeft - scaledHeight + currentY;
        pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, scaledHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(`stats_export_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Statistics exported as PDF successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Ticket #', 'Type', 'Name', 'Issue Type', 'Service Time (min)', 'Completed At'];
      const rows = stats.recentServed.map(item => [
        item.ticket_number || '',
        item.user_type === 'student' ? 'Student' : 'Guest',
        item.user_name || '',
        item.issue_type || 'General',
        item.actual_service_minutes || '',
        item.completed_at ? new Date(item.completed_at).toLocaleString() : 
        item.served_at ? new Date(item.served_at).toLocaleString() : ''
      ]);

      const summaryRows = [
        ['', '', '', '', '', ''],
        ['Summary', '', '', '', '', ''],
        ['Students Served', stats.studentsServed, '', '', '', ''],
        ['Parents Served', stats.guestsServed, '', '', '', ''],
        ['Total Served', stats.totalServed, '', '', '', ''],
        ['Avg Service Time (min)', stats.avgServiceTime, '', '', '', ''],
        ['Avg Wait Time (min)', stats.avgWaitTime, '', '', '', ''],
        ['Peak Wait Time (min)', stats.peakWaitTime, '', '', '', ''],
        ['', '', '', '', '', ''],
        ['Period', period, '', '', '', ''],
        ['Generated', new Date().toLocaleString(), '', '', '', '']
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const str = String(cell).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(',')),
        ...summaryRows.map(row => row.map(cell => {
          const str = String(cell).replace(/"/g, '""');
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stats_export_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Statistics exported as CSV successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('Failed to export CSV');
    }
  };

  const hasData = stats.servedOverTime.labels.length > 0;

  const servedChartData = {
    labels: stats.servedOverTime.labels,
    datasets: [
      {
        label: 'Students',
        data: stats.servedOverTime.students,
        backgroundColor: '#1e40af',
        borderRadius: 6,
        barThickness: 20,
      },
      {
        label: 'Parents',
        data: stats.servedOverTime.parents,
        backgroundColor: '#db2777',
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const waitTimeChartData = {
    labels: stats.waitTimeTrends.labels,
    datasets: [
      {
        label: 'Average Wait',
        data: stats.waitTimeTrends.avgWait,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Peak Wait',
        data: stats.waitTimeTrends.peakWait,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          padding: 20, 
          font: { size: 13, family: 'Inter' },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 12, family: 'Inter' }, color: '#64748b' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, family: 'Inter' }, color: '#64748b' },
        border: { display: false },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  const periods = [
    { key: 'day', icon: FaCalendarDay, label: 'Day' },
    { key: 'week', icon: FaCalendarWeek, label: 'Week' },
    { key: 'month', icon: FaCalendarAlt, label: 'Month' },
    { key: 'year', icon: FaCalendarAlt, label: 'Year' },
  ];

  if (error && !loading) {
    return (
      <div>
        <PeriodSelector>
          {periods.map(p => (
            <button 
              key={p.key}
              className={period === p.key ? 'active' : ''} 
              onClick={() => setPeriod(p.key)}
            >
              <p.icon /> {p.label}
            </button>
          ))}
        </PeriodSelector>
        <EmptyState>
          <FaExclamationTriangle color="#f59e0b" />
          <h4>Failed to load statistics</h4>
          <p>{error}</p>
          <ExportButton onClick={loadStats} style={{ margin: '20px auto', display: 'inline-flex' }}>
            <FaRedo /> Retry
          </ExportButton>
        </EmptyState>
      </div>
    );
  }

  return (
    <div>
      <PeriodSelector>
        {periods.map(p => (
          <button 
            key={p.key}
            className={period === p.key ? 'active' : ''} 
            onClick={() => setPeriod(p.key)}
            disabled={loading}
          >
            <p.icon /> {p.label}
          </button>
        ))}
        <ExportButton onClick={handleExport} disabled={exporting || loading} style={{ marginLeft: 'auto' }}>
          {exporting ? <><FaSpinner className="spinner" /> Exporting...</> : <><FaDownload /> Export PDF</>}
        </ExportButton>
        <ExportButton onClick={handleExportCSV} disabled={loading} style={{ marginLeft: '8px' }}>
          <FaFileCsv /> Export CSV
        </ExportButton>
      </PeriodSelector>

      <ExportWrapper ref={exportRef}>
        <StatsGrid>
          <StatCard type="students">
            <div className="icon"><FaUserGraduate /></div>
            <div className="info">
              <div className="label">Students Served</div>
              <div className="value">{stats.studentsServed}</div>
              <div className="sub">{stats.totalServed > 0 ? Math.round((stats.studentsServed / stats.totalServed) * 100) : 0}% of total</div>
            </div>
          </StatCard>

          <StatCard type="parents">
            <div className="icon"><FaUserFriends /></div>
            <div className="info">
              <div className="label">Parents Served</div>
              <div className="value">{stats.guestsServed}</div>
              <div className="sub">{stats.totalServed > 0 ? Math.round((stats.guestsServed / stats.totalServed) * 100) : 0}% of total</div>
            </div>
          </StatCard>

          <StatCard type="total">
            <div className="icon"><FaUsers /></div>
            <div className="info">
              <div className="label">Total Served</div>
              <div className="value">{stats.totalServed}</div>
              <div className="sub">All appointments completed</div>
            </div>
          </StatCard>

          <StatCard type="avg">
            <div className="icon"><FaClock /></div>
            <div className="info">
              <div className="label">Avg Service Time</div>
              <div className="value">{stats.avgServiceTime}<span style={{fontSize: '14px', fontWeight: 500}}>m</span></div>
              <div className="sub">Peak wait: {stats.peakWaitTime}m</div>
            </div>
          </StatCard>
        </StatsGrid>

        <ChartsGrid>
          <ChartCard>
            <div className="header">
              <h3><FaChartLine color="#1e40af" /> Served Over Time</h3>
            </div>
            <div className="body">
              {hasData ? (
                <Bar data={servedChartData} options={chartOptions} />
              ) : (
                <EmptyState style={{ padding: '40px 20px' }}>
                  <FaChartLine />
                  <h4>No data available</h4>
                  <p>No served appointments for this period</p>
                </EmptyState>
              )}
            </div>
          </ChartCard>

          <ChartCard>
            <div className="header">
              <h3><FaClock color="#f59e0b" /> Wait Time Trends</h3>
            </div>
            <div className="body">
              {hasData ? (
                <Line data={waitTimeChartData} options={lineOptions} />
              ) : (
                <EmptyState style={{ padding: '40px 20px' }}>
                  <FaClock />
                  <h4>No data available</h4>
                  <p>No wait time data for this period</p>
                </EmptyState>
              )}
            </div>
          </ChartCard>
        </ChartsGrid>

        <SectionCard>
          <div className="header">
            <h3><FaUsers color="#10b981" /> Recently Served</h3>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              {stats.recentServed.length} records
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Issue Type</th>
                  <th>Service Time</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentServed.length > 0 ? stats.recentServed.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>#{item.ticket_number}</strong></td>
                    <td>
                      <span className={`badge ${item.user_type}`}>
                        {item.user_type === 'student' ? 'Student' : 'Guest'}
                      </span>
                    </td>
                    <td>{item.user_name}</td>
                    <td>{item.issue_type || 'General'}</td>
                    <td>{item.actual_service_minutes ? `${item.actual_service_minutes} min` : '-'}</td>
                    <td className="time">
                      {item.completed_at ? new Date(item.completed_at).toLocaleString() : 
                       item.served_at ? new Date(item.served_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      No recently served appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </SectionCard>
      </ExportWrapper>
    </div>
  );
};

export default MyStats;