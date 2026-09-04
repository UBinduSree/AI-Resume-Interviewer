import { useRef, useState } from "react";
import "./App.css";

function App() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);

  const [category, setCategory] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const [questions, setQuestions] = useState("");

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF resume.");
      setMessageType("error");
      return;
    }

    setFile(selectedFile);
    setResumeUploaded(false);
    setChunkCount(0);
    setQuestions("");
    setChatMessages([]);

    setMessage(`Selected: ${selectedFile.name}`);
    setMessageType("info");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF resume first.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      setMessage("Uploading and analyzing your resume...");
      setMessageType("loading");

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.error || "Upload failed.");
        setMessageType("error");
        return;
      }

      setResumeUploaded(true);
      setChunkCount(data.total_chunks);

      setMessage(
        `Resume uploaded successfully! ${data.total_chunks} resume sections are ready for AI analysis.`
      );
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the backend.");
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeUploaded) {
      setMessage("Please upload your resume before generating questions.");
      setMessageType("error");
      return;
    }

    try {
      setIsGenerating(true);
      setQuestions("");
      setMessage("AI is creating personalized interview questions...");
      setMessageType("loading");

      const response = await fetch(
        "http://localhost:8000/generate-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category,
            difficulty: difficulty,
            num_questions: numQuestions,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.error || "Failed to generate questions.");
        setMessageType("error");
        return;
      }

      setQuestions(data.questions);
      setMessage("Personalized interview questions generated!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the backend.");
      setMessageType("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async (questionFromSuggestion = null) => {
    const question = (
      questionFromSuggestion || chatQuestion
    ).trim();

    if (!question) {
      setMessage("Please enter a question.");
      setMessageType("error");
      return;
    }

    if (!resumeUploaded) {
      setMessage("Please upload your resume before using Resume Chat.");
      setMessageType("error");
      return;
    }

    try {
      setIsChatting(true);
      setMessage("AI is searching your resume...");
      setMessageType("loading");

      setChatMessages((previous) => [
        ...previous,
        {
          type: "user",
          text: question,
        },
      ]);

      setChatQuestion("");

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.error || "Failed to get an answer.");
        setMessageType("error");
        return;
      }

      setChatMessages((previous) => [
        ...previous,
        {
          type: "ai",
          text: data.answer,
        },
      ]);

      setMessage("Answer generated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the backend.");
      setMessageType("error");
    } finally {
      setIsChatting(false);
    }
  };

  const handleChatKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  };

  const handleCopyQuestions = async () => {
    if (!questions) return;

    try {
      await navigator.clipboard.writeText(questions);
      setMessage("Interview questions copied to clipboard!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Could not copy the questions.");
      setMessageType("error");
    }
  };

  const clearFile = () => {
    setFile(null);
    setResumeUploaded(false);
    setChunkCount(0);
    setQuestions("");
    setChatMessages([]);
    setMessage("");
    setMessageType("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getQuestionList = () => {
    if (!questions) return [];

    return questions
      .split("\n")
      .map((question) => question.trim())
      .filter((question) => question.length > 0)
      .map((question) => question.replace(/^\d+[.)\s-]+/, ""));
  };

  const questionList = getQuestionList();

  return (
    <div className="app">
      <div className="background-shape shape-one"></div>
      <div className="background-shape shape-two"></div>

      <div className="container">

        {/* HEADER */}

        <header className="header">
          <div className="brand-row">
            <div className="robot-logo">🤖</div>

            <h1>
              AI <span>Resume</span> Interviewer
            </h1>
          </div>

          <p className="subtitle">
            Turn your resume into a personalized, AI-powered interview.
          </p>

          <div className="feature-pills">
            <div className="feature-pill">
              <span>☁️</span>
              Upload Resume
            </div>

            <div className="feature-pill">
              <span>☷</span>
              Generate Questions
            </div>

            <div className="feature-pill">
              <span>💬</span>
              Chat with Resume
            </div>

            <div className="feature-pill">
              <span>📊</span>
              Ace Your Interview
            </div>
          </div>
        </header>

        {/* TOP GRID */}

        <div className="top-grid">

          {/* UPLOAD CARD */}

          <div className="card upload-card">
            <div className="card-heading">
              <div className="heading-left">
                <div className="step-number purple">1</div>

                <div>
                  <h2>Upload Your Resume</h2>
                  <p>Give the AI your resume to personalize your interview.</p>
                </div>
              </div>

              <div className="pdf-badge">
                ✓ PDF Only
              </div>
            </div>

            <div
              className={`drop-zone ${
                isDragging ? "dragging" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">☁️</div>

              <h3>
                Drag & drop your resume here
              </h3>

              <p>
                or click anywhere to browse
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                📄 Choose PDF File
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                hidden
              />
            </div>

            {file && (
              <div className="selected-file">
                <div className="file-icon">📄</div>

                <div className="file-info">
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <button
                  className="remove-file"
                  onClick={clearFile}
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            )}

            <button
              className="primary-button full-width"
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading
                ? "⏳ Analyzing Resume..."
                : "⬆ Upload Resume"}
            </button>

            {message && (
              <div className={`status-message ${messageType}`}>
                <span>
                  {messageType === "success"
                    ? "✓"
                    : messageType === "error"
                    ? "!"
                    : messageType === "loading"
                    ? "⟳"
                    : "•"}
                </span>

                <p>{message}</p>
              </div>
            )}
          </div>

          {/* CONFIGURATION CARD */}

          <div className="card config-card">
            <div className="card-heading">
              <div className="heading-left">
                <div className="step-number blue">2</div>

                <div>
                  <h2>Interview Configuration</h2>
                  <p>
                    Customize your interview based on your goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="config-form">

              <div className="form-group">
                <label>
                  <span className="form-icon pink">🎯</span>
                  Interview Type
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  <option value="Technical">Technical</option>
                  <option value="Project">Project</option>
                  <option value="HR">HR</option>
                  <option value="Mixed">Mixed</option>
                </select>

                <small>
                  Choose the focus area for your interview
                </small>
              </div>

              <div className="form-group">
                <label>
                  <span className="form-icon blue-icon">▥</span>
                  Difficulty Level
                </label>

                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value)
                  }
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <small>
                  Adjust the complexity of questions
                </small>
              </div>

              <div className="form-group">
                <label>
                  <span className="form-icon purple-icon">▤</span>
                  Number of Questions
                </label>

                <select
                  value={numQuestions}
                  onChange={(event) =>
                    setNumQuestions(
                      Number(event.target.value)
                    )
                  }
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={7}>7 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>

                <small>
                  Select how many questions to generate
                </small>
              </div>

            </div>

            <button
              className="primary-button generate-button"
              onClick={handleGenerateQuestions}
              disabled={!resumeUploaded || isGenerating}
            >
              {isGenerating
                ? "✨ Creating Questions..."
                : "✨ Generate Interview Questions"}
            </button>

            {!resumeUploaded && (
              <p className="helper-text">
                Upload your resume first to unlock AI generation.
              </p>
            )}
          </div>

          {/* AI MOTIVATION CARD */}

          <div className="ai-panel">
            <div className="ai-panel-content">

              <div className="trophy">🏆</div>

              <h2>
                Get Interview Ready
                <br />
                with AI
              </h2>

              <p className="ai-panel-subtitle">
                Practice smarter. Build confidence.
                Land your dream opportunity.
              </p>

              <div className="benefit-list">

                <div className="benefit">
                  <div className="benefit-icon green">⚡</div>

                  <div>
                    <strong>Personalized Questions</strong>
                    <span>Based on your actual resume</span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon pink-bg">🎯</div>

                  <div>
                    <strong>Multiple Interview Types</strong>
                    <span>Technical · Project · HR · Mixed</span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon cyan">💬</div>

                  <div>
                    <strong>Chat with Your Resume</strong>
                    <span>Ask about your experience</span>
                  </div>
                </div>

                <div className="benefit">
                  <div className="benefit-icon yellow">📊</div>

                  <div>
                    <strong>AI-Powered Insights</strong>
                    <span>Context-aware resume answers</span>
                  </div>
                </div>

              </div>

              <div className="mountain-decoration">
                <span>🏔️</span>
                <span>🏔️</span>
                <span>🏔️</span>
              </div>

              <div className="panel-quote">
                Same Resume.
                <br />
                <strong>Stronger You.</strong>
              </div>

            </div>
          </div>

        </div>

        {/* GENERATED QUESTIONS */}

        {questions && (
          <section className="card questions-card">

            <div className="section-header">

              <div className="section-title">
                <div className="section-icon purple-gradient">
                  ☷
                </div>

                <div>
                  <h2>Generated Interview Questions</h2>
                  <p>
                    Personalized questions based on your resume.
                  </p>
                </div>
              </div>

              <button
                className="copy-button"
                onClick={handleCopyQuestions}
              >
                📋 Copy All
              </button>

            </div>

            <div className="questions-list">

              {questionList.map((question, index) => (
                <div
                  className="question-item"
                  key={`${question}-${index}`}
                >
                  <div className="question-number">
                    {index + 1}
                  </div>

                  <p>{question}</p>
                </div>
              ))}

            </div>

          </section>
        )}

        {/* CHAT */}

        <section className="card chat-card">

          <div className="section-header">

            <div className="section-title">

              <div className="section-icon cyan-gradient">
                💬
              </div>

              <div>
                <h2>Chat with Your Resume</h2>
                <p>
                  Ask questions about your skills, projects,
                  education, experience, or achievements.
                </p>
              </div>

            </div>

            <div className="ai-powered-badge">
              ● AI Powered
            </div>

          </div>

          <div className="chat-body">

            {chatMessages.length === 0 ? (
              <div className="chat-empty">

                <div className="chat-empty-icon">
                  🤖
                </div>

                <h3>
                  Ask me anything about your resume
                </h3>

                <p>
                  I'll search your resume and provide a
                  context-aware answer.
                </p>

                <div className="quick-prompts">

                  <button
                    onClick={() =>
                      handleChat(
                        "What projects has the candidate worked on?"
                      )
                    }
                    disabled={!resumeUploaded || isChatting}
                  >
                    💼 Projects
                  </button>

                  <button
                    onClick={() =>
                      handleChat(
                        "What programming languages does the candidate know?"
                      )
                    }
                    disabled={!resumeUploaded || isChatting}
                  >
                    💻 Skills
                  </button>

                  <button
                    onClick={() =>
                      handleChat(
                        "What is the candidate's educational background?"
                      )
                    }
                    disabled={!resumeUploaded || isChatting}
                  >
                    🎓 Education
                  </button>

                </div>

              </div>
            ) : (
              <div className="chat-messages">

                {chatMessages.map((chat, index) => (
                  <div
                    className={`chat-message ${
                      chat.type === "user"
                        ? "user-message"
                        : "ai-message"
                    }`}
                    key={index}
                  >
                    <div className="chat-avatar">
                      {chat.type === "user"
                        ? "👤"
                        : "🤖"}
                    </div>

                    <div className="chat-bubble">
                      <p>{chat.text}</p>
                    </div>
                  </div>
                ))}

              </div>
            )}

            <div className="chat-input-wrapper">

              <input
                type="text"
                placeholder={
                  resumeUploaded
                    ? "Ask a question about your resume..."
                    : "Upload your resume to start chatting..."
                }
                value={chatQuestion}
                onChange={(event) =>
                  setChatQuestion(event.target.value)
                }
                onKeyDown={handleChatKeyDown}
                disabled={!resumeUploaded || isChatting}
              />

              <button
                className="send-button"
                onClick={() => handleChat()}
                disabled={
                  !resumeUploaded ||
                  !chatQuestion.trim() ||
                  isChatting
                }
              >
                {isChatting ? "..." : "➤"}
              </button>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="footer">

          <div className="footer-brand">
            <span>🤖</span>
            <strong>AI Resume Interviewer</strong>
          </div>

          <div className="footer-divider"></div>

          <p>
            Built with ❤️ using React, FastAPI & Google Gemini
          </p>

          <div className="footer-right">
            <span>
              {resumeUploaded
                ? `✓ Resume ready · ${chunkCount} chunks`
                : "AI-powered interview preparation"}
            </span>
            <span>🚀</span>
          </div>

        </footer>

      </div>
    </div>
  );
}

export default App;