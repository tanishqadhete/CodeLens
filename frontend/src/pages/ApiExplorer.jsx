import { useEffect, useState } from "react";
import axios from "axios";

function ApiExplorer() {
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const projectId =
        localStorage.getItem("projectId");

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      console.log("Project ID:", projectId);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/apis`,
        {
          projectId,
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
        </div>

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