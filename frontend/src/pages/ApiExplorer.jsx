import { useEffect, useState } from "react";
import axios from "axios";

function ApiExplorer() {
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [explanations, setExplanations] = useState({});
const [loadingExplanation, setLoadingExplanation] = useState(null);
  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const projectPath =
      localStorage.getItem("projectPath");
      console.log("Project Path:", projectPath);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/apis`,
        {
          projectPath,
        }
      );
      console.log(res.data);
      setApis(res.data);
    } catch (err) {
      console.error("Error fetching APIs:", err);
    } finally {
      setLoading(false);
    }
  };

  const explainNode = async (node) => {
  // Return cached explanation if available
  if (explanations[node.id]) return;

  try {
    setLoadingExplanation(node.id);

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/apis/explain-node`,
      {
        node,
        route: selectedApi.route,
        method: selectedApi.method,
      }
    );

    setExplanations((prev) => ({
      ...prev,
      [node.id]: res.data.explanation,
    }));
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingExplanation(null);
  }
};

  if (loading) {
    return <h2>Loading APIs...</h2>;
  }

  return (
  <div style={{ padding: "20px" }}>
    <h1 style={{color: "white"}}>API Explorer</h1>

    {apis.length === 0 ? (
      <p style={{color: "white"}}>No APIs found.</p>
    ) : (
      <div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "20px",
    height: "700px",
  }}
>
  {/* Left Panel */}
  <div
    style={{
      width: "300px",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      overflowY: "auto",
    }}
  >
    <h3 style={{color: "white"}}>APIs</h3>

    {apis.map((api, index) => (
      <div
        key={index}
        onClick={() => setSelectedApi(api)}
        style={{
          padding: "12px",
          marginBottom: "10px",
          cursor: "pointer",
          borderRadius: "8px",
          background:
            selectedApi?.route === api.route &&
            selectedApi?.method === api.method
              ? "#2563eb"
              : "#f5f5f5",
          color:
            selectedApi?.route === api.route &&
            selectedApi?.method === api.method
              ? "white"
              : "black",
        }}
      >
        <strong style={{color: "white"}}>{api.method}</strong>
        <br />
        {api.route}
      </div>
    ))}
  </div>

  {/* Right Panel */}
  <div
    style={{
      flex: 1,
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
    }}
  >
    {!selectedApi ? (
      <p style={{color: "white"}}>Select an API from the left.</p>
    ) : (
      <>
        <>
  <h2 style={{color: "white"}}>
    {selectedApi.method} {selectedApi.route}
  </h2>

  <div
    style={{
      marginTop: "30px",
    }}
  >
    {selectedApi.flow.map((node, index) => (
      <div
        key={node.id || index}
        style={{
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <strong style={{color: "white"}}>
            {node.type.toUpperCase()}
          </strong>

          <span>{node.function}</span>

          <button style={{color: "white"}}
            onClick={() => explainNode(node)}
          >
            ?
          </button>
        </div>

        {loadingExplanation === node.id && (
          <p style={{color: "white"}}>Thinking...</p>
        )}

        {explanations[node.id] && (
          <div
            style={{
              marginTop: "8px",
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "6px",
              color: "white",
            }}
          >
            {explanations[node.id]}
          </div>
        )}

        {index !== selectedApi.flow.length - 1 && (
          <div
            style={{
              margin: "10px 0",
              fontSize: "24px",
              color: "white",
            }}
          >
            ↓
          </div>
        )}
      </div>
    ))}
  </div>
</>
      </>
    )}
  </div>
</div>
    )}

  </div>
);
}

export default ApiExplorer;