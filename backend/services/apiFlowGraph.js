function buildApiFlowGraph(apis) {
  const nodes = [];
  const edges = [];

  const columnGap = 420;
  const rowGap = 120;

  apis.forEach((api, apiIndex) => {
    const x = 150 + apiIndex * columnGap;

    const routeId = `route-${apiIndex}`;

    nodes.push({
      id: routeId,
      data: {
        label: `${api.method} ${api.route}`,
        type: "route",
      },
      position: {
        x,
        y: 50,
      },
    });

    let previousId = routeId;

    api.flow.forEach((item, index) => {
      const nodeId = `${routeId}-${index}`;

      nodes.push({
        id: nodeId,
        data: {
          label: item,
          type: "flow",
        },
        position: {
          x,
          y: 50 + (index + 1) * rowGap,
        },
      });

      edges.push({
        id: `${previousId}-${nodeId}`,
        source: previousId,
        target: nodeId,
      });

      previousId = nodeId;
    });
  });

  return {
    nodes,
    edges,
  };
}

module.exports = buildApiFlowGraph;