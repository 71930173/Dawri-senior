import React from 'react';
import { FaSpinner, FaUserTie } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$inline ? '200px' : '100vh'};
  background: ${props => props.$inline ? 'transparent' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'};
  animation: ${fadeIn} 0.3s ease-out;
  gap: 24px;
`;

const LogoWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  box-shadow: 0 10px 25px -5px rgba(30,64,175,0.4);
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingText = styled.div`
  color: ${props => props.$inline ? '#64748b' : 'white'};
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  font-size: 24px;
  color: ${props => props.$inline ? '#1e40af' : '#1e40af'};
`;

const LoadingScreen = ({ inline = false }) => {
  return (
    <LoadingContainer $inline={inline}>
      {!inline && (
        <LogoWrapper>
          <FaUserTie />
        </LogoWrapper>
      )}
      <LoadingText $inline={inline}>
        <Spinner $inline={inline} />
        {inline ? 'Loading...' : 'Loading Dawri...'}
      </LoadingText>
    </LoadingContainer>
  );
};

export default LoadingScreen;