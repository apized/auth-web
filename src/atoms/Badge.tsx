import React from 'react';
import styled from 'styled-components';

type CSSProps = {
  background?: string;
  color?: string;
};
type Props = React.BaseHTMLAttributes<HTMLSpanElement> & CSSProps;

export const StyledBadge = styled.div<CSSProps>`
  display: flex;
  font-size: 14px;
  font-weight: 300;
  line-height: 24px;
  padding: 4px 8px;
  color: ${(props) => (props.color ? props.color : '#fff')};
  background-color: ${(props) =>
    props.background ? props.background : '#000'};
  border-radius: 4px;
  text-align: center;
`;

export const GreenBadge = styled(StyledBadge)`
  background-color: #eaf9ea;
  color: #44c242;
`;
export const YellowBadge = styled(StyledBadge)`
  background-color: rgba(248, 186, 38, 0.2);
  color: #f8ba26;
`;
export const RedBadge = styled(StyledBadge)`
  background-color: #f14d4c;
  color: #d8d8d8;
`;
export const GreyBadge = styled(StyledBadge)`
  background-color: #e6e6e6;
  color: #413f3f;
`;

const Badge = ({ color, background, children, ...props }: Props) => {
  return (
    <StyledBadge background={background} color={color} {...props}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
