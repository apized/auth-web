import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

const Rotate = styled.div`
    transform-origin: center center;
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
        animation: ${rotate} 2s linear infinite;
        stroke: rgba(0, 0, 0, 0.5);
    }
`;

const Loader = () => (
  <Rotate>
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="32" strokeWidth="8" strokeDasharray="50.26548245743669 50.26548245743669" fill="none" strokeLinecap="round"/>
    </svg>
  </Rotate>
);

export default Loader;
