// components/edges/EdgeWithButton.jsx
import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { X, Settings, Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import { theme } from '../../styles/theme';

const EdgeWithButton = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [showControls, setShowControls] = React.useState(false);

  const handleDelete = () => {
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  const handleStyleChange = (newStyle) => {
    if (data?.onStyleChange) {
      data.onStyleChange(newStyle);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        ...style,
        stroke: selected ? theme.warning : style.stroke,
        strokeWidth: selected ? 3 : style.strokeWidth,
      }} />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            opacity: showControls || selected ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <div style={{
            display: 'flex',
            gap: 4,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 6,
            padding: 4,
            boxShadow: theme.shadowMd,
          }}>
            <button
              style={styles.edgeBtn}
              onClick={handleDelete}
              title="Delete Edge"
            >
              <Trash2 size={12} />
            </button>
            <button
              style={styles.edgeBtn}
              onClick={() => handleStyleChange({ strokeDasharray: '5,5' })}
              title="Toggle Dashed"
            >
              <Settings size={12} />
            </button>
            <button
              style={styles.edgeBtn}
              onClick={() => handleStyleChange({ 
                stroke: style.stroke === theme.success ? theme.primary : theme.success 
              })}
              title="Toggle Color"
            >
              {style.stroke === theme.success ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const styles = {
  edgeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    background: 'transparent',
    border: 'none',
    color: theme.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default EdgeWithButton;