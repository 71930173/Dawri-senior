import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaUserGraduate, FaUserFriends, FaUsers, FaClock,
  FaArrowUp, FaArrowDown, FaFilePdf, FaSync, FaEllipsisH
} from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styled from 'styled-components';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => {
      switch(props.type) {
        case 'students': return '#2563eb';
        case 'guests': return '#10b981';
        case 'total': return '#f59e0b';
        case 'wait': return '#ef4444';
        default: return '#64748b';
      }
    }};
  }

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
    transition: transform 0.3s ease;

    ${props => props.type === 'students' && `
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #2563eb;
    `}
    ${props => props.type === 'guests' && `
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #10b981;
    `}
    ${props => props.type === 'total' && `
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #d97706;
    `}
    ${props => props.type === 'wait' && `
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #ef4444;
    `}
  }

  &:hover .icon {
    transform: scale(1.1) rotate(5deg);
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
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
      line-height: 1;
    }

    .change {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;

      &.positive {
        color: #10b981;
      }
      &.negative {
        color: #ef4444;
      }
    }
  }
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
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
  grid-template-columns: 2fr 1fr;
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
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .legend {
      display: flex;
      gap: 16px;

      .item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #64748b;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;

          &.students { background: #2563eb; }
          &.parents { background: #10b981; }
        }
      }
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
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-view-all, .btn-export {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 13px;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        border-color: #2563eb;
        color: #2563eb;
        background: #eff6ff;
      }
    }

    .btn-csv {
      padding: 8px 16px;
      background: transparent;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      font-size: 13px;
      color: #f59e0b;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        border-color: #d97706;
        color: #d97706;
        background: #fef3c7;
      }
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
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }

  tr {
    transition: background 0.2s;
  }

  tr:hover td {
    background: #f8fafc;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    &.waiting {
      background: #fef3c7;
      color: #d97706;
    }

    &.serving {
      background: #dbeafe;
      color: #2563eb;
    }

    &.served {
      background: #d1fae5;
      color: #059669;
    }

    &.cancelled {
      background: #fee2e2;
      color: #dc2626;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: ${props => props.status === 'serving' ? 'pulse 2s infinite' : 'none'};
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StaffStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const StaffStatusCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37,99,235,0.1);
    transform: translateY(-2px);
  }

  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }

  .info {
    flex: 1;

    .name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2px;
    }

    .role {
      font-size: 12px;
      color: #64748b;
    }
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    &.available {
      background: #d1fae5;
      color: #059669;
    }

    &.unavailable {
      background: #fee2e2;
      color: #dc2626;
    }

    &.paused {
      background: #fef3c7;
      color: #d97706;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
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

const Dashboard = () => {
  const [period, setPeriod] = useState('day');
  const [stats, setStats] = useState({
    studentsToday: 0,
    parentsToday: 0,
    totalToday: 0,
    avgWaitTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [staffStatus, setStaffStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, activityRes, staffRes] = await Promise.all([
        adminAPI.getDashboardStats(period),
        adminAPI.getRecentActivity(10),
        adminAPI.getAllStaff()
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (activityRes.data) {
        setRecentActivity(activityRes.data);
      }
      if (staffRes.data) {
        setStaffStatus(staffRes.data);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const servedChartData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = { students: [0,0,0,0,0,0,0], parents: [0,0,0,0,0,0,0] };

    recentActivity.forEach(item => {
      const d = new Date(item.created_at);
      const dayIdx = d.getDay();
      if (item.user_type === 'student') {
        counts.students[dayIdx]++;
      } else if (item.user_type === 'guest') {
        counts.parents[dayIdx]++;
      }
    });

    const orderedStudents = [...counts.students.slice(1), counts.students[0]];
    const orderedParents = [...counts.parents.slice(1), counts.parents[0]];
    const orderedLabels = [...dayNames.slice(1), dayNames[0]];

    return {
      labels: orderedLabels,
      datasets: [
        {
          label: 'Students',
          data: orderedStudents,
          backgroundColor: '#2563eb',
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Parents',
          data: orderedParents,
          backgroundColor: '#10b981',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [recentActivity]);

  const issuesChartData = useMemo(() => {
    const issueCounts = {};
    recentActivity.forEach(item => {
      const name = item.issue_name || 'Other';
      issueCounts[name] = (issueCounts[name] || 0) + 1;
    });

    const labels = Object.keys(issueCounts);
    const data = Object.values(issueCounts);
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6'];

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [{
        data: data.length > 0 ? data : [1],
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [recentActivity]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
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

  const doughnutOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          padding: 20, 
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  }), []);

  const getStatusBadge = useCallback((status) => {
    const classes = {
      waiting: 'waiting',
      serving: 'serving',
      served: 'served',
      cancelled: 'cancelled',
    };
    return (
      <span className={`status-badge ${classes[status] || 'waiting'}`} status={status}>
        <span className="dot" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  const getStaffStatusBadge = useCallback((staff) => {
    if (staff.is_paused) return { class: 'paused', text: 'Paused' };
    if (staff.is_available) return { class: 'available', text: 'Available' };
    return { class: 'unavailable', text: 'Unavailable' };
  }, []);

  const handleExportStats = useCallback(async () => {
    try {
      setExporting(true);
      window.print();
      toast.success('Stats exported to PDF');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportActivity = useCallback(async () => {
    try {
      setExporting(true);
      window.print();
      toast.success('Activity exported to PDF');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  // CSV export with all chart data
  const handleExportCSV = useCallback((dataType) => {
    try {
      setExporting(true);
      let csvContent = '';
      let filename = '';
      const dateStr = new Date().toISOString().split('T')[0];

      if (dataType === 'stats') {
        csvContent = 'DASHBOARD SUMMARY\n';
        csvContent += `Period,${period}\n`;
        csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;

        csvContent += 'STATS\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Students Served Today,${stats.studentsToday || 0}\n`;
        csvContent += `Parents Served Today,${stats.guestsToday || 0}\n`;
        csvContent += `Total Served Today,${stats.totalToday || 0}\n`;
        csvContent += `Avg Wait Time (min),${stats.avgWaitTime || 0}\n\n`;

        csvContent += 'SERVED OVERVIEW CHART\n';
        csvContent += 'Day,Students,Parents\n';
        servedChartData.labels.forEach((label, i) => {
          csvContent += `${label},${servedChartData.datasets[0].data[i]},${servedChartData.datasets[1].data[i]}\n`;
        });
        csvContent += '\n';

        csvContent += 'ISSUE TYPES DISTRIBUTION CHART\n';
        csvContent += 'Issue Type,Count\n';
        issuesChartData.labels.forEach((label, i) => {
          csvContent += `${label},${issuesChartData.datasets[0].data[i]}\n`;
        });
        csvContent += '\n';

        csvContent += 'STAFF STATUS\n';
        csvContent += 'ID,Name,Room,Block,Status\n';
        staffStatus.forEach(s => {
          const status = s.is_paused ? 'Paused' : (s.is_available ? 'Available' : 'Unavailable');
          csvContent += `${s.id},"${s.first_name} ${s.last_name}",${s.room_number},${s.block},${status}\n`;
        });
        filename = `dashboard_full_${dateStr}.csv`;

      } else if (dataType === 'activity') {
        csvContent = 'QUEUE ACTIVITY\n';
        csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;
        csvContent += 'Ticket #,Type,Name,Staff,Issue,Status,Time\n';
        recentActivity.forEach(item => {
          csvContent += `${item.ticket_number},${item.user_type},${item.user_name},${item.staff_name},${item.issue_name},${item.status},${new Date(item.created_at).toLocaleString()}\n`;
        });
        csvContent += '\nISSUE SUMMARY\n';
        csvContent += 'Issue Type,Count\n';
        const issueSummary = {};
        recentActivity.forEach(item => {
          const name = item.issue_name || 'Other';
          issueSummary[name] = (issueSummary[name] || 0) + 1;
        });
        Object.entries(issueSummary).forEach(([issue, count]) => {
          csvContent += `${issue},${count}\n`;
        });
        filename = `queue_activity_${dateStr}.csv`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Exported to CSV successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  }, [stats, recentActivity, staffStatus, servedChartData, issuesChartData, period]);

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
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </PeriodSelector>

        <ExportButtons>
          <button className="export-pdf" onClick={() => handleExportStats()} disabled={exporting}>
            <FaFilePdf /> Export PDF
          </button>
          <button className="export-csv" onClick={() => handleExportCSV('stats')} disabled={exporting}>
            <span>📄</span> Export CSV
          </button>
          <button onClick={loadDashboardData} disabled={loading} title="Refresh data">
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
        </ExportButtons>
      </ActionBar>

      <StatsGrid>
        <StatCard type="students">
          <div className="icon"><FaUserGraduate /></div>
          <div className="info">
            <div className="label">Students Served Today</div>
            <div className="value">{stats.studentsToday || 0}</div>
            <div className="change positive">
              <FaArrowUp /> 12% vs yesterday
            </div>
          </div>
        </StatCard>

        <StatCard type="parents">
          <div className="icon"><FaUserFriends /></div>
          <div className="info">
            <div className="label">Parents Served Today</div>
            <div className="value">{stats.guestsToday || 0}</div>
            <div className="change positive">
              <FaArrowUp /> 8% vs yesterday
            </div>
          </div>
        </StatCard>

        <StatCard type="total">
          <div className="icon"><FaUsers /></div>
          <div className="info">
            <div className="label">Total Served Today</div>
            <div className="value">{stats.totalToday || 0}</div>
            <div className="change positive">
              <FaArrowUp /> 15% vs yesterday
            </div>
          </div>
        </StatCard>

        <StatCard type="wait">
          <div className="icon"><FaClock /></div>
          <div className="info">
            <div className="label">Avg Wait Time</div>
            <div className="value">{stats.avgWaitTime || 0} min</div>
            <div className="change negative">
              <FaArrowDown /> 5% vs yesterday
            </div>
          </div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <div className="header">
            <h3>Served Overview</h3>
            <div className="legend">
              <span className="item"><span className="dot students" /> Students</span>
              <span className="item"><span className="dot parents" /> Parents</span>
            </div>
          </div>
          <div className="body">
            <Bar data={servedChartData} options={chartOptions} />
          </div>
        </ChartCard>

        <ChartCard>
          <div className="header">
            <h3>Issue Types Distribution</h3>
          </div>
          <div className="body">
            <Doughnut data={issuesChartData} options={doughnutOptions} />
          </div>
        </ChartCard>
      </ChartsGrid>

      <SectionCard>
        <div className="header">
          <h3>Recent Queue Activity</h3>
          <div className="actions">
            <button className="btn-export" onClick={() => handleExportActivity()}>
              <FaFilePdf /> Export PDF
            </button>
            <button className="btn-csv" onClick={() => handleExportCSV('activity')}>
              <span>📄</span> Export CSV
            </button>
            <button className="btn-view-all">View All</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto', position: 'relative' }}>
          {loading && (
            <LoadingOverlay>
              <div className="spinner" />
            </LoadingOverlay>
          )}
          <Table>
            <thead>
              <tr>
                <th>Ticket #</th>
                <th>Type</th>
                <th>Name</th>
                <th>Staff</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: '#2563eb' }}>#{item.ticket_number}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: item.user_type === 'student' ? '#dbeafe' : '#d1fae5',
                      color: item.user_type === 'student' ? '#2563eb' : '#059669',
                    }}>
                      {item.user_type === 'student' ? <FaUserGraduate /> : <FaUserFriends />}
                      {item.user_type === 'student' ? 'Student' : 'Guest'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.user_name}</td>
                  <td>{item.staff_name}</td>
                  <td>{item.issue_name}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {new Date(item.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <EmptyState>
                      <FaEllipsisH />
                      <h4>No recent activity</h4>
                      <p>Queue activity will appear here</p>
                    </EmptyState>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="header">
          <h3>Staff Status</h3>
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            {staffStatus.filter(s => s.is_available && !s.is_paused).length} of {staffStatus.length} available
          </span>
        </div>
        <StaffStatusGrid>
          {staffStatus.map(staff => {
            const status = getStaffStatusBadge(staff);
            return (
              <StaffStatusCard key={staff.id}>
                <div className="avatar">
                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                </div>
                <div className="info">
                  <div className="name">{staff.first_name} {staff.last_name}</div>
                  <div className="role">{staff.room_number}, {staff.block}</div>
                </div>
                <div className={`status ${status.class}`}>
                  <span className="dot" />
                  {status.text}
                </div>
              </StaffStatusCard>
            );
          })}
        </StaffStatusGrid>
      </SectionCard>
    </div>
  );
};

export default React.memo(Dashboard);