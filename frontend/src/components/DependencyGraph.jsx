import ReactFlow, {
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const nodeTypes = {};

function DependencyGraph({
  nodes,
  edges,
  onNodeSelect,
  selectedNode,
  onClearSelection,
}) {
  // Track incoming and outgoing connected nodes
  const incomingIds = new Set();
  const outgoingIds = new Set();

  if (selectedNode) {
    edges.forEach((edge) => {
      if (edge.target === selectedNode.id) {
        incomingIds.add(edge.source);
      }

      if (edge.source === selectedNode.id) {
        outgoingIds.add(edge.target);
      }
    });
  }

  // Style Nodes
  const styledNodes = nodes.map((node) => {
    let background = "#2563eb";

    const label = node.data.label;

    if (label === "verifyToken") {
      background = "#f59e0b";
    } else if (
      !label.startsWith("GET") &&
      !label.startsWith("POST") &&
      !label.startsWith("PUT") &&
      !label.startsWith("PATCH") &&
      !label.startsWith("DELETE")
    ) {
      background = "#22c55e";
    }

    const isSelected = selectedNode?.id === node.id;
    const isIncoming = incomingIds.has(node.id);
    const isOutgoing = outgoingIds.has(node.id);

    return {
      ...node,
      style: {
        background,
        color: "white",
        borderRadius: 10,
        padding: 10,
        width: 180,
        textAlign: "center",
        fontWeight: 600,

        border: isSelected
          ? "4px solid #3b82f6" // Selected (Blue)
          : isIncoming
          ? "4px solid #ef4444" // Incoming (Red)
          : isOutgoing
          ? "4px solid #facc15" // Outgoing (Yellow)
          : "none",

        opacity:
          !selectedNode ||
          isSelected ||
          isIncoming ||
          isOutgoing
            ? 1
            : 0.25,
      },
    };
  });

  // Style Edges
  const styledEdges = edges.map((edge) => {
    let color = "#94A3B8";
    let width = 1;
    let animated = false;
    let opacity = selectedNode ? 0.15 : 1;

    if (selectedNode) {
      if (edge.source === selectedNode.id) {
        color = "#facc15"; // Outgoing
        width = 3;
        animated = true;
        opacity = 1;
      }

      if (edge.target === selectedNode.id) {
        color = "#ef4444"; // Incoming
        width = 3;
        animated = true;
        opacity = 1;
      }
    }

    return {
      ...edge,
      animated,
      style: {
        stroke: color,
        strokeWidth: width,
        opacity,
      },
    };
  });

  return (
    <div
      style={{
        width: "100%",
        height: "700px",
      }}
    >
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        fitView
        nodeTypes={nodeTypes}
        onNodeClick={(event, node) => {
          if (onNodeSelect) {
            onNodeSelect(node);
          }
        }}
        onPaneClick={() => {
  if (onClearSelection) {
    onClearSelection();
  }
}}
      >
        <Controls />
        <Background />
        
      </ReactFlow>
    </div>
  );
}

export default DependencyGraph;