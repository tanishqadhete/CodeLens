import ReactFlow, {
  Controls,
  Background,
  MiniMap,
} from "reactflow";

import "reactflow/dist/style.css";


function ApiFlowGraph({
  nodes,
  edges,
  onNodeSelect,
  selectedNode,
  onClearSelection,
}) {

  const styledNodes = nodes.map((node) => {

    const label =
      typeof node.data.label === "string"
        ? node.data.label
        : node.data.label?.function || "Unknown";


    let background = "#2563eb";


    // Color according to API flow layer
    const type =
      typeof node.data.label === "object"
        ? node.data.label.type
        : node.data.type;


    if (type === "route") {
      background = "#8b5cf6";
    }

    else if (type === "middleware") {
      background = "#f59e0b";
    }

    else if (type === "controller") {
      background = "#22c55e";
    }

    else if (type === "service") {
      background = "#06b6d4";
    }

    else if (type === "model") {
      background = "#ef4444";
    }


    const isSelected =
      selectedNode?.id === node.id;


    return {
      ...node,

      data:{
        ...node.data,

        label: (
          <div>
            <div>
              {label}
            </div>

            <div
              style={{
                fontSize:"11px",
                marginTop:"5px",
                opacity:0.8
              }}
            >
              {type}
            </div>

          </div>
        )
      },


      style:{
        background,
        color:"white",
        borderRadius:12,
        padding:12,
        width:200,
        textAlign:"center",
        fontWeight:600,

        border:isSelected
          ? "4px solid #3b82f6"
          : "none",

        opacity:
          !selectedNode || isSelected
          ? 1
          : 0.4
      }
    };

  });



  const styledEdges = edges.map((edge)=>{

    return {
      ...edge,

      animated:true,

      style:{
        stroke:"#64748b",
        strokeWidth:2
      }
    };

  });



  return (

    <div
      style={{
        width:"100%",
        height:"700px"
      }}
    >

      <ReactFlow

        nodes={styledNodes}

        edges={styledEdges}

        fitView


        onNodeClick={(event,node)=>{

          if(onNodeSelect){
            onNodeSelect(node);
          }

        }}


        onPaneClick={()=>{

          if(onClearSelection){
            onClearSelection();
          }

        }}

      >

        <Controls />

        <Background />

        <MiniMap
  pannable
  zoomable
  nodeColor={(node) => {
    switch (node.data.type) {
      case "route":
        return "#7C3AED";   // Purple
      case "controller":
        return "#22C55E";   // Green
      case "service":
        return "#06B6D4";   // Cyan
      case "middleware":
        return "#F59E0B";   // Orange
      case "response":
        return "#2563EB";   // Blue
      default:
        return "#64748B";   // Gray
    }
  }}
  style={{
    background: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "10px",
  }}
/>

      </ReactFlow>


    </div>

  );
}


export default ApiFlowGraph;