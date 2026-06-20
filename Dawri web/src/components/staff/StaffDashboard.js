import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaUserGraduate, FaUserFriends, FaUsers, FaClock,
  FaPlay, FaPause, FaCheckCircle, FaExclamationTriangle,
  FaListOl, FaChartBar, FaSyncAlt, FaArrowRight, FaStar,
  FaCalendarCheck, FaHourglassHalf, FaTachometerAlt
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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
  transition: all 0.3s;
  animation: ${fadeIn} 0.5s ease-out;
  border-left: 4px solid;
  border-color: ${props => {
    switch(props.type) {
      case 'waiting': return '#1e40af';
      case 'served': return '#10b981';
      case 'total': return '#f59e0b';
      case 'avg': return '#ef4444';
      default: return '#64748b';
    }
  }};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
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
        case 'waiting': return '#dbeafe';
        case 'served': return '#d1fae5';
        case 'total': return '#fef3c7';
        case 'avg': return '#fee2e2';
        default: return '#f1f5f9';
      }
    }};
    color: ${props => {
      switch(props.type) {
        case 'waiting': return '#1e40af';
        case 'served': return '#10b981';
        case 'total': return '#f59e0b';
        case 'avg': return '#ef4444';
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
      margin-bottom: 4px;
      line-height: 1;
    }

    .change {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;

      &.positive { color: #10b981; }
      &.negative { color: #ef4444; }
      &.neutral { color: #64748b; }
    }
  }
`;

const ActionCardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
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
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
  }

  button {
    flex: 1;
    padding: 14px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    border: 2px solid;
    position: relative;
    overflow: hidden;

    &.available {
      background: ${props => props.status === 'available' ? '#10b981' : 'white'};
      border-color: #10b981;
      color: ${props => props.status === 'available' ? 'white' : '#10b981'};

      &:hover {
        background: #10b981;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16,185,129,0.3);
      }

      &.active::after {
        content: '';
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: ${pulse} 2s infinite;
      }
    }

    &.paused {
      background: ${props => props.status === 'paused' ? '#f59e0b' : 'white'};
      border-color: #f59e0b;
      color: ${props => props.status === 'paused' ? 'white' : '#f59e0b'};

      &:hover {
        background: #f59e0b;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245,158,11,0.3);
      }
    }

    &.unavailable {
      background: ${props => props.status === 'unavailable' ? '#ef4444' : 'white'};
      border-color: #ef4444;
      color: ${props => props.status === 'unavailable' ? 'white' : '#ef4444'};

      &:hover {
        background: #ef4444;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239,68,68,0.3);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }
  }
`;

const QuickActionButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(30,64,175,0.4);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #94a3b8;
  }

  .count {
    background: rgba(255,255,255,0.2);
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 14px;
  }
`;

const SectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 20px;
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

    .actions {
      display: flex;
      gap: 8px;
    }
  }
`;

const RefreshButton = styled.button`
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: #1e40af;
    color: #1e40af;
    background: #eff6ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`;

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
  transition: all 0.3s;
  animation: ${slideIn} 0.4s ease-out;

  &:hover {
    border-color: #1e40af;
    background: #f8fafc;
    transform: translateX(4px);
  }

  &.serving {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    box-shadow: 0 4px 12px rgba(16,185,129,0.1);

    &:hover {
      border-color: #059669;
    }
  }

  &.priority {
    border-left: 4px solid #f59e0b;
  }

  .ticket {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, #1e40af, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(30,64,175,0.2);
  }

  .info {
    flex: 1;

    .name {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .details {
      font-size: 13px;
      color: #64748b;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;

    &.waiting {
      background: #fef3c7;
      color: #d97706;
    }

    &.serving {
      background: #d1fae5;
      color: #059669;
    }
  }

  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fef3c7;
    color: #d97706;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  animation: ${fadeIn} 0.5s ease-out;

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

  p {
    font-size: 14px;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    waiting: 0,
    served: 0,
    total: 0,
    avgTime: 0,
  });
  const [status, setStatus] = useState('available');
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [servingNext, setServingNext] = useState(false);

  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const [statsRes, queueRes] = await Promise.all([
        staffAPI.getMyStats('day'),
        staffAPI.getMyQueue(),
      ]);

      if (statsRes.data?.success) {
        setStats({
          waiting: statsRes.data.summary?.totalServed || 0,
          served: statsRes.data.summary?.totalServed || 0,
          total: statsRes.data.summary?.totalServed || 0,
          avgTime: statsRes.data.summary?.avgServiceTime || 0,
        });
      }

      if (queueRes.data?.success) {
        const queueData = queueRes.data.queue || [];
        setQueue(queueData);

        const waitingCount = queueData.filter(q => q.status === 'waiting').length;
        const servingCount = queueData.filter(q => q.status === 'serving').length;

        setStats(prev => ({
          ...prev,
          waiting: waitingCount,
          total: waitingCount + servingCount + prev.served,
        }));
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      if (err.response?.status === 401) {
        // Auth handled by interceptor
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const handleStatusChange = async (newStatus) => {
    try {
      const data = {
        isAvailable: newStatus === 'available' ? 1 : 0,
        isPaused: newStatus === 'paused' ? 1 : 0,
        reason: newStatus === 'paused' ? 'Emergency pause from dashboard' : 'Status update'
      };

      await staffAPI.updateAvailability(data);
      setStatus(newStatus);

      if (newStatus === 'unavailable') {
        toast.error(`Status updated to ${newStatus}`, {
          style: { background: '#dc2626', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#dc2626' }
        });
      } else if (newStatus === 'paused') {
        toast.success(`Status updated to ${newStatus}`, {
          style: { background: '#f59e0b', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#f59e0b' }
        });
      } else {
        toast.success(`Status updated to ${newStatus}`, {
          style: { background: '#10b981', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#10b981' }
        });
      }

      if (newStatus === 'paused') {
        toast.info('Students will be notified about the pause', {
          autoClose: 5000,
          style: { background: '#3b82f6', color: 'white' },
          iconTheme: { primary: 'white', secondary: '#3b82f6' }
        });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleServeNext = async () => {
    if (stats.waiting === 0) {
      toast.info('No one in queue');
      return;
    }

    setServingNext(true);
    try {
      const res = await staffAPI.serveNext();
      if (res.data?.success) {
        toast.success(
          <div>
            <strong>Now serving:</strong><br/>
            Ticket #{res.data.appointment?.ticket_number} - {res.data.appointment?.user_name}
          </div>,
          { autoClose: 4000 }
        );
        loadDashboardData(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to serve next';
      toast.error(errorMsg);
    } finally {
      setServingNext(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <StatsGrid>
        <StatCard type="waiting">
          <div className="icon"><FaHourglassHalf /></div>
          <div className="info">
            <div className="label">Currently Waiting</div>
            <div className="value">{stats.waiting}</div>
            <div className="change neutral">
              <FaListOl /> In queue now
            </div>
          </div>
        </StatCard>

        <StatCard type="served">
          <div className="icon"><FaCalendarCheck /></div>
          <div className="info">
            <div className="label">Served Today</div>
            <div className="value">{stats.served}</div>
            <div className="change positive">
              <FaCheckCircle /> Completed
            </div>
          </div>
        </StatCard>

        <StatCard type="total">
          <div className="icon"><FaUsers /></div>
          <div className="info">
            <div className="label">Total Today</div>
            <div className="value">{stats.total}</div>
            <div className="change positive">
              <FaTachometerAlt /> All queues
            </div>
          </div>
        </StatCard>

        <StatCard type="avg">
          <div className="icon"><FaClock /></div>
          <div className="info">
            <div className="label">Avg Service Time</div>
            <div className="value">{stats.avgTime} <span style={{fontSize: '14px', fontWeight: 500}}>min</span></div>
            <div className="change neutral">
              <FaClock /> Per person
            </div>
          </div>
        </StatCard>
      </StatsGrid>

      <ActionCardsGrid>
        <ActionCard>
          <div className="header">
            <h3><FaCheckCircle color="#10b981" /> My Availability</h3>
          </div>
          <StatusToggle status={status}>
            <button 
              className={`available ${status === 'available' ? 'active' : ''}`}
              onClick={() => handleStatusChange('available')}
            >
              <FaCheckCircle /> Available
            </button>
            <button 
              className={`paused ${status === 'paused' ? 'active' : ''}`}
              onClick={() => handleStatusChange('paused')}
            >
              <FaPause /> Pause
            </button>
            <button 
              className={`unavailable ${status === 'unavailable' ? 'active' : ''}`}
              onClick={() => handleStatusChange('unavailable')}
            >
              <FaExclamationTriangle /> Offline
            </button>
          </StatusToggle>
        </ActionCard>

        <ActionCard>
          <div className="header">
            <h3><FaPlay color="#1e40af" /> Quick Actions</h3>
          </div>
          <QuickActionButton 
            onClick={handleServeNext} 
            disabled={stats.waiting === 0 || servingNext}
          >
            {servingNext ? (
              <><FaSyncAlt className="spinner" /> Processing...</>
            ) : (
              <><FaArrowRight /> Call Next in Queue {stats.waiting > 0 && <span className="count">{stats.waiting}</span>}</>
            )}
          </QuickActionButton>
        </ActionCard>
      </ActionCardsGrid>

      <SectionCard>
        <div className="header">
          <h3><FaListOl color="#1e40af" /> Current Queue</h3>
          <div className="actions">
            <RefreshButton onClick={() => loadDashboardData(false)} disabled={refreshing}>
              <FaSyncAlt /> {refreshing ? 'Updating...' : 'Refresh'}
            </RefreshButton>
            <RefreshButton onClick={() => navigate('/queue')}>
              <FaChartBar /> View All
            </RefreshButton>
          </div>
        </div>

        {queue.length > 0 ? (
          queue.slice(0, 5).map((item, idx) => (
            <QueueItem 
              key={item.id} 
              className={`${item.status} ${item.is_guest_priority ? 'priority' : ''}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="ticket">#{item.ticket_number}</div>
              <div className="info">
                <div className="name">
                  {item.user_first_name} {item.user_last_name}
                  {item.is_guest_priority === 1 && (
                    <span className="priority-badge"><FaStar /> Priority</span>
                  )}
                </div>
                <div className="details">
                  <span>
                    {item.user_type === 'student' ? <FaUserGraduate /> : <FaUserFriends />}
                    {item.user_type === 'student' ? 'Student' : 'Guest'}
                  </span>
                  <span>•</span>
                  <span>Position {item.queue_position}</span>
                  <span>•</span>
                  <span><FaClock /> {item.estimated_wait_minutes} min wait</span>
                  {item.waiting_minutes > 0 && (
                    <>
                      <span>•</span>
                      <span>Waiting {item.waiting_minutes}m</span>
                    </>
                  )}
                  {item.description && (
                    <>
                      <span>•</span>
                      <span style={{color: '#1e40af', fontWeight: 500, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        <FaExclamationTriangle style={{color: '#f59e0b', marginRight: '4px'}} />
                        {item.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className={`badge ${item.status}`}>
                {item.status === 'serving' ? 'Serving Now' : 'Waiting'}
              </div>
            </QueueItem>
          ))
        ) : (
          <EmptyState>
            <FaListOl />
            <h4>No one in queue right now</h4>
            <p>When students or parents join, they'll appear here</p>
          </EmptyState>
        )}
      </SectionCard>

      {loading && !refreshing && (
        <LoadingOverlay>
          <FaSyncAlt className="spinner" style={{ fontSize: 24, color: '#1e40af', animation: 'spin 1s linear infinite' }} />
        </LoadingOverlay>
      )}
    </div>
  );
};

export default Dashboard;