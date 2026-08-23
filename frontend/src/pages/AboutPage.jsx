import {
  Brain,
  Database,
  FileCode2,
  Search,
  GitBranch,
  Route,
  MessageSquare,
  ShieldCheck,
  ArrowDown,
  Sparkles,
} from "lucide-react";

function About() {
  return (
    <div className="about-page">

      {/* Header */}
      <header className="about-header">
        <div className="about-eyebrow">
          <Sparkles size={14} />
          ABOUT CODELENS
        </div>

        <h1>How CodeLens understands your code</h1>

        <p>
          CodeLens is a repository intelligence tool that combines
          code analysis, vector search, dependency information, and
          Retrieval-Augmented Generation (RAG) to help developers
          understand unfamiliar codebases.
        </p>
      </header>

      {/* Core idea */}
      <section className="about-card about-highlight">
        <div className="about-card-icon">
          <Brain size={22} />
        </div>

        <div>
          <h2>CodeLens does not send your entire repository to Gemini</h2>

          <p>
            When you ask a question, CodeLens first searches the indexed
            repository for the pieces of code that are most relevant to
            your question. These retrieved pieces are then provided to
            Gemini as context so that the model can generate an answer
            grounded in your repository.
          </p>
        </div>
      </section>

      {/* Pipeline */}
      <section className="about-section">
        <div className="about-section-heading">
          <span>01</span>

          <div>
            <h2>How repository analysis works</h2>
            <p>
              Your repository goes through several stages before it
              becomes searchable.
            </p>
          </div>
        </div>

        <div className="pipeline">

          <PipelineStep
            icon={FileCode2}
            number="1"
            title="Repository indexing"
            text="CodeLens reads the uploaded repository and identifies the files and code structures that can be analyzed."
          />

          <PipelineArrow />

          <PipelineStep
            icon={Database}
            number="2"
            title="Code chunking"
            text="Large source files are divided into smaller meaningful code chunks so individual functions, classes, and modules can be retrieved later."
          />

          <PipelineArrow />

          <PipelineStep
            icon={Brain}
            number="3"
            title="Embedding generation"
            text="Each code chunk is converted into a numerical vector representation called an embedding."
          />

          <PipelineArrow />

          <PipelineStep
            icon={Search}
            number="4"
            title="Vector indexing"
            text="The embeddings are stored in MongoDB so semantically similar code can be retrieved efficiently."
          />

        </div>
      </section>

      {/* Question flow */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>02</span>

          <div>
            <h2>What happens when you ask a question?</h2>

            <p>
              CodeLens uses multiple retrieval strategies instead of
              relying on a single similarity search.
            </p>
          </div>
        </div>

        <div className="process-grid">

          <ProcessCard
            icon={MessageSquare}
            title="1. Your question"
            text="You ask a natural-language question about the repository."
          />

          <ProcessCard
            icon={Brain}
            title="2. Question embedding"
            text="The question is converted into an embedding using the same embedding model used during indexing."
          />

          <ProcessCard
            icon={Search}
            title="3. Semantic retrieval"
            text="MongoDB vector search finds code chunks whose meaning is most similar to the question."
          />

          <ProcessCard
            icon={Route}
            title="4. API flow retrieval"
            text="Relevant API flows are also searched so endpoint-level questions can be connected to their request paths."
          />

          <ProcessCard
            icon={GitBranch}
            title="5. Function graph"
            text="When an exact function is identified, CodeLens can follow the function graph to retrieve related functions."
          />

          <ProcessCard
            icon={ShieldCheck}
            title="6. Context construction"
            text="The retrieved evidence is combined into a structured context containing filenames, symbols, lines, API flows, and code."
          />

        </div>
      </section>

      {/* Gemini */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>03</span>

          <div>
            <h2>How Gemini processes the answer</h2>

            <p>
              Gemini is used as the generation layer, not as the
              repository search engine.
            </p>
          </div>
        </div>

        <div className="about-card">

          <div className="about-card-icon">
            <Brain size={22} />
          </div>

          <div>

            <h3>Retrieval first, generation second</h3>

            <p>
              After retrieval, CodeLens sends Gemini a prompt containing
              the user's question and the retrieved repository context.
              Gemini then reasons over that supplied evidence and
              generates the final natural-language explanation.
            </p>

            <div className="model-box">

              <div>
                <span className="model-label">
                  GENERATION MODEL
                </span>

                <strong>Gemini Flash</strong>
              </div>

              <p>
                CodeLens currently uses the Gemini Flash model through
                Google's Generative AI API.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* RAG */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>04</span>

          <div>
            <h2>Why Retrieval-Augmented Generation?</h2>

            <p>
              RAG allows the model to answer questions using information
              retrieved from the repository at query time.
            </p>
          </div>
        </div>

        <div className="rag-comparison">

          <div className="comparison-card">
            <div className="comparison-label">WITHOUT RAG</div>

            <h3>Ask the model directly</h3>

            <p>
              The model does not automatically have access to the
              contents of your repository. It would have to rely on
              information included in the prompt or knowledge learned
              during training.
            </p>
          </div>

          <div className="comparison-card comparison-card-primary">
            <div className="comparison-label">WITH CODELENS RAG</div>

            <h3>Retrieve → Ground → Generate</h3>

            <p>
              CodeLens retrieves relevant repository evidence first.
              That evidence is then supplied to Gemini so the generated
              answer can be grounded in the actual codebase.
            </p>
          </div>

        </div>
      </section>

      {/* Transparency */}
      <section className="about-section">

        <div className="about-section-heading">
          <span>05</span>

          <div>
            <h2>Transparency and limitations</h2>

            <p>
              CodeLens is designed to make its retrieval and generation
              process understandable.
            </p>
          </div>
        </div>

        <div className="about-card">

          <ul className="transparency-list">

            <li>
              <ShieldCheck size={18} />
              <span>
                Answers are generated using retrieved repository
                context rather than blindly analyzing the entire project.
              </span>
            </li>

            <li>
              <ShieldCheck size={18} />
              <span>
                Semantic similarity is used to find conceptually related
                code, while exact symbol matching helps locate explicitly
                mentioned functions or identifiers.
              </span>
            </li>

            <li>
              <ShieldCheck size={18} />
              <span>
                Function relationships can be followed through the
                repository's function graph to provide additional context.
              </span>
            </li>

            <li>
              <ShieldCheck size={18} />
              <span>
                If the retrieved context does not contain enough
                information, the system is instructed not to invent
                repository-specific details.
              </span>
            </li>

          </ul>

        </div>
      </section>

      {/* Footer */}
      <div className="about-footer">
        <p>
          CodeLens combines static code analysis, vector retrieval,
          graph-based relationships, and generative AI to make
          unfamiliar repositories easier to understand.
        </p>
      </div>

    </div>
  );
}


/* ----------------------------------------
   Reusable components
---------------------------------------- */

function PipelineStep({
  icon: Icon,
  number,
  title,
  text,
}) {
  return (
    <div className="pipeline-step">

      <div className="pipeline-icon">
        <Icon size={20} />
      </div>

      <div className="pipeline-number">
        {number}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}


function PipelineArrow() {
  return (
    <div className="pipeline-arrow">
      <ArrowDown size={18} />
    </div>
  );
}


function ProcessCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="process-card">

      <div className="process-icon">
        <Icon size={19} />
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}


export default About;
