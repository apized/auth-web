import React, { ReactNode } from "react";
import styled from "styled-components";

const MainContainer = styled.fieldset`
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 0.25em;
`;

const BorderedSection = ({ title, children }: { title?: string, children: ReactNode }) => {
  return (
    <MainContainer>
      {title && (<legend>{title}</legend>)}
      {children}
    </MainContainer>
  );
}

export default BorderedSection;