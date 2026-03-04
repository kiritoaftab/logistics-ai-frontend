// components/common/CustomHandle.jsx
import React from 'react';
import { Handle } from 'reactflow';
import { theme } from '../styles/theme';

const CustomHandle = ({ type, position, id, style, isConnectable = true }) => {
  return (
    <Handle
      type={type}
      position={position}
      id={id}
      style={{
        width: 8,
        height: 8,
        background: theme.primary,
        border: `2px solid ${theme.surface}`,
        boxShadow: theme.shadowSm,
        cursor: 'crosshair',
        transition: 'all 0.2s ease',
        ...style
      }}
      isConnectable={isConnectable}
    />
  );
};

export default CustomHandle;