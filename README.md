# CodeLens

> **Understand your codebase from a different lens.**

CodeLens is a repository intelligence platform designed to help developers understand unfamiliar JavaScript and TypeScript codebases.

Instead of manually navigating through hundreds of files, CodeLens analyzes a repository using **static code analysis, dependency graphs, API detection, vector retrieval, and Retrieval-Augmented Generation (RAG)** to provide a structured view of the project.

It allows developers to explore repository statistics, visualize file dependencies, inspect detected API endpoints and flows, and ask natural-language questions about the indexed codebase.

---

## ✨ Features

### 📊 Repository Overview

Get a high-level understanding of a repository without manually inspecting every file.

CodeLens extracts information such as:

* Total number of source files
* Models
* Controllers
* Routes
* Middleware
* Detected API endpoints
* Folder structure
* Technologies and libraries used
* Repository name

The overview is generated using **static code analysis**, without requiring an LLM.

---

### 🔗 Dependency Graph

Visualize how files in the repository are connected.

CodeLens analyzes imports and requires to construct relationships between source files.

The dependency graph helps answer questions such as:

* Which files import this module?
* What does this file depend on?
* How are modules connected?
* Which parts of the project are highly connected?

The graph is presented interactively so that relationships can be explored visually.

---

### 🌐 API Explorer

CodeLens detects API endpoints from the repository and presents them in an organized interface.

It can identify information such as:

* HTTP method
* Route/path
* Associated source file
* Controller/handler information where detectable

This provides an overview of the API surface of a backend application.

> **Note:** API detection is based on static analysis. CodeLens does not attempt to automatically generate a complete natural-language explanation of what every API does.

---

### 🛣️ API Flow Visualization

For supported API structures, CodeLens can build API flow information to help connect endpoints with the relevant parts of the application.

This makes it easier to move from:

```text
API Endpoint
      ↓
Route
      ↓
Handler / Controller
      ↓
Related Code
```

The goal is to provide structural visibility into API organization rather than claim that the application has been perfectly understood.

---

### 💬 Repository Chat

CodeLens includes a RAG-powered repository chat system.

Instead of sending the entire repository to the language model for every question, the repository is indexed beforehand.

When a user asks a question:

```text
User Question
      ↓
Question Embedding
      ↓
Relevant Repository Retrieval
      ↓
Context Construction
      ↓
Gemini
      ↓
Generated Answer
```

This allows questions such as:

* "Where is authentication handled?"
* "Which files are responsible for creating users?"
* "Where is JWT used?"
* "How is a particular feature implemented?"
* "Which files are related to this function?"

The answer is generated using retrieved repository context.

---

### 🧠 RAG-Based Retrieval

CodeLens uses Retrieval-Augmented Generation to ground repository questions in the indexed codebase.

The indexing process includes:

1. Reading source files
2. Splitting code into chunks
3. Generating embeddings
4. Storing the chunks and embeddings
5. Retrieving relevant chunks when a question is asked
6. Providing the retrieved context to Gemini

This separates **repository retrieval** from **language-model generation**.

---

### 📁 ZIP Upload

Users can upload a project as a `.zip` archive.

CodeLens extracts the project and analyzes its source structure.

---

### 🔗 GitHub Repository Import

Users can provide a public GitHub repository URL.

CodeLens clones the repository and runs the same analysis pipeline on the resulting project.

---

## 🏗️ Architecture

At a high level, CodeLens consists of a React frontend and a Node.js/Express backend.

```text
                         ┌─────────────────────┐
                         │      CodeLens       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   React Frontend    │
                         │                     │
                         │  Dashboard          │
                         │  Repository Overview│
                         │  API Explorer       │
                         │  API Flow            │
                         │  Dependency Graph   │
                         │  Repository Chat    │
                         └──────────┬──────────┘
                                    │
                                  HTTP
                                    │
                         ┌──────────▼──────────┐
                         │   Express Backend   │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
      ┌───────▼───────┐    ┌────────▼────────┐   ┌──────▼──────┐
      │ Static Analysis│    │ Repository RAG │   │   Graphs    │
      │                │    │                │   │             │
      │ API Detection  │    │ Chunking       │   │ Dependency  │
      │ Tech Detection │    │ Embeddings     │   │ Function    │
      │ File Analysis  │    │ Retrieval      │   │ API Flow    │
      └────────────────┘    └────────┬───────┘   └─────────────┘
                                     │
                              ┌──────▼──────┐
                              │  MongoDB    │
                              │             │
                              │ Code Chunks │
                              │ Embeddings  │
                              │ API Data    │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │    Gemini   │
                              │ Generation  │
                              └─────────────┘
```

---

# 🔍 How Repository Analysis Works

CodeLens does not rely entirely on an AI model to understand a repository.

A significant portion of the analysis is performed using deterministic/static techniques.

### Repository Processing

```text
ZIP / GitHub Repository
          ↓
    Repository Extraction
          ↓
      File Discovery
          ↓
    Static Code Analysis
          ↓
 ┌────────┼───────────────┐
 ↓        ↓               ↓
APIs   Dependencies    Repository
       & Graphs         Statistics
```

The resulting information is then presented through the CodeLens interface.

---

# 🧩 Dependency Analysis

CodeLens analyzes import relationships between source files.

For example:

```text
server.js
   │
   ├── routes/userRoutes.js
   │          │
   │          └── controllers/userController.js
   │
   └── config/db.js
```

These relationships can then be visualized using the dependency graph interface.

The project currently focuses primarily on JavaScript and TypeScript source files.

---

# 🌐 API Analysis

The API analysis layer uses static source-code inspection to detect API endpoints.

For example, code such as:

```javascript
router.get("/users", getUsers);
router.post("/users", createUser);
```

can be represented as:

```text
GET  /users
POST /users
```

This gives developers an overview of the application's API surface.

API analysis should be treated as **structural detection**, rather than a complete semantic understanding of application behavior.

---

# 💬 How Repository Chat Works

The repository chat system follows a RAG pipeline.

## 1. Repository Indexing

Source files are discovered and divided into smaller chunks.

```text
Source File
    ↓
Code Chunking
    ↓
Individual Code Chunks
```

Smaller chunks make it possible to retrieve only the relevant parts of a large repository.

---

## 2. Embedding Generation

Each code chunk is converted into a numerical vector representation.

Conceptually:

```text
Code Chunk
    ↓
Embedding Model
    ↓
[0.021, -0.183, 0.472, ...]
```

These embeddings represent the semantic characteristics of the code.

---

## 3. Question Embedding

When a user asks a question, the question is converted into an embedding using the same embedding approach.

```text
"What handles authentication?"
             ↓
        Question Embedding
```

---

## 4. Retrieval

The question embedding is compared against repository embeddings to identify relevant code.

```text
Question
   ↓
Embedding
   ↓
Similarity Search
   ↓
Relevant Code Chunks
```

The retrieved chunks become the evidence used for answer generation.

---

## 5. Generation

The retrieved repository context and the user's question are provided to Gemini.

```text
Question
   +
Retrieved Repository Context
   ↓
Gemini
   ↓
Natural Language Answer
```

Gemini acts as the **generation layer**, while repository retrieval is handled by CodeLens.

---

# 🛠️ Tech Stack

## Frontend

* React
* React Router
* Axios
* Lucide React
* React Markdown
* React Flow

## Backend

* Node.js
* Express.js
* Mongoose
* MongoDB
* Multer
* Simple Git
* Babel Parser

## AI / RAG

* Google Gemini API
* Xenova Transformers
* `all-MiniLM-L6-v2`
* Vector embeddings
* Retrieval-Augmented Generation

## Development

* Vite
* Nodemon
* Git / GitHub

---

# 📂 Project Structure

```text
CodeLens/
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── apiController.js
│   │   ├── chatController.js
│   │   ├── overviewController.js
│   │   └── uploadController.js
│   │
│   ├── models/
│   │   ├── ApiFlow.js
│   │   └── CodeChunk.js
│   │
│   ├── routes/
│   │   ├── apiRoutes.js
│   │   ├── overviewRoutes.js
│   │   └── uploadRoutes.js
│   │
│   ├── services/
│   │   ├── apiExtractor.js
│   │   ├── apiFlowGraph.js
│   │   ├── apiFlowExplainService.js
│   │   ├── chatService.js
│   │   ├── chunkService.js
│   │   ├── dependencyGraph.js
│   │   ├── functionCallGraph.js
│   │   ├── geminiService.js
│   │   ├── githubCloneService.js
│   │   ├── graphRetrievalService.js
│   │   ├── importResolver.js
│   │   ├── indexRepositoryService.js
│   │   └── overviewService.js
│   │
│   ├── utils/
│   │   └── getAllFiles.js
│   │
│   └── server.js
│
├── frontend/
│   │
│   └── src/
│       ├── components/
│       │   ├── ApiFlowGraph.jsx
│       │   ├── DependencyGraph.jsx
│       │   ├── QuickActions.jsx
│       │   ├── RepositoryInfo.jsx
│       │   ├── Sidebar.jsx
│       │   └── StatsCard.jsx
│       │
│       ├── layouts/
│       │
│       ├── pages/
│       │   ├── AboutPage.jsx
│       │   ├── ApiExplorer.jsx
│       │   ├── ApiFlowPage.jsx
│       │   ├── ChatPage.jsx
│       │   ├── Dashboard.jsx
│       │   ├── DependencyGraphPage.jsx
│       │   ├── LandingPage.jsx
│       │   ├── RepositoryOverview.jsx
│       │   └── UploadPage.jsx
│       │
│       ├── css/
│       └── App.jsx
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB
* Git

You will also need a Google Gemini API key for repository chat functionality.

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd CodeLens
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Use your own credentials and connection string.

> Never commit your `.env` file or expose API keys publicly.

---

# ▶️ Running the Application

## Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

---

## Start the Frontend

From the `frontend` directory:

```bash
npm run dev
```

Vite will provide the local development URL, typically:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 📖 Using CodeLens

### Step 1 — Import a Repository

From the landing page, either:

* Upload a `.zip` project
* Provide a public GitHub repository URL

---

### Step 2 — Explore the Repository

After processing, CodeLens provides access to:

* Repository overview
* Repository statistics
* Dependency graph
* API Explorer
* API flow
* Repository chat

---

### Step 3 — Ask Questions

Open **Repository Chat** and ask a question about the indexed codebase.

For example:

```text
Where is authentication implemented?
```

or:

```text
Which files handle user creation?
```

CodeLens retrieves relevant repository context before sending the context to Gemini.

---

# ⚠️ Limitations & Disclaimer

CodeLens uses a combination of **static analysis, embeddings, retrieval, and generative AI**. The results should therefore be treated as an assistance tool rather than a guaranteed source of truth.

### AI-generated answers can hallucinate

Repository Chat uses a generative AI model. Even though CodeLens retrieves repository context before generating an answer, the model can still:

* Misinterpret code
* Make incorrect assumptions
* Produce incomplete explanations
* Reference information incorrectly
* Fail to understand complex application behavior
* Generate details that are not explicitly present in the retrieved context

Always verify important conclusions against the actual source code.

---

### Retrieval is not perfect

RAG depends on retrieving relevant chunks of code.

If the required information is not retrieved, the generated answer may be incomplete or inaccurate.

Semantic similarity is useful for finding conceptually related code, but it does not guarantee that the retrieved chunks contain everything required to answer a question.

---

### Static analysis has limitations

CodeLens relies on static analysis for several repository features.

Dynamic behavior can be difficult to detect, including:

* Dynamically constructed routes
* Runtime-generated imports
* Highly dynamic JavaScript
* Complex framework abstractions
* Runtime dependency injection
* Behavior dependent on external services

Therefore, detected APIs, dependencies, and relationships may not represent every runtime behavior of an application.

---

### API detection is not API explanation

CodeLens detects API endpoints and provides structural API information.

It does **not** guarantee a complete semantic explanation of what each API does internally.

---

### Supported source code

The current implementation primarily targets:

```text
JavaScript
JSX
TypeScript
TSX
```

Other languages may not be analyzed correctly.

---

### Security and privacy

Repositories uploaded to CodeLens may be processed by the application and, for repository chat, relevant retrieved context may be sent to the configured Gemini API.

Do not upload sensitive or confidential repositories unless you understand and accept the data-handling implications of your deployment and AI provider.

---

# 🎯 Design Philosophy

CodeLens is built around a simple idea:

> **Repository understanding should not depend on reading every file manually.**

Different types of understanding require different techniques.

| Problem                    | CodeLens Approach          |
| -------------------------- | -------------------------- |
| Repository structure       | Static analysis            |
| Project statistics         | File-system analysis       |
| Technology detection       | Package analysis           |
| API discovery              | Static code analysis       |
| File relationships         | Dependency graph           |
| API relationships          | API flow analysis          |
| Natural-language questions | RAG + Gemini               |
| Relevant code retrieval    | Embeddings / vector search |

Rather than asking an AI model to understand everything at once, CodeLens combines deterministic analysis with retrieval and generation.

---

# 🔮 Future Improvements

Potential future improvements include:

* More robust AST-based analysis
* Support for additional programming languages
* Improved API detection
* More accurate middleware detection
* Better function-call graph resolution
* Improved vector search and retrieval ranking
* Hybrid keyword + semantic retrieval
* Better handling of large repositories
* Repository-level caching
* Authentication and multi-user support
* Improved error handling
* More detailed code navigation
* Line-level source references in AI answers
* Improved hallucination detection and answer validation

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve CodeLens:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "feat: describe your change"
```

5. Push the branch

```bash
git push origin feature/your-feature
```

6. Open a Pull Request

---

# 📄 License

This project is currently intended as a personal/educational project.

Add an appropriate open-source license here if you decide to distribute CodeLens under one.

---

# 👨‍💻 Project

**CodeLens — Repository Intelligence Platform**

Built with:

**React · Node.js · Express · MongoDB · React Flow · Babel Parser · Transformers · Gemini · RAG**

> **Stop reading a codebase file by file. Understand how it fits together.**
