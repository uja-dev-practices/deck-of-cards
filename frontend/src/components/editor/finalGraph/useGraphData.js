import { useMemo } from 'react';
import { CHART_COLORS } from '../../../config';

export const interpolateY = (x, nodes) => {
  if (!nodes || nodes.length === 0) return null;
  const EPSILON = 1e-5;
  const MICRO_STEP = 0.0001;
  const firstX = nodes[0][0];
  const lastX = nodes[nodes.length - 1][0];

  if (x < firstX - MICRO_STEP - EPSILON) return null;
  if (x > lastX + MICRO_STEP + EPSILON) return null;
  if (x < firstX - EPSILON) return 0;
  if (x > lastX + EPSILON) return 0;

  for (let i = nodes.length - 1; i >= 0; i--) {
    if (Math.abs(nodes[i][0] - x) < EPSILON) return nodes[i][1];
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = nodes[i][0];
    const x2 = nodes[i + 1][0];
    if (Math.abs(x2 - x1) < EPSILON) continue;
    if (x >= x1 && x <= x2) {
      const y1 = nodes[i][1];
      const y2 = nodes[i + 1][1];
      return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
    }
  }
  return null;
};

export const useGraphData = (data) => {
  const sortedResults = useMemo(() => {
    const rawItems = data?.levels || data?.results || [];
    const processed = rawItems.map((item, index) => {
      const isType2 = !!item.lower && !!item.upper;
      const color = CHART_COLORS[index % CHART_COLORS.length] || '#333';
      let termName = item.term || (item.lower && item.lower.term) || `Termino ${index}`;

      if (isType2) {
        const lowerNodes = [...(item.lower.left_nodes || []), ...(item.lower.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const upperNodes = [...(item.upper.left_nodes || []), ...(item.upper.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const coreVal = Array.isArray(item.lower.core) ? Number(item.lower.core[0]) : 0;
        return { ...item, term: termName, isType2, lowerNodes, upperNodes, color, coreVal };
      } else {
        const nodes = [...(item.left_nodes || []), ...(item.right_nodes || [])].map(n => [Number(n[0]), Number(n[1])]).sort((a,b)=>a[0]-b[0]);
        const coreVal = Array.isArray(item.core) ? Number(item.core[0]) : 0;
        return { ...item, term: termName, isType2, nodes, color, coreVal };
      }
    });
    return processed.sort((a, b) => a.coreVal - b.coreVal);
  }, [data]);

  const denseData = useMemo(() => {
    const xSet = new Set();
    const steps = 1000;
    for (let i = 0; i <= steps; i++) xSet.add(Number((i / steps).toFixed(4)));
    
    sortedResults.forEach(item => {
      const addNodes = (nodes) => nodes.forEach(n => {
        const x = n[0];
        xSet.add(Number((x - 0.0001).toFixed(4)));
        xSet.add(Number(x.toFixed(4)));
        xSet.add(Number((x + 0.0001).toFixed(4)));
      });
      item.isType2 ? (addNodes(item.lowerNodes), addNodes(item.upperNodes)) : addNodes(item.nodes);
    });

    const xValues = Array.from(xSet).sort((a, b) => a - b);
    return xValues.map(x => {
      const point = { x };
      sortedResults.forEach(item => {
        if (item.isType2) {
          const lowerRaw = interpolateY(x, item.lowerNodes);
          const upperRaw = interpolateY(x, item.upperNodes);
          point[`${item.term}_lower`] = lowerRaw;
          point[`${item.term}_upper`] = upperRaw;
          point[`${item.term}_range`] = (lowerRaw === null && upperRaw === null) ? null : [lowerRaw ?? 0, upperRaw ?? 0];
        } else {
          point[item.term] = interpolateY(x, item.nodes);
        }
      });
      return point;
    });
  }, [sortedResults]);

  return { sortedResults, denseData };
};