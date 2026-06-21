import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartLine, FaListOl, FaChartBar, FaCog,
  FaUserTie, FaBars, FaSignOutAlt, FaChevronLeft, FaClock
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const shouldForwardProp = (prop) => !['collapsed', 'show', 'inline'].includes(prop);

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
`;

const Sidebar = styled('aside').withConfig({ shouldForwardProp })`
  width: ${props => props.collapsed ? '70px' : '260px'};
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  z-index: 100;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    width: ${props => props.collapsed ? '0' : '280px'};
    overflow: hidden;
    transform: ${props => props.collapsed ? 'translateX(-100%)' : 'translateX(0)'};
    transition: transform 0.3s ease, width 0.3s ease;
  }
`;

const SidebarHeader = styled('div').withConfig({ shouldForwardProp })`
  padding: ${props => props.collapsed ? '16px 0' : '20px'};
  display: flex;
  align-items: center;
  gap: ${props => props.collapsed ? '0' : '12px'};
  border-bottom: 1px solid rgba(255,255,255,0.1);
  height: ${props => props.collapsed ? 'auto' : '64px'};
  flex-direction: ${props => props.collapsed ? 'column' : 'row'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};

  .logo {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(16,185,129,0.3);
  }

  .brand-name {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
    opacity: ${props => props.collapsed ? 0 : 1};
    width: ${props => props.collapsed ? 0 : 'auto'};
    transition: opacity 0.2s, width 0.2s;
    overflow: hidden;
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
    flex-shrink: 0;
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

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
`;

const NavItem = styled(NavLink).withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
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

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #10b981;
    border-radius: 0 4px 4px 0;
    transform: scaleY(0);
    transition: transform 0.2s;
  }

  &:hover {
    background: rgba(255,255,255,0.1);
    color: white;

    svg {
      transform: scale(1.1);
    }
  }

  &.active {
    background: rgba(16,185,129,0.15);
    color: #10b981;
    font-weight: 600;

    &::before {
      transform: scaleY(1);
    }

    svg {
      color: #10b981;
    }
  }
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const StaffInfo = styled('div').withConfig({ shouldForwardProp })`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
    flex-shrink: 0;
  }

  .details {
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s;
    overflow: hidden;

    .name {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    .role {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const LogoutButton = styled('button').withConfig({ shouldForwardProp })`
  width: 100%;
  padding: 10px;
  background: rgba(239,68,68,0.15);
  color: #ef4444;
  border: none;
  border-radius: 10px;
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

const TopBar = styled.header`
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 50;

  .page-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 24px;
    color: #64748b;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    @media (max-width: 768px) {
      display: block;
    }
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const PageContent = styled.div`
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Overlay = styled('div').withConfig({ shouldForwardProp })`
  display: ${props => props.show ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
  animation: ${fadeIn} 0.2s ease-out;

  @media (min-width: 769px) {
    display: none;
  }
`;

const navItems = [
  { path: '/staff/dashboard', icon: FaChartLine, label: 'Dashboard' },
  { path: '/staff/queue', icon: FaListOl, label: 'My Queue' },
  { path: '/staff/stats', icon: FaChartBar, label: 'My Stats' },
  { path: '/staff/settings', icon: FaCog, label: 'Settings' },
];

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { staff, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef(null);

  const pageTitles = {
    '/staff/dashboard': { title: 'Dashboard', icon: FaChartLine },
    '/staff/queue': { title: 'My Queue', icon: FaListOl },
    '/staff/stats': { title: 'My Statistics', icon: FaChartBar },
    '/staff/settings': { title: 'Settings', icon: FaCog },
  };

  const currentPage = pageTitles[location.pathname] || pageTitles['/dashboard'];

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContainer>
      <Overlay show={mobileOpen} onClick={() => setMobileOpen(false)} />

      <Sidebar 
        collapsed={!mobileOpen && collapsed} 
        ref={sidebarRef}
        style={mobileOpen ? { width: '280px', transform: 'translateX(0)' } : {}}
      >
        <SidebarHeader collapsed={!mobileOpen && collapsed}>
          <div className="logo">
            <FaUserTie />
          </div>
          <span className="brand-name" style={{ display: (!collapsed || mobileOpen) ? 'block' : 'none' }}>Staff Portal</span>
          <button 
            className="toggle-btn"
            onClick={() => {
              if (isMobile) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
          >
            <FaChevronLeft style={{ 
              transform: (collapsed && !mobileOpen) ? 'rotate(180deg)' : 'none', 
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
                  collapsed={!mobileOpen && collapsed}
                  className={location.pathname.startsWith(item.path) ? 'active' : ''}
                  onClick={() => isMobile && setMobileOpen(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavItem>
              </li>
            ))}
          </ul>
        </Nav>

        <SidebarFooter>
          <StaffInfo collapsed={!mobileOpen && collapsed}>
            <div className="avatar">
              <FaUserTie />
            </div>
            <div className="details">
              <div className="name">{staff?.firstName} {staff?.lastName}</div>
              <div className="role">
                <FaClock size={10} />
                {staff?.room}, {staff?.block}
              </div>
            </div>
          </StaffInfo>
          <LogoutButton collapsed={!mobileOpen && collapsed} onClick={logout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent collapsed={!mobileOpen && collapsed}>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-toggle" 
              onClick={() => setMobileOpen(true)}
            >
              <FaBars />
            </button>
            <h2 className="page-title">
              <currentPage.icon color="#2563eb" />
              {currentPage.title}
            </h2>
          </div>
          <div className="top-actions"></div>
        </TopBar>
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </AppContainer>
  );
};

export default Layout;