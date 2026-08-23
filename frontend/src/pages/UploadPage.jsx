import { useState } from "react";
import axios from "axios";
import DependencyGraph from "../components/DependencyGraph";
import { useNavigate } from "react-router-dom";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a ZIP file.");
      return;
    }

    setMessage("");
    setCount(null);
    setNodes([]);
    setEdges([]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("zipFile", file);

      // Upload ZIP
      const uploadRes = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload Response:", uploadRes.data);


setMessage(uploadRes.data.message);

setCount(uploadRes.data.filesExtracted);


// Save repository path
// Save repository path
const projectPath = uploadRes.data.projectPath;

if (!projectPath) {
  throw new Error("Project path not received from server");
}

const normalizedPath =
  projectPath.replace(/\\/g, "/");

localStorage.setItem(
  "projectPath",
  normalizedPath
);

console.log(
  "Saved project path:",
  normalizedPath
);
      // Generate dependency graph

      navigate("/dashboard");
    } catch (err) {
      console.log(err);

      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>CodeLens</h1>

      <input
        type="file"
        accept=".zip"
        onChange={(e) => {
          setFile(e.target.files[0]);
        }}
      />

      {file && (
        <p>
          Selected: {file.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <div style={{ textAlign: "center" }}>
          <h3>{message}</h3>

          {count !== null && (
            <p>
              Files Extracted: {count}
            </p>
          )}

          <p>
            Nodes: {nodes.length}
          </p>

          <p>
            Edges: {edges.length}
          </p>
        </div>
      )}

      {nodes.length > 0 && (
        <div style={styles.graphContainer}>
          <DependencyGraph
            nodes={nodes}
            edges={edges}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "40px",
  },

  graphContainer: {
    width: "100%",
    height: "700px",
    marginTop: "30px",
    border: "1px solid #444",
    borderRadius: "10px",
    overflow: "hidden",
  },
};

export default UploadPage;