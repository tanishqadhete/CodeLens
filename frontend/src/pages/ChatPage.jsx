import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./ChatPage.css";

function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Replace with your actual projectId for now
  const projectId = "6860abcdef12345678901234";

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");
      setSources([]);

      const response = await fetch(
        "http://localhost:5000/api/chat/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            question,
          }),
        }
      );

      const data = await response.json();

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
      setAnswer("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <h1>Chat with Repository</h1>

      <div className="question-box">
        <textarea
          placeholder="Ask something about the repository..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askQuestion}>
          Ask
        </button>
      </div>

      {loading && (
        <div className="loading">
          Analyzing repository...
        </div>
      )}

      {answer && (
        <div className="answer-card">
          <h2>Answer</h2>

          <div className="markdown">
            <ReactMarkdown>
              {answer}
            </ReactMarkdown>
          </div>

          <h3>Sources</h3>

          <div className="sources">
            {sources.map((source) => (
              <span
                key={source}
                className="source-chip"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;