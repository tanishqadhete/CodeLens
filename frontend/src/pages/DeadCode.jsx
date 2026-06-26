import { useEffect, useState } from "react";
import axios from "axios";

function DeadCode() {
  const [data, setData] =
    useState(null);

  useEffect(() => {
    fetchDeadCode();
  }, []);

  const fetchDeadCode = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/dead-code",
      {
        projectPath:
          localStorage.getItem(
            "projectPath"
          ),
      }
    );

    setData(res.data);
  };

  return (
    <div>
      <h1>Dead Code Detector</h1>

      <pre>
        {JSON.stringify(
          data,
          null,
          2
        )}
      </pre>
    </div>
  );
}

export default DeadCode;