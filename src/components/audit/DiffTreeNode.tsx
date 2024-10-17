import React, { ReactElement, useState } from 'react';
import { Stack } from "@mui/material";

const DiffTreeNode = ({
  label,
  localType,
  isObject,
  children,
}: {
  children: ReactElement[];
  isObject: boolean;
  label: string;
  localType: string;
}) => {
  const hasChildren = isObject && children[0].props?.children?.length > 0;
  const [expanded, setExpanded] = useState<boolean>(false);

  let expansionClass = '';
  if (hasChildren) {
    expansionClass = expanded ? 'expanded' : 'collapsed';
  }

  return (
    <li>
      <Stack direction={"row"} gap="0.25em" margin={"0.25em 0"} alignItems={"flex-start"}>
        <span
          className={`label ${localType} ${expansionClass}`}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
          onClick={() => setExpanded(!expanded)}
        >
          {label}
        </span>
        {!isObject && children}
      </Stack>
      {isObject && expanded && children}
    </li>
  );
};

export default DiffTreeNode;
