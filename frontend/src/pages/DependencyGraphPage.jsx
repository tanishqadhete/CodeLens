import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Network,
  Search,
  FileCode2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import DependencyGraph from "../components/DependencyGraph";

function DependencyGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGraph();
  }, []);

  const fetchGraph = async () => {
    try {
      const projectPath =
        localStorage.getItem("projectPath");

      const res = await axios.post(
        "http://localhost:5000/api/graph",
        {
          projectPath,
        }
      );

      setNodes(res.data.nodes);
      setEdges(res.data.edges);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredNodes = useMemo(() => {
    if (!search) return nodes;

    return nodes.filter((node) =>
      node.data.label
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [nodes, search]);

  const nodeMap = useMemo(() => {
    const map = {};

    nodes.forEach((node) => {
      map[node.id] = node;
    });

    return map;
  }, [nodes]);

  const outgoingNodes = selectedNode
    ? edges
        .filter(
          (edge) =>
            edge.source === selectedNode.id
        )
        .map((edge) => nodeMap[edge.target])
        .filter(Boolean)
    : [];

  const incomingNodes = selectedNode
    ? edges
        .filter(
          (edge) =>
            edge.target === selectedNode.id
        )
        .map((edge) => nodeMap[edge.source])
        .filter(Boolean)
    : [];

  return (
    <div className="dependency-page">

      {/* Header */}

      <div className="dependency-header">

        <div>
          <div className="dependency-eyebrow">
            <Network size={14} />
            Repository Architecture
          </div>

          <h1 className="dependency-title">
            Dependency Graph
          </h1>

          <p className="dependency-subtitle">
            Explore relationships and dependencies between
            files in your repository.
          </p>
        </div>

        {/* Search */}

        <div className="dependency-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

      </div>

      {/* Legend */}

      <div className="dependency-legend">

        <span>
          <i className="legend-selected" />
          Selected File
        </span>

        <span>
          <i className="legend-incoming" />
          Incoming Dependencies
        </span>

        <span>
          <i className="legend-outgoing" />
          Outgoing Dependencies
        </span>

      </div>

      {/* Graph + Details */}

      <div className="dependency-layout">

        {/* Graph */}

        <div className="dependency-graph-card">

          <div className="dependency-graph-topbar">

            <div>
              <strong>
                File Relationships
              </strong>

              <span>
                {filteredNodes.length} files
              </span>
            </div>

          </div>

          <div className="dependency-graph-wrapper">

            <DependencyGraph
              nodes={filteredNodes}
              edges={edges}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              onClearSelection={() =>
                setSelectedNode(null)
              }
            />

          </div>

        </div>

        {/* Details Panel */}

        <div className="dependency-details">

          <div className="dependency-details-header">

            <div className="dependency-details-icon">
              <FileCode2 size={19} />
            </div>

            <div>
              <h2>Node Details</h2>

              <p>
                Inspect the selected file
              </p>
            </div>

          </div>

          {!selectedNode ? (

            <div className="dependency-empty">

              <div className="dependency-empty-icon">
                <Network size={20} />
              </div>

              <p>
                Click any node to inspect it.
              </p>

            </div>

          ) : (

            <>

              {/* File Name */}

              <div className="dependency-detail-block">

                <div className="dependency-label">
                  FILE NAME
                </div>

                <p className="dependency-file-name">
                  {selectedNode.data.label}
                </p>

              </div>

              {/* Full Path */}

              <div className="dependency-detail-block">

                <div className="dependency-label">
                  FULL PATH
                </div>

                <p className="dependency-file-path">
                  {selectedNode.data.fullPath}
                </p>

              </div>

              <div className="dependency-divider" />

              {/* Imports */}

              <div className="dependency-relations">

                <div className="dependency-relation-header">

                  <div className="relation-icon outgoing">
                    <ArrowUpRight size={15} />
                  </div>

                  <div>
                    <h3>Imports</h3>
                    <span>
                      {outgoingNodes.length} dependencies
                    </span>
                  </div>

                </div>

                {outgoingNodes.length ? (

                  <ul>

                    {outgoingNodes.map((node) => (

                      <li key={node.id}>

                        <strong>
                          {node.data.label}
                        </strong>

                        <span>
                          {node.data.fullPath}
                        </span>

                      </li>

                    ))}

                  </ul>

                ) : (

                  <p className="dependency-none">
                    No imports
                  </p>

                )}

              </div>

              <div className="dependency-divider" />

              {/* Imported By */}

              <div className="dependency-relations">

                <div className="dependency-relation-header">

                  <div className="relation-icon incoming">
                    <ArrowDownRight size={15} />
                  </div>

                  <div>
                    <h3>Imported By</h3>
                    <span>
                      {incomingNodes.length} dependents
                    </span>
                  </div>

                </div>

                {incomingNodes.length ? (

                  <ul>

                    {incomingNodes.map((node) => (

                      <li key={node.id}>

                        <strong>
                          {node.data.label}
                        </strong>

                        <span>
                          {node.data.fullPath}
                        </span>

                      </li>

                    ))}

                  </ul>

                ) : (

                  <p className="dependency-none">
                    No incoming dependencies
                  </p>

                )}

              </div>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default DependencyGraphPage;
