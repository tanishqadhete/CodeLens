import { useEffect, useState } from "react";
import axios from "axios";
import { GitBranch, Activity, Info } from "lucide-react";
import ApiFlowGraph from "../components/ApiFlowGraph";

function ApiFlowPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchFlow();
  }, []);

  const fetchFlow = async () => {
    try {
      const projectId = localStorage.getItem("projectId");
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/apis`,
        {
          projectId,
          graph: true,
        }
      );

      setNodes(res.data.nodes);
      setEdges(res.data.edges);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "42px 44px 60px",
        background:
          "radial-gradient(circle at 85% 0%, rgba(245,158,11,0.10), transparent 28%), linear-gradient(135deg, #fffdf8 0%, #fffaf0 45%, #f8f9fc 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "26px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            marginBottom: "10px",
            color: "#b45309",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          <GitBranch size={14} />
          API ANALYSIS
        </div>

        <h1
          style={{
            margin: 0,
            color: "#211b15",
            fontSize: "32px",
            lineHeight: 1.2,
            letterSpacing: "-0.8px",
            fontWeight: 750,
          }}
        >
          API Flow
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#706354",
            fontSize: "14px",
            lineHeight: 1.7,
            maxWidth: "700px",
          }}
        >
          Explore the API endpoints detected in your repository
          and visualize their relationships.
        </p>
      </div>

      {/* Graph Information Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "16px",
          padding: "13px 17px",
          background:
            "linear-gradient(100deg, #fff7e4 0%, #fffdf8 100%)",
          border: "1px solid #f0dfbd",
          borderRadius: "12px",
          boxShadow:
            "0 4px 14px rgba(120, 74, 15, 0.045)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            color: "#51483c",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "white",
              boxShadow:
                "0 4px 10px rgba(217,119,6,0.20)",
            }}
          >
            <Activity size={16} />
          </div>

          <span>
            Visualize the API endpoints found in your codebase.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#9a8b78",
            fontSize: "11px",
          }}
        >
          <Info size={14} />
          Select a node to highlight it
        </div>
      </div>

      {/* API Graph */}
      <div
        style={{
          width: "100%",
          height: "700px",
          background: "#ffffff",
          border: "1px solid #eadfcd",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow:
            "0 10px 30px rgba(120, 74, 15, 0.065)",
          position: "relative",
        }}
      >
        {/* Top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, #f59e0b, #d97706, #fbbf24)",
            zIndex: 5,
          }}
        />

        <ApiFlowGraph
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          onClearSelection={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}

export default ApiFlowPage;
