import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [category, setCategory] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);

  const [questions, setQuestions] = useState("");
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setMessage(`Selected: ${selectedFile.name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setMessage("Uploading resume...");

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage("Upload failed.");
        return;
      }

      setMessage(
        `Resume uploaded successfully! ${data.total_chunks} chunks created.`
      );

      console.log(data);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to backend.");
    }
  };

  const handleGenerateQuestions = async () => {
  try {
    setIsGenerating(true);
    setMessage("Generating personalized interview questions...");

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
      return;
    }

    setQuestions(data.questions);
    setMessage("Interview questions generated successfully!");
    } catch (error) {
    console.error(error);
    setMessage("Could not connect to backend.");
  } finally {
    setIsGenerating(false);
  }
};

  return (
  <div className="app">
    <div className="container">

      <header className="header">
        <h1>🤖 AI Resume Interviewer</h1>
        <p>
          Turn your resume into a personalized AI-powered interview.
        </p>
      </header>

      <div className="card">
        <h2>📄 Upload Resume</h2>

        <div className="upload-area">
          <p>
            Upload your resume in PDF format
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />

          <br />
          <br />

          <button onClick={handleUpload}>
            Upload Resume
          </button>
        </div>

        <p className="status">{message}</p>
      </div>

      <div className="card">
        <h2>⚙️ Interview Configuration</h2>

        <div className="settings-grid">

          <div className="setting">
            <label>Interview Type</label>

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
          </div>

          <div className="setting">
            <label>Difficulty</label>

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
          </div>

          <div className="setting">
            <label>Questions</label>

            <select
              value={numQuestions}
              onChange={(event) =>
                setNumQuestions(Number(event.target.value))
              }
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
              <option value={10}>10</option>
            </select>
          </div>

        </div>

        <div className="generate-section">
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
          >
            {isGenerating
              ? "Generating..."
              : "Generate Interview"}
          </button>
        </div>
      </div>

      {questions && (
        <div className="card questions">
          <h2>🤖 Interview Questions</h2>

          <div className="question">
            <pre>{questions}</pre>
          </div>
        </div>
      )}

    </div>
  </div>
);
}

export default App;