import ReactFlow, {
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "../utils/getLayoutedElements";

function DependencyGraph({ nodes, edges }) {
  const {
    nodes: layoutedNodes,
    edges: layoutedEdges,
  } = getLayoutedElements(
    nodes,
    edges,
    "TB" // Change to "LR" if you want left-to-right
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DependencyGraph;