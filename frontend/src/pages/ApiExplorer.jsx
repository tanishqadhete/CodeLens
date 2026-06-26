import { useEffect, useState } from "react";
import axios from "axios";

function ApiExplorer() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const projectPath =
      localStorage.getItem("projectPath");
      console.log("Project Path:", projectPath);

      const res = await axios.post(
        "http://localhost:5000/api/apis",
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

  if (loading) {
    return <h2>Loading APIs...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Explorer</h1>

      {apis.length === 0 ? (
        <p>No APIs found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th>Method</th>
              <th>Route</th>
              <th>File</th>
            </tr>
          </thead>

          <tbody>
            {apis.map((api, index) => (
              <tr key={index}>
                <td>{api.method}</td>
                <td>{api.route}</td>
                <td>{api.file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ApiExplorer;