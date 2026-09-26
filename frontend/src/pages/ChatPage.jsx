import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Sparkles,
  Send,
  FileCode2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import "./ChatPage.css";

function ChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setAnswer("");
      setSources([]);

      const projectId = localStorage.getItem("projectId");

      if (!projectId) {
        throw new Error("Project ID not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/ask`,
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const projectName =
    localStorage.getItem("projectName") ||
    "Current Repository";

  return (
    <div className="chat-page">

      {/* Header */}
      <header className="chat-header">

        <div>
          <div className="chat-eyebrow">
            <Sparkles size={14} />
            REPOSITORY INTELLIGENCE
          </div>

          <h1 className="chat-title">
            Chat with your repository
          </h1>

          <p className="chat-subtitle">
            Ask questions about your codebase and get answers
            using the indexed repository context.
          </p>
        </div>

      </header>

      {/* Repository Context */}
      <div className="chat-repository">

        <div className="chat-repository-icon">
          <FileCode2 size={19} />
        </div>

        <div className="chat-repository-info">
          <div className="chat-repository-label">
            CURRENT REPOSITORY
          </div>

          <div className="chat-repository-name">
            {projectName}
          </div>
        </div>

        <div className="chat-repository-status">
          <CheckCircle2 size={14} />
          Indexed
        </div>

      </div>

      {/* Chat Workspace */}
      <div className="chat-workspace">

        {/* Question Area */}
        <div className="question-box">

          <div className="question-header">
            <div className="question-icon">
              <MessageSquare size={18} />
            </div>

            <div>
              <h2>Ask about your code</h2>

              <p>
                Questions are answered using relevant repository
                context retrieved by CodeLens.
              </p>
            </div>
          </div>

          <div className="question-input-wrapper">

            <textarea
              placeholder="e.g. How does authentication work in this project?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <div className="question-input-footer">

              <span className="question-hint">
                Press Enter to ask · Shift + Enter for a new line
              </span>

              <button
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                className="ask-button"
              >
                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Analyzing
                  </>
                ) : (
                  <>
                    Ask
                    <Send size={15} />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="chat-loading">

            <div className="loading-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <strong>Analyzing repository...</strong>

              <p>
                Retrieving relevant code and generating an answer.
              </p>
            </div>

          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="answer-card">

            <div className="answer-header">

              <div className="answer-title-wrapper">

                <div className="answer-icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2>Repository Answer</h2>

                  <p>
                    Generated from your indexed codebase
                  </p>
                </div>

              </div>

            </div>

            <div className="markdown">
              <ReactMarkdown>
                {answer}
              </ReactMarkdown>
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="sources-section">

                <div className="sources-header">

                  <BookOpen size={16} />

                  <div>
                    <h3>Retrieved Sources</h3>

                    <p>
                      Repository files used to answer your question.
                    </p>
                  </div>

                </div>

                <div className="sources">

                  {sources.map((source) => (
                    <span
                      key={source}
                      className="source-chip"
                    >
                      <FileCode2 size={13} />
                      {source}
                    </span>
                  ))}

                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default ChatPage;
