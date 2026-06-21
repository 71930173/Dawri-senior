import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch,
  FaCheckCircle, FaTimesCircle, FaPauseCircle, FaUsers,
  FaFilePdf, FaSync,
  FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import styled from 'styled-components';

const PageActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  border: none;

  &.primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
  }

  &.secondary {
    background: white;
    border: 1px solid #e2e8f0;
    color: #64748b;

    &:hover {
      border-color: #2563eb;
      color: #2563eb;
    }
  }

  &.danger {
    background: #fee2e2;
    color: #ef4444;

    &:hover {
      background: #fecaca;
    }
  }

  &.success {
    background: #d1fae5;
    color: #10b981;

    &:hover {
      background: #a7f3d0;
    }
  }

  &.export-pdf {
    background: white;
    border: 1px solid #ef4444;
    color: #ef4444;

    &:hover {
      border-color: #dc2626;
      color: #dc2626;
      background: #fee2e2;
    }
  }

  &.export-csv {
    background: white;
    border: 1px solid #f59e0b;
    color: #f59e0b;

    &:hover {
      border-color: #d97706;
      color: #d97706;
      background: #fef3c7;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
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
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  select, input {
    padding: 8px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #334155;
    background: white;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }
  }

  input {
    min-width: 200px;
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
    white-space: nowrap;
    background: #f8fafc;
  }

  td {
    padding: 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tr {
    transition: all 0.2s;

    &:hover td {
      background: #f8fafc;
    }
  }

  .actions {
    display: flex;
    gap: 8px;

    button {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;

      &.edit {
        background: #dbeafe;
        color: #2563eb;

        &:hover { background: #bfdbfe; transform: translateY(-1px); }
      }

      &.delete {
        background: #fee2e2;
        color: #ef4444;

        &:hover { background: #fecaca; transform: translateY(-1px); }
      }

      &.toggle {
        background: #f1f5f9;
        color: #64748b;

        &:hover { background: #e2e8f0; }
      }
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;

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
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    transition: all 0.2s;

    &:hover {
      color: #64748b;
      transform: rotate(90deg);
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    margin-bottom: 8px;
  }

  input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #334155;
    transition: all 0.2s;
    background: white;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #334155;

  input {
    width: 18px;
    height: 18px;
    accent-color: #2563eb;
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

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roomNumber: '',
    block: '',
    floor: '',
    school: '',
    issueTypeId: '',
    maxQueueLimit: 20,
    isAvailable: true,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, issuesRes] = await Promise.all([
        adminAPI.getAllStaff(),
        adminAPI.getIssueTypes(),
      ]);
      setStaff(staffRes.data || []);
      setIssueTypes(issuesRes.data || []);
    } catch (err) {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validatePassword = useCallback((password) => {
    if (!password) return '';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (!hasUpperCase && !hasSpecialChar) {
      return 'Password must contain at least one uppercase letter and one special character';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  }, []);

  const openModal = useCallback((staffMember = null) => {
    setPasswordError('');
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        firstName: staffMember.first_name || '',
        lastName: staffMember.last_name || '',
        email: staffMember.email || '',
        password: '',
        roomNumber: staffMember.room_number || '',
        block: staffMember.block || '',
        floor: staffMember.floor || '',
        school: staffMember.school || '',
        issueTypeId: staffMember.issue_type_id || '',
        maxQueueLimit: staffMember.max_queue_limit || 20,
        isAvailable: staffMember.is_available === 1,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roomNumber: '',
        block: '',
        floor: '',
        school: '',
        issueTypeId: '',
        maxQueueLimit: 20,
        isAvailable: true,
      });
    }
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingStaff(null);
    setPasswordError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (formData.password) {
      const error = validatePassword(formData.password);
      if (error) {
        setPasswordError(error);
        return;
      }
    }

    try {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        roomNumber: formData.roomNumber,
        block: formData.block,
        floor: formData.floor,
        school: formData.school || null,
        issueTypeId: parseInt(formData.issueTypeId),
        maxQueueLimit: parseInt(formData.maxQueueLimit),
        isAvailable: formData.isAvailable ? 1 : 0,
      };

      if (formData.password) {
        data.password = formData.password;
      }

      if (editingStaff) {
        await adminAPI.updateStaff(editingStaff.id, data);
        toast.success('Staff updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new staff');
          return;
        }
        await adminAPI.createStaff(data);
        toast.success('Staff created successfully');
      }

      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  }, [formData, editingStaff, closeModal, loadData, validatePassword]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;

    try {
      await adminAPI.deleteStaff(id);
      toast.success('Staff deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to delete staff');
    }
  }, [loadData]);

  const handleToggleAvailability = useCallback(async (id, currentStatus) => {
    try {
      await adminAPI.updateStaffStatus(id, currentStatus ? 'unavailable' : 'available');
      toast.success(`Staff marked as ${currentStatus ? 'unavailable' : 'available'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  }, [loadData]);

  const getStatusBadge = useCallback((staffMember) => {
    if (staffMember.is_paused) {
      return <StatusBadge className="paused"><FaPauseCircle /> Paused</StatusBadge>;
    }
    if (staffMember.is_available) {
      return <StatusBadge className="available"><FaCheckCircle /> Available</StatusBadge>;
    }
    return <StatusBadge className="unavailable"><FaTimesCircle /> Unavailable</StatusBadge>;
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesFilter = filter === 'all' || 
        (filter === 'available' && s.is_available && !s.is_paused) ||
        (filter === 'unavailable' && !s.is_available) ||
        (filter === 'paused' && s.is_paused);

      const matchesSearch = !search || 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.room_number?.toLowerCase().includes(search.toLowerCase()) ||
        s.school?.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [staff, filter, search]);

  const stats = useMemo(() => ({
    total: staff.length,
    available: staff.filter(s => s.is_available && !s.is_paused).length,
    unavailable: staff.filter(s => !s.is_available).length,
    paused: staff.filter(s => s.is_paused).length,
  }), [staff]);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      window.print();
      toast.success('Staff exported to PDF');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    try {
      setExporting(true);
      let csvContent = 'STAFF MANAGEMENT REPORT\n';
      csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;

      csvContent += 'SUMMARY STATS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Staff,${stats.total}\n`;
      csvContent += `Available,${stats.available}\n`;
      csvContent += `Unavailable,${stats.unavailable}\n`;
      csvContent += `Paused,${stats.paused}\n\n`;

      csvContent += 'STAFF LIST\n';
      csvContent += 'ID,First Name,Last Name,Email,Room Number,Block,Floor,School,Issue Type,Status,Max Queue Limit\n';
      filteredStaff.forEach(s => {
        const status = s.is_paused ? 'Paused' : (s.is_available ? 'Available' : 'Unavailable');
        const issueType = issueTypes.find(i => i.id === s.issue_type_id)?.name || 'N/A';
        csvContent += `${s.id},${s.first_name},${s.last_name},${s.email},${s.room_number},${s.block},${s.floor},${s.school || ''},${issueType},${status},${s.max_queue_limit}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Staff exported to CSV successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  }, [filteredStaff, issueTypes, stats]);

  return (
    <div>
      <StatsBar>
        <div className="stat-item">
          <div className="value">{stats.total}</div>
          <div className="label">Total Staff</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#10b981' }}>{stats.available}</div>
          <div className="label">Available</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#dc2626' }}>{stats.unavailable}</div>
          <div className="label">Unavailable</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#d97706' }}>{stats.paused}</div>
          <div className="label">Paused</div>
        </div>
      </StatsBar>

      <PageActions>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button className="export-pdf" onClick={() => handleExport()} disabled={exporting || filteredStaff.length === 0}>
            <FaFilePdf /> Export PDF
          </Button>
          <Button className="export-csv" onClick={() => handleExportCSV()} disabled={exporting || filteredStaff.length === 0}>
            <span>📄</span> Export CSV
          </Button>
          <Button className="secondary" onClick={loadData} disabled={loading}>
            <FaSync className={loading ? 'spinner' : ''} />
          </Button>
        </div>
        <Button className="primary" onClick={() => openModal()}>
          <FaPlus /> Add New Staff
        </Button>
      </PageActions>

      <SectionCard>
        <SectionHeader>
          <h3>All Staff Members ({filteredStaff.length})</h3>
          <FilterGroup>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="paused">Paused</option>
            </select>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }} />
              <input 
                type="text" 
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
            </div>
          </FilterGroup>
        </SectionHeader>

        {filteredStaff.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>School</th>
                  <th>Issue Type</th>
                  <th>Status</th>
                  <th>Queue Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                    <td>{s.email}</td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {s.room_number}, {s.block}, {s.floor}
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {s.school || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: '#f1f5f9',
                        color: '#64748b',
                      }}>
                        {issueTypes.find(i => i.id === s.issue_type_id)?.name || 'N/A'}
                      </span>
                    </td>
                    <td>{getStatusBadge(s)}</td>
                    <td style={{ fontWeight: 600 }}>{s.max_queue_limit}</td>
                    <td className="actions">
                      <button className="edit" onClick={() => openModal(s)} title="Edit">
                        <FaEdit />
                      </button>
                      <button className="toggle" onClick={() => handleToggleAvailability(s.id, s.is_available)} title="Toggle availability">
                        {s.is_available ? <FaToggleOff /> : <FaToggleOn />}
                      </button>
                      <button className="delete" onClick={() => handleDelete(s.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <EmptyState>
            <FaUsers />
            <h4>No staff members found</h4>
            <p>Add staff members to get started</p>
          </EmptyState>
        )}
      </SectionCard>

      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button className="close-btn" onClick={closeModal}>
                <FaTimesCircle />
              </button>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <ModalBody>
                <FormRow>
                  <FormGroup>
                    <label>First Name *</label>
                    <input 
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      placeholder="Enter first name"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Last Name *</label>
                    <input 
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                      placeholder="Enter last name"
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <label>Email *</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="staff@university.com"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Password {editingStaff && '(leave blank to keep current)'}</label>
                  <input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      setPasswordError(validatePassword(e.target.value));
                    }}
                    required={!editingStaff}
                    placeholder={editingStaff ? '••••••••' : 'Enter password'}
                    style={passwordError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                  />
                  {passwordError && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '13px',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ fontSize: '14px' }}>⚠️</span>
                      {passwordError}
                    </div>
                  )}
                  {!passwordError && formData.password && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '13px',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ fontSize: '14px' }}>✅</span>
                      Password looks good
                    </div>
                  )}
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <label>Room Number *</label>
                    <input 
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                      required
                      placeholder="A-101"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Block *</label>
                    <input 
                      type="text"
                      value={formData.block}
                      onChange={(e) => setFormData({...formData, block: e.target.value})}
                      required
                      placeholder="Block A"
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Floor *</label>
                    <input 
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: e.target.value})}
                      required
                      placeholder="1st Floor"
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <label>School / Department <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span></label>
                  <input 
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    placeholder="e.g. School of Engineering, Business, Arts..."
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <label>Issue Type *</label>
                    <select 
                      value={formData.issueTypeId}
                      onChange={(e) => setFormData({...formData, issueTypeId: e.target.value})}
                      required
                    >
                      <option value="">Select issue type</option>
                      {issueTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Max Queue Limit</label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxQueueLimit}
                      onChange={(e) => setFormData({...formData, maxQueueLimit: e.target.value})}
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <CheckboxWrapper>
                    <input 
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    />
                    Available for queue
                  </CheckboxWrapper>
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <Button type="button" className="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  {editingStaff ? 'Update Staff' : 'Create Staff'}
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
};

export default React.memo(StaffManagement);