import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 40px 20px;
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  background: #fef3c7;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #d97706;
  font-size: 48px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #475569;
  margin-bottom: 32px;
  max-width: 400px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
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

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -5px rgba(30,64,175,0.3);
    }
  }

  &.secondary {
    background: #f1f5f9;
    color: #475569;

    &:hover {
      background: #e2e8f0;
    }
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <IconWrapper>
        <FaExclamationTriangle />
      </IconWrapper>
      <Title>Page Not Found</Title>
      <Subtitle>
        The page you're looking for doesn't exist or has been moved. 
        Check the URL or go back to the dashboard.
      </Subtitle>
      <ButtonGroup>
        <Button className="secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Go Back
        </Button>
        <Button className="primary" onClick={() => navigate('/staff/dashboard')}>
          <FaHome /> Dashboard
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default NotFound;