import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilePdf, FaSync, FaTags, FaPalette,
  FaUserPlus, FaDollarSign, FaGraduationCap, FaLaptopCode, 
  FaUsers, FaQuestionCircle, FaFileAlt, FaPhone, FaEnvelope, 
  FaCalendar, FaBuilding, FaBook 
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

  &.danger {
    background: #fee2e2;
    color: #ef4444;

    &:hover {
      background: #fecaca;
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

const SearchBox = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
  }

  input {
    padding: 8px 14px 8px 36px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #334155;
    min-width: 250px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
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
    }
  }
`;

const ColorDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color || '#2563eb'};
  border: 2px solid #e2e8f0;
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
  max-width: 480px;
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

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #334155;
    margin-bottom: 8px;
  }

  input, textarea, select {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #334155;
    transition: all 0.2s;

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

  select {
    cursor: pointer;
    background: white;
  }
`;

const ColorPickerWrapper = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;

  .color-option {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    border: 3px solid transparent;
    transition: all 0.2s;

    &.selected {
      border-color: #1e293b;
      transform: scale(1.1);
    }

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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

const COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const ICONS = [
  { value: 'FaUserPlus', label: '👤' },
  { value: 'FaDollarSign', label: '💰' },
  { value: 'FaGraduationCap', label: '🎓' },
  { value: 'FaLaptopCode', label: '💻' },
  { value: 'FaUsers', label: '👥' },
  { value: 'FaQuestionCircle', label: '❓' },
  { value: 'FaFileAlt', label: '📄' },
  { value: 'FaPhone', label: '📞' },
  { value: 'FaEnvelope', label: '✉️' },
  { value: 'FaCalendar', label: '📅' },
  { value: 'FaBuilding', label: '🏢' },
  { value: 'FaBook', label: '📚' },
];

// Map icon names to actual React icon components
const iconMap = {
  FaUserPlus: FaUserPlus,
  FaDollarSign: FaDollarSign,
  FaGraduationCap: FaGraduationCap,
  FaLaptopCode: FaLaptopCode,
  FaUsers: FaUsers,
  FaQuestionCircle: FaQuestionCircle,
  FaFileAlt: FaFileAlt,
  FaPhone: FaPhone,
  FaEnvelope: FaEnvelope,
  FaCalendar: FaCalendar,
  FaBuilding: FaBuilding,
  FaBook: FaBook,
};

const IssueTypes = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    color: '#2563eb',
    icon: 'FaQuestionCircle',
  });

  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getIssueTypes();
      setIssues(res.data || []);
    } catch (err) {
      toast.error('Failed to load issue types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const openModal = useCallback((issue = null) => {
    if (issue) {
      setEditingIssue(issue);
      setFormData({
        name: issue.name || '',
        nameAr: issue.name_ar || '',
        description: issue.description || '',
        color: issue.color || '#2563eb',
        icon: issue.icon || 'FaQuestionCircle',
      });
    } else {
      setEditingIssue(null);
      setFormData({ name: '', nameAr: '', description: '', color: '#2563eb', icon: 'FaQuestionCircle' });
    }
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingIssue(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
      };

      if (editingIssue) {
        await adminAPI.updateIssueType(editingIssue.id, data);
        toast.success('Issue type updated');
      } else {
        await adminAPI.createIssueType(data);
        toast.success('Issue type created');
      }

      closeModal();
      loadIssues();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  }, [formData, editingIssue, closeModal, loadIssues]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure? This may affect existing staff assignments.')) return;

    try {
      await adminAPI.deleteIssueType(id);
      toast.success('Issue type deleted');
      loadIssues();
    } catch (err) {
      toast.error('Failed to delete issue type');
    }
  }, [loadIssues]);

  const filteredIssues = useMemo(() => {
    if (!search) return issues;
    return issues.filter(i => 
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [issues, search]);

  const stats = useMemo(() => ({
    total: issues.length,
    withArabic: issues.filter(i => i.name_ar).length,
    withDescription: issues.filter(i => i.description).length,
  }), [issues]);

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
      let csvContent = 'ISSUE TYPES REPORT\n';
      csvContent += `Exported At,${new Date().toLocaleString()}\n\n`;

      csvContent += 'SUMMARY STATS\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Types,${stats.total}\n`;
      csvContent += `With Arabic Names,${stats.withArabic}\n`;
      csvContent += `With Descriptions,${stats.withDescription}\n\n`;

      csvContent += 'ISSUE TYPES LIST\n';
      csvContent += 'ID,Name (EN),Name (AR),Description,Color,Icon,Created At\n';
      filteredIssues.forEach(issue => {
        csvContent += `${issue.id},${issue.name},${issue.name_ar || ''},${issue.description || ''},${issue.color},${issue.icon},${issue.created_at ? new Date(issue.created_at).toLocaleString() : ''}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `issue_types_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Issue types exported to CSV successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('CSV export failed');
    } finally {
      setExporting(false);
    }
  }, [filteredIssues, stats]);

  const renderIcon = (iconName, color) => {
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
      return <IconComponent style={{ color: color || '#2563eb', fontSize: '20px' }} />;
    }
    return <span style={{ fontSize: '20px' }}>❓</span>;
  };

  return (
    <div>
      <StatsBar>
        <div className="stat-item">
          <div className="value">{stats.total}</div>
          <div className="label">Total Types</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#10b981' }}>{stats.withArabic}</div>
          <div className="label">With Arabic Names</div>
        </div>
        <div className="stat-item">
          <div className="value" style={{ color: '#2563eb' }}>{stats.withDescription}</div>
          <div className="label">With Descriptions</div>
        </div>
      </StatsBar>

      <PageActions>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <SearchBox>
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search issue types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchBox>
          <Button className="export-pdf" onClick={() => handleExport()} disabled={exporting || filteredIssues.length === 0}>
            <FaFilePdf /> Export PDF
          </Button>
          <Button className="export-csv" onClick={() => handleExportCSV()} disabled={exporting || filteredIssues.length === 0}>
            <span>📄</span> Export CSV
          </Button>
          <Button className="secondary" onClick={loadIssues} disabled={loading}>
            <FaSync className={loading ? 'spinner' : ''} />
          </Button>
        </div>
        <Button className="primary" onClick={() => openModal()}>
          <FaPlus /> Add Issue Type
        </Button>
      </PageActions>

      <SectionCard>
        <SectionHeader>
          <h3>Issue Types Configuration ({filteredIssues.length})</h3>
        </SectionHeader>

        {filteredIssues.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Color</th>
                  <th>Icon</th>
                  <th>Name (EN)</th>
                  <th>Name (AR)</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map(issue => (
                  <tr key={issue.id}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>#{issue.id}</td>
                    <td><ColorDot color={issue.color} /></td>
                    <td>{renderIcon(issue.icon, issue.color)}</td>
                    <td style={{ fontWeight: 600 }}>{issue.name}</td>
                    <td style={{ direction: 'rtl', textAlign: 'right' }}>{issue.name_ar}</td>
                    <td style={{ maxWidth: '300px', color: '#64748b', fontSize: '13px' }}>
                      {issue.description}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </td>
                    <td className="actions">
                      <button className="edit" onClick={() => openModal(issue)}>
                        <FaEdit /> Edit
                      </button>
                      <button className="delete" onClick={() => handleDelete(issue.id)}>
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <EmptyState>
            <FaTags />
            <h4>No issue types found</h4>
            <p>Add issue types to categorize staff services</p>
          </EmptyState>
        )}
      </SectionCard>

      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{editingIssue ? 'Edit Issue Type' : 'Add Issue Type'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <ModalBody>
                <FormGroup>
                  <label>Name (English) *</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="e.g., Admission"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Name (Arabic) *</label>
                  <input 
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                    required
                    style={{ direction: 'rtl' }}
                    placeholder="مثال: القبول"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    placeholder="Brief description of this issue type..."
                  />
                </FormGroup>

                <FormGroup>
                  <label>Color <FaPalette style={{ color: formData.color }} /></label>
                  <ColorPickerWrapper>
                    {COLORS.map(color => (
                      <div
                        key={color}
                        className={`color-option ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, color})}
                      />
                    ))}
                  </ColorPickerWrapper>
                </FormGroup>

                <FormGroup>
                  <label>Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  >
                    {ICONS.map(icon => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label} {icon.value}
                      </option>
                    ))}
                  </select>
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <Button type="button" className="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  {editingIssue ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
};

export default React.memo(IssueTypes);