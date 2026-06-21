import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartLine, FaUsers, FaTags, FaClock, FaChartBar,
  FaUniversity, FaBars, FaSignOutAlt,
  FaChevronLeft, FaBell, FaMoon, FaSun
} from 'react-icons/fa';
import styled from 'styled-components';

const shouldForwardProp = (prop) => !['darkMode', 'collapsed', 'mobileOpen', 'show'].includes(prop);

const AppContainer = styled('div').withConfig({ shouldForwardProp })`
  display: flex;
  min-height: 100vh;
  background: ${props => props.darkMode ? '#0f172a' : '#f1f5f9'};
  transition: background 0.3s ease;
`;

const Sidebar = styled('aside').withConfig({ shouldForwardProp })`
  width: ${props => props.collapsed ? '70px' : '260px'};
  background: ${props => props.darkMode ? '#1e293b' : '#1e293b'};
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    width: 260px;
    transform: ${props => props.mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarOverlay = styled('div').withConfig({ shouldForwardProp })`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    backdrop-filter: blur(4px);
  }
`;

const SidebarHeader = styled('div').withConfig({ shouldForwardProp })`
  padding: ${props => props.collapsed ? '16px 0' : '20px'};
  display: flex;
  align-items: center;
  gap: ${props => props.collapsed ? '0' : '12px'};
  border-bottom: 1px solid rgba(255,255,255,0.1);
  flex-direction: ${props => props.collapsed ? 'column' : 'row'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};

  .logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(37,99,235,0.3);
  }

  .brand-name {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
    opacity: ${props => props.collapsed ? 0 : 1};
    width: ${props => props.collapsed ? 0 : 'auto'};
    transition: opacity 0.2s, width 0.2s;
    background: linear-gradient(135deg, #fff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .toggle-btn {
    margin-left: ${props => props.collapsed ? 0 : 'auto'};
    background: none;
    border: none;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    font-size: ${props => props.collapsed ? '14px' : '18px'};
    padding: ${props => props.collapsed ? '6px 0 0 0' : '4px'};
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: white;
      transform: scale(1.1);
    }
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 4px;
  }
`;

const NavItem = styled(NavLink).withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  svg {
    font-size: 20px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  span {
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s;
  }

  &:hover {
    background: rgba(255,255,255,0.1);
    color: white;

    svg {
      transform: scale(1.1);
    }
  }

  &.active {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    box-shadow: 0 4px 12px rgba(37,99,235,0.3);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: #60a5fa;
      border-radius: 0 3px 3px 0;
    }
  }

  .badge {
    position: absolute;
    right: 12px;
    background: #ef4444;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s;
  }
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const AdminInfo = styled('div').withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .avatar {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    font-weight: 600;
  }

  .details {
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s;
    overflow: hidden;

    .name {
      font-size: 14px;
      font-weight: 600;
    }

    .role {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }
  }
`;

const LogoutButton = styled('button').withConfig({ shouldForwardProp })`
  width: 100%;
  padding: 10px;
  background: rgba(239,68,68,0.15);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  span {
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s;
  }

  &:hover {
    background: rgba(239,68,68,0.25);
    transform: translateY(-1px);
  }
`;

const MainContent = styled('main').withConfig({ shouldForwardProp })`
  flex: 1;
  margin-left: ${props => props.collapsed ? '70px' : '260px'};
  transition: margin-left 0.3s ease;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled('header').withConfig({ shouldForwardProp })`
  height: 64px;
  background: ${props => props.darkMode ? '#1e293b' : 'white'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.3s ease;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.darkMode ? '#f1f5f9' : '#1e293b'};
    transition: color 0.3s ease;
  }

  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 24px;
    color: ${props => props.darkMode ? '#94a3b8' : '#64748b'};
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: ${props => props.darkMode ? '#334155' : '#f1f5f9'};
    }

    @media (max-width: 768px) {
      display: block;
    }
  }
`;

const TopBarActions = styled('div').withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: ${props => props.darkMode ? '#334155' : '#f1f5f9'};
    color: ${props => props.darkMode ? '#94a3b8' : '#64748b'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s;
    position: relative;

    &:hover {
      background: ${props => props.darkMode ? '#475569' : '#e2e8f0'};
      color: ${props => props.darkMode ? '#f1f5f9' : '#1e293b'};
      transform: translateY(-1px);
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 600;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid ${props => props.darkMode ? '#1e293b' : 'white'};
    }
  }
`;

const PageContent = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const navItems = [
  { path: '/admin/dashboard', icon: FaChartLine, label: 'Dashboard' },
  { path: '/admin/staff', icon: FaUsers, label: 'Staff Management' },
  { path: '/admin/issues', icon: FaTags, label: 'Issue Types' },
  { path: '/admin/peak-hours', icon: FaClock, label: 'Peak Hours' },
  { path: '/admin/analytics', icon: FaChartBar, label: 'Analytics & Reports' },
];

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [notifications] = useState(0);
  const { admin, logout } = useAuth();
  const location = useLocation();

  const pageTitles = {
    '/admin/dashboard': 'Dashboard',
    '/admin/staff': 'Staff Management',
    '/admin/issues': 'Issue Types',
    '/admin/peak-hours': 'Peak Hours',
    '/admin/analytics': 'Analytics & Reports',
  };

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on outside click
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }, [logout]);

  return (
    <AppContainer darkMode={darkMode}>
      <SidebarOverlay show={mobileOpen} onClick={() => setMobileOpen(false)} />

      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen}>
        <SidebarHeader collapsed={collapsed}>
          <div className="logo">
            <FaUniversity />
          </div>
          {!collapsed && <span className="brand-name">Dawri</span>}
          <button 
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FaChevronLeft style={{ 
              transform: collapsed ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.3s' 
            }} />
          </button>
        </SidebarHeader>

        <Nav>
          <ul>
            {navItems.map(item => (
              <li key={item.path}>
                <NavItem 
                  to={item.path} 
                  collapsed={collapsed}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavItem>
              </li>
            ))}
          </ul>
        </Nav>

        <SidebarFooter>
          <AdminInfo collapsed={collapsed}>
            <div className="avatar">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </div>
            <div className="details">
              <div className="name">{admin?.firstName} {admin?.lastName}</div>
              <div className="role">Administrator</div>
            </div>
          </AdminInfo>
          <LogoutButton collapsed={collapsed} onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent collapsed={collapsed}>
        <TopBar darkMode={darkMode}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="mobile-toggle" 
              onClick={() => setMobileOpen(true)}
              title="Open menu"
            >
              <FaBars />
            </button>
            <h2 className="page-title">{pageTitles[location.pathname] || 'Dashboard'}</h2>
          </div>

          <TopBarActions darkMode={darkMode}>
            <button 
              className="icon-btn" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button className="icon-btn" title="Notifications">
              <FaBell />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
          </TopBarActions>
        </TopBar>
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </AppContainer>
  );
};

export default Layout;