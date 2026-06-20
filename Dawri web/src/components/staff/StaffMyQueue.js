import React, { useState, useEffect, useCallback } from 'react';
import { staffAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlay, FaCheckCircle, FaUserGraduate, 
  FaUserFriends, FaClock, FaExclamationTriangle, FaRedo,
  FaStar, FaHourglassStart, FaArrowRight, FaBan,
  FaPhone, FaEnvelope, FaListOl, FaHome
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;

  &.primary {
    background: linear-gradient(135deg, #1e40af, #1d4ed8);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(30,64,175,0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  &.success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(16,185,129,0.3);
    }
  }

  &.danger {
    background: #fee2e2;
    color: #dc2626;

    &:hover {
      background: #fecaca;
    }
  }
`;

const QueueContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const QueueColumn = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  .column-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f1f5f9;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }

    .count {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;

      &.waiting {
        background: #fef3c7;
        color: #d97706;
      }

      &.serving {
        background: #dbeafe;
        color: #1e40af;
      }
    }
  }
`;

const QueueCard = styled.div`
  background: #f8fafc;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  border: 2px solid transparent;
  transition: all 0.3s;
  animation: ${fadeIn} 0.4s ease-out;
  position: relative;

  &:hover {
    border-color: #1e40af;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1);
  }

  &.serving {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
    animation: ${pulse} 2s infinite;

    &:hover {
      border-color: #059669;
    }
  }

  &.guest-priority {
    border-left: 4px solid #f59e0b;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .ticket-info {
    display: flex;
    align-items: center;
    gap: 14px;

    .ticket-number {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #1e40af, #1d4ed8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(30,64,175,0.2);
    }

    .details {
      .name {
        font-weight: 600;
        color: #0f172a;
        font-size: 15px;
        margin-bottom: 4px;
      }

      .type {
        font-size: 13px;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;

      &.student {
        background: #dbeafe;
        color: #1e40af;
      }

      &.guest {
        background: #fce7f3;
        color: #db2777;
      }

      &.priority {
        background: #fef3c7;
        color: #d97706;
      }
    }
  }

  .info-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #64748b;

      svg {
        font-size: 14px;
      }
    }
  }

  .contact-info {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 13px;
    color: #64748b;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;

    button {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
      border: none;

      &.serve {
        background: #10b981;
        color: white;

        &:hover {
          background: #059669;
          transform: translateY(-1px);
        }
      }

      &.mark-served {
        background: #1e40af;
        color: white;

        &:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
      }

      &.cancel {
        background: #fee2e2;
        color: #ef4444;

        &:hover {
          background: #fecaca;
        }
      }

      &.resolve-remote {
        background: #8b5cf6;
        color: white;

        &:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
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

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;

  .modal-content {
    background: white;
    border-radius: 20px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;

    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;

      &.warning {
        background: #fef3c7;
        color: #d97706;
      }

      &.danger {
        background: #fee2e2;
        color: #ef4444;
      }

      &.resolve {
        background: #ede9fe;
        color: #7c3aed;
      }
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }

    p {
      color: #64748b;
      margin-bottom: 24px;
      font-size: 14px;
    }

    textarea {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-bottom: 16px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      min-height: 80px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;

      button {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s;

        &.confirm {
          background: #ef4444;
          color: white;

          &:hover {
            background: #dc2626;
          }
        }

        &.resolve-btn {
          background: #8b5cf6;
          color: white;

          &:hover {
            background: #7c3aed;
          }
        }

        &.cancel {
          background: #f1f5f9;
          color: #475569;

          &:hover {
            background: #e2e8f0;
          }
        }
      }
    }
  }
`;

const MyQueue = () => {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [servingNext, setServingNext] = useState(false);
  const [markingServed, setMarkingServed] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [servingSpecific, setServingSpecific] = useState(null);
  const [resolvingRemotely, setResolvingRemotely] = useState(null);
  const [resolveNoteModal, setResolveNoteModal] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const loadQueue = useCallback(async (showLoading = true) => {
    try {
      if (!showLoading) setRefreshing(true);

      const res = await staffAPI.getMyQueue();
      if (res.data?.success) {
        setQueue(res.data.queue || []);
      }
    } catch (err) {
      console.error('Queue load error:', err);
      if (err.response?.status !== 401) {
        toast.error('Failed to load queue');
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(() => loadQueue(false), 10000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleServeNext = async () => {
    setServingNext(true);
    try {
      const res = await staffAPI.serveNext();
      if (res.data?.success) {
        toast.success(
          <div>
            <strong>Now serving:</strong><br/>
            Ticket #{res.data.appointment?.ticket_number}
          </div>
        );
        loadQueue(false);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to serve next';
      toast.error(msg);
    } finally {
      setServingNext(false);
    }
  };

  // FIXED: Use direct axios/api call for serve-specific since staffAPI doesn't have it
  const handleServeSpecific = async (appointmentId) => {
    setServingSpecific(appointmentId);
    try {
      // FIXED: Use api instance directly with correct endpoint from staff.js
      const api = (await import('../utils/api')).default;
      const res = await api.post(`/staff/serve/${appointmentId}`);
      if (res.data?.success) {
        toast.success(`Serving ticket #${res.data.appointment?.ticket_number || appointmentId}`);
        loadQueue(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to serve');
    } finally {
      setServingSpecific(null);
    }
  };

  // FIXED: Use direct api call for mark-served
  const handleMarkServed = async (appointmentId) => {
    setMarkingServed(appointmentId);
    try {
      const api = (await import('../utils/api')).default;
      const res = await api.post(`/staff/mark-served/${appointmentId}`);
      if (res.data?.success) {
        toast.success(
          <div>
            <FaCheckCircle color="#10b981" /> Marked as served
            {res.data.service_time_minutes && (
              <div style={{fontSize: '12px', marginTop: '4px', color: '#64748b'}}>
                Service time: {res.data.service_time_minutes} minutes
              </div>
            )}
          </div>
        );
        loadQueue(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark as served');
    } finally {
      setMarkingServed(null);
    }
  };

  // FIXED: Use direct api call for cancel
  const handleCancel = async (appointmentId, reason = '') => {
    try {
      const api = (await import('../utils/api')).default;
      const res = await api.post(`/staff/cancel/${appointmentId}`, { reason });
      if (res.data?.success) {
        toast.info('Appointment cancelled');
        loadQueue(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    } finally {
      setCancelModal(null);
    }
  };

  // FIXED: Use direct api call for resolve-remotely
  const handleResolveRemotely = async (appointmentId, note = '') => {
    setResolvingRemotely(appointmentId);
    try {
      const api = (await import('../utils/api')).default;
      const res = await api.post(`/staff/resolve-remotely/${appointmentId}`, { resolutionNote: note });
      if (res.data?.success) {
        toast.success(
          <div>
            <FaCheckCircle color="#8b5cf6" /> Resolved remotely
            {res.data.whatsapp_sent && (
              <div style={{fontSize: '12px', marginTop: '4px', color: '#64748b'}}>
                WhatsApp notification sent to guest
              </div>
            )}
          </div>
        );
        loadQueue(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resolve remotely');
    } finally {
      setResolvingRemotely(null);
      setResolveNoteModal(null);
      setResolutionNote('');
    }
  };

  const waitingQueue = queue.filter(q => q.status === 'waiting');
  const servingQueue = queue.filter(q => q.status === 'serving');

  return (
    <div>
      <PageHeader>
        <h2><FaListOl color="#1e40af" /> My Queue Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <ActionButton className="primary" onClick={handleServeNext} disabled={waitingQueue.length === 0 || servingNext}>
            {servingNext ? <><FaRedo className="spinner" /> Processing...</> : <><FaPlay /> Call Next</>}
          </ActionButton>
          <ActionButton className="success" onClick={() => loadQueue(false)} disabled={refreshing}>
            <FaRedo /> {refreshing ? 'Updating...' : 'Refresh'}
          </ActionButton>
        </div>
      </PageHeader>

      <QueueContainer>
        <QueueColumn>
          <div className="column-header">
            <FaHourglassStart color="#d97706" />
            <h3>Waiting</h3>
            <span className="count waiting">{waitingQueue.length}</span>
          </div>

          {waitingQueue.length > 0 ? (
            waitingQueue.map(item => (
              <QueueCard 
                key={item.id} 
                className={`${item.is_guest_priority ? 'guest-priority' : ''}`}
              >
                <div className="header">
                  <div className="ticket-info">
                    <div className="ticket-number">#{item.ticket_number}</div>
                    <div className="details">
                      <div className="name">
                        {item.user_first_name} {item.user_last_name}
                      </div>
                      <div className="type">
                        {item.user_type === 'student' ? <FaUserGraduate /> : <FaUserFriends />}
                        {item.user_type === 'student' ? 'Student' : 'Guest'}
                        {item.is_guest_priority === 1 && (
                          <span style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaStar /> Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="badges">
                    <span className={`badge ${item.user_type}`}>
                      {item.user_type}
                    </span>
                    {item.is_guest_priority === 1 && (
                      <span className="badge priority">Priority</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <FaClock /> Position {item.queue_position}
                  </div>
                  <div className="info-item">
                    <FaHourglassStart /> {item.estimated_wait_minutes} min est.
                  </div>
                  {item.waiting_minutes > 0 && (
                    <div className="info-item">
                      <FaClock /> Waiting {item.waiting_minutes}m
                    </div>
                  )}
                </div>

                {item.description && (
                  <div className="info-row" style={{marginTop: '8px', padding: '8px 12px', background: '#eff6ff', borderRadius: '8px', borderLeft: '3px solid #1e40af'}}>
                    <div className="info-item" style={{color: '#1e40af', fontWeight: 500, fontSize: '13px'}}>
                      <FaExclamationTriangle style={{color: '#f59e0b'}} /> <strong>Note:</strong> {item.description}
                    </div>
                  </div>
                )}

                {item.user_contact && (
                  <div className="contact-info">
                    <span>
                      {item.user_type === 'student' ? <FaEnvelope /> : <FaPhone />}
                      {item.user_contact}
                    </span>
                  </div>
                )}

                <div className="actions">
                  <button 
                    className="serve" 
                    onClick={() => handleServeSpecific(item.id)}
                    disabled={servingSpecific === item.id}
                  >
                    {servingSpecific === item.id ? (
                      <><FaRedo className="spinner" /> Serving...</>
                    ) : (
                      <><FaArrowRight /> Serve Now</>
                    )}
                  </button>
                  <button 
                    className="resolve-remote" 
                    onClick={() => setResolveNoteModal(item)}
                    disabled={resolvingRemotely === item.id}
                  >
                    {resolvingRemotely === item.id ? (
                      <><FaRedo className="spinner" /> Resolving...</>
                    ) : (
                      <><FaHome /> Resolve Remote</>
                    )}
                  </button>
                  <button 
                    className="cancel" 
                    onClick={() => setCancelModal(item)}
                  >
                    <FaBan /> Cancel
                  </button>
                </div>
              </QueueCard>
            ))
          ) : (
            <EmptyState>
              <FaUserGraduate />
              <h4>No one waiting</h4>
              <p>Queue is empty. New appointments will appear here.</p>
            </EmptyState>
          )}
        </QueueColumn>

        <QueueColumn>
          <div className="column-header">
            <FaCheckCircle color="#1e40af" />
            <h3>Currently Serving</h3>
            <span className="count serving">{servingQueue.length}</span>
          </div>

          {servingQueue.length > 0 ? (
            servingQueue.map(item => (
              <QueueCard key={item.id} className="serving">
                <div className="header">
                  <div className="ticket-info">
                    <div className="ticket-number">#{item.ticket_number}</div>
                    <div className="details">
                      <div className="name">
                        {item.user_first_name} {item.user_last_name}
                      </div>
                      <div className="type">
                        {item.user_type === 'student' ? <FaUserGraduate /> : <FaUserFriends />}
                        {item.user_type === 'student' ? 'Student' : 'Guest'}
                      </div>
                    </div>
                  </div>
                  <div className="badges">
                    <span className={`badge ${item.user_type}`}>
                      {item.user_type}
                    </span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <FaClock /> Started serving
                  </div>
                  {item.served_at && (
                    <div className="info-item">
                      <FaHourglassStart /> {Math.round((new Date() - new Date(item.served_at)) / 60000)}m elapsed
                    </div>
                  )}
                </div>

                {item.description && (
                  <div className="info-row" style={{marginTop: '8px', padding: '8px 12px', background: '#eff6ff', borderRadius: '8px', borderLeft: '3px solid #1e40af'}}>
                    <div className="info-item" style={{color: '#1e40af', fontWeight: 500, fontSize: '13px'}}>
                      <FaExclamationTriangle style={{color: '#f59e0b'}} /> <strong>Note:</strong> {item.description}
                    </div>
                  </div>
                )}

                {item.user_contact && (
                  <div className="contact-info">
                    <span>
                      {item.user_type === 'student' ? <FaEnvelope /> : <FaPhone />}
                      {item.user_contact}
                    </span>
                  </div>
                )}

                <div className="actions">
                  <button 
                    className="mark-served" 
                    onClick={() => handleMarkServed(item.id)}
                    disabled={markingServed === item.id}
                  >
                    {markingServed === item.id ? (
                      <><FaRedo className="spinner" /> Processing...</>
                    ) : (
                      <><FaCheckCircle /> Mark Served</>
                    )}
                  </button>
                </div>
              </QueueCard>
            ))
          ) : (
            <EmptyState>
              <FaCheckCircle />
              <h4>No one being served</h4>
              <p>Call next from waiting queue or click "Call Next"</p>
            </EmptyState>
          )}
        </QueueColumn>
      </QueueContainer>

      {cancelModal && (
        <ConfirmModal onClick={() => setCancelModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="icon warning">
              <FaExclamationTriangle />
            </div>
            <h3>Cancel Appointment?</h3>
            <p>
              Are you sure you want to cancel ticket #{cancelModal.ticket_number} for {cancelModal.user_first_name} {cancelModal.user_last_name}?
            </p>
            <div className="modal-actions">
              <button className="cancel" onClick={() => setCancelModal(null)}>Keep</button>
              <button className="confirm" onClick={() => handleCancel(cancelModal.id, 'Cancelled by staff')}>
                Cancel Appointment
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}

      {resolveNoteModal && (
        <ConfirmModal onClick={() => setResolveNoteModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="icon resolve">
              <FaHome />
            </div>
            <h3>Resolve Remotely?</h3>
            <p>
              Resolve ticket #{resolveNoteModal.ticket_number} for {resolveNoteModal.user_first_name} {resolveNoteModal.user_last_name} without office visit. Guest will receive WhatsApp notification.
            </p>
            <textarea
              placeholder="Optional resolution note for guest (e.g., 'Issue fixed via email')..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
            <div className="modal-actions">
              <button className="cancel" onClick={() => setResolveNoteModal(null)}>Cancel</button>
              <button 
                className="resolve-btn" 
                onClick={() => handleResolveRemotely(resolveNoteModal.id, resolutionNote)}
              >
                <FaHome /> Resolve & Notify
              </button>
            </div>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
};

export default MyQueue;