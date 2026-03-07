// export const ROOT_X = 120;
// export const ROOT_Y = 80;
// export const ROOT_GAP_Y = 620;

// export const CHILD_GAP_Y = 920;
// export const CHILD_GAP_X = 520;

// export function getChildPosition(
//   parentPosition,
//   childIndex,
//   parentHeight = 260,
// ) {
//   const verticalGap = 200;
//   const baseY = parentPosition.y + parentHeight + verticalGap;

//   if (childIndex === 0) {
//     return {
//       x: parentPosition.x,
//       y: baseY,
//     };
//   }

//   const level = Math.ceil(childIndex / 2);
//   const direction = childIndex % 2 === 1 ? 1 : -1;

//   return {
//     x: parentPosition.x + direction * level * CHILD_GAP_X,
//     y: baseY,
//   };
// }

// export function toResponse(apiNode) {
//   return {
//     summary: apiNode.summary || "",
//     data: apiNode.data || [],
//     rowCount: apiNode.row_count || 0,
//     sql: apiNode.sql_generated || "",
//     followUps: apiNode.follow_ups || apiNode.suggested_follow_ups || [],
//     chart: apiNode.chart_suggestion || null,
//     executionTime: apiNode.execution_time_ms || null,
//     error: apiNode.error || null,
//   };
// }

// export function buildGraphFromApi(threadData) {
//   const apiNodes = threadData?.nodes || [];
//   const childrenByParent = new Map();

//   for (const n of apiNodes) {
//     const parentKey = n.parent_node_id || "__root__";
//     if (!childrenByParent.has(parentKey)) {
//       childrenByParent.set(parentKey, []);
//     }
//     childrenByParent.get(parentKey).push(n);
//   }

//   for (const [, arr] of childrenByParent.entries()) {
//     arr.sort((a, b) => {
//       const da = a.created_at ? new Date(a.created_at).getTime() : 0;
//       const db = b.created_at ? new Date(b.created_at).getTime() : 0;
//       return da - db;
//     });
//   }

//   const nodes = [];
//   const edges = [];
//   const posById = new Map();

//   const roots = childrenByParent.get("__root__") || [];

//   roots.forEach((n, idx) => {
//     posById.set(n.node_id, {
//       x: ROOT_X + (idx % 3) * 480,
//       y: ROOT_Y + Math.floor(idx / 3) * ROOT_GAP_Y,
//     });
//   });

//   const queue = [...roots.map((r) => r.node_id)];

//   while (queue.length) {
//     const parentId = queue.shift();
//     const parentPos = posById.get(parentId);

//     const kids = childrenByParent.get(parentId) || [];

//     kids.forEach((child, index) => {
//       const childPos = getChildPosition(parentPos, index);
//       posById.set(child.node_id, childPos);

//       edges.push({
//         id: `e-${parentId}-${child.node_id}`,
//         source: parentId,
//         sourceHandle: "bottom",
//         target: child.node_id,
//         targetHandle: "top",
//         animated: true,
//         type: "smoothstep",
//         style: { stroke: "#2563eb", strokeWidth: 2 },
//       });

//       queue.push(child.node_id);
//     });
//   }

//   for (const apiNode of apiNodes) {
//     nodes.push({
//       id: apiNode.node_id,
//       type: "queryNode",
//       position: posById.get(apiNode.node_id) || { x: ROOT_X, y: ROOT_Y },
//       data: {
//         question: apiNode.question,
//         response: toResponse(apiNode),
//       },
//     });
//   }

//   return { nodes, edges };
// }

export const ROOT_X = 120;
export const ROOT_Y = 80;
export const ROOT_GAP_Y = 620;

export const CHILD_GAP_X = 520;

export function getChildPosition(
  parentPosition,
  childIndex,
  parentHeight = 260,
) {
  const verticalGap = 80;
  const baseY = parentPosition.y + parentHeight + verticalGap;

  if (childIndex === 0) {
    return {
      x: parentPosition.x,
      y: baseY,
    };
  }

  const level = Math.ceil(childIndex / 2);
  const direction = childIndex % 2 === 1 ? 1 : -1;

  return {
    x: parentPosition.x + direction * level * CHILD_GAP_X,
    y: baseY,
  };
}

export function toResponse(apiNode) {
  return {
    summary: apiNode.summary || "",
    data: apiNode.data || [],
    rowCount: apiNode.row_count || 0,
    sql: apiNode.sql_generated || "",
    followUps: apiNode.follow_ups || apiNode.suggested_follow_ups || [],
    chart: apiNode.chart_suggestion || null,
    executionTime: apiNode.execution_time_ms || null,
    error: apiNode.error || null,
  };
}

export function buildGraphFromApi(
  threadData,
  existingPositions = {},
  nodeHeights = {},
  pendingChild = null,
) {
  const apiNodes = threadData?.nodes || [];
  const childrenByParent = new Map();

  for (const n of apiNodes) {
    const parentKey = n.parent_node_id || "__root__";
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(n);
  }

  for (const [, arr] of childrenByParent.entries()) {
    arr.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return da - db;
    });
  }

  const nodes = [];
  const edges = [];
  const posById = new Map();

  const roots = childrenByParent.get("__root__") || [];

  roots.forEach((n, idx) => {
    if (existingPositions[n.node_id]) {
      posById.set(n.node_id, existingPositions[n.node_id]);
    } else {
      posById.set(n.node_id, {
        x: ROOT_X + (idx % 3) * 480,
        y: ROOT_Y + Math.floor(idx / 3) * ROOT_GAP_Y,
      });
    }
  });

  const queue = [...roots.map((r) => r.node_id)];

  while (queue.length) {
    const parentId = queue.shift();
    const parentPos = posById.get(parentId);

    const kids = childrenByParent.get(parentId) || [];

    kids.forEach((child, index) => {
      let childPos;

      if (existingPositions[child.node_id]) {
        childPos = existingPositions[child.node_id];
      } else if (
        pendingChild &&
        child.parent_node_id === pendingChild.parentId &&
        child.question === pendingChild.question
      ) {
        childPos = pendingChild.position;
      } else {
        const parentHeight = nodeHeights[parentId] || 260;
        childPos = getChildPosition(parentPos, index, parentHeight);
      }

      posById.set(child.node_id, childPos);

      edges.push({
        id: `e-${parentId}-${child.node_id}`,
        source: parentId,
        sourceHandle: "bottom",
        target: child.node_id,
        targetHandle: "top",
        animated: true,
        type: "smoothstep",
        style: { stroke: "#2563eb", strokeWidth: 2 },
      });

      queue.push(child.node_id);
    });
  }

  for (const apiNode of apiNodes) {
    nodes.push({
      id: apiNode.node_id,
      type: "queryNode",
      position: posById.get(apiNode.node_id) || { x: ROOT_X, y: ROOT_Y },
      data: {
        question: apiNode.question,
        response: toResponse(apiNode),
      },
    });
  }

  return { nodes, edges };
}
