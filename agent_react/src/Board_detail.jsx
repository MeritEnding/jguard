import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Board_detail.css"; // Ensure this path is correct

const Board_detail = () => {
  const { id } = useParams(); // Extracting :id from the URL
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  // Function to fetch question details and its answers
  const fetchDetail = async () => {
    setLoading(true); // Always set loading to true when fetching starts
    setError(null); // Clear any previous errors
    try {
      const response = await fetch(`http://localhost:8080/api/board/detail/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch question details. Please try again.");
      }

      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      console.error("Error fetching board detail:", err);
      setError("Oops! We couldn't load the question. It might be a network issue or the question doesn't exist.");
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data when the component mounts or 'id' changes
  useEffect(() => {
    fetchDetail();
  }, [id]); // Dependency array: re-run if 'id' changes

  // Handles submitting a new answer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null); // Clear previous submit status

    if (!answerContent.trim()) {
      setSubmitStatus("Please enter your answer before submitting.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/answer/create/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: answerContent }),
      });

      if (!response.ok) {
        // Attempt to read error message from server if available
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit your answer.");
      }

      setSubmitStatus("Your answer has been successfully registered!");
      setAnswerContent(""); // Clear the input field after successful submission
      fetchDetail(); // Re-fetch to display the newly added answer
    } catch (err) {
      console.error("Error submitting answer:", err);
      setSubmitStatus(`Failed to submit answer: ${err.message || "Please try again later."}`);
    }
  };

  // --- Conditional Rendering for Loading, Error, and No Question States ---
  if (loading) {
    return (
      <div className="board-status-message loading">
        <p>Loading question details...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-status-message error">
        <p>{error}</p>
        <button onClick={fetchDetail} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="board-status-message no-question">
        <p>No question found. It might have been deleted or never existed.</p>
      </div>
    );
  }

  // --- Main Content Rendering ---
  return (
    <div className="board-detail-wrapper"> {/* New wrapper for full-screen effect */}
      <div className="board-detail-container">
        {/* Question Header */}
        <header className="question-header">
          <h1 className="question-subject">{question.subject}</h1>
          {question.createDate && (
            <p className="question-meta">
              Posted on: **{new Date(question.createDate).toLocaleDateString()}**
            </p>
          )}
        </header>

        {/* Question Body */}
        <section className="question-body">
          <p className="question-content">{question.content}</p>
        </section>

        <hr className="section-divider" />

        {/* Answers Section */}
        <section className="answers-section">
          <h2 className="answers-heading">
            {question.answerList?.length || 0}
            {question.answerList?.length === 1 ? " Answer" : " Answers"}
          </h2>
          {question.answerList && question.answerList.length > 0 ? (
            <ul className="answer-list">
              {question.answerList.map((answer) => (
                <li key={answer.id || answer.createDate} className="answer-item"> {/* Use a stable key, id preferred */}
                  <p className="answer-content">{answer.content}</p>
                  {answer.createDate && (
                    <span className="answer-meta">
                      Answered on: {new Date(answer.createDate).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-answers">Be the first to share your insights!</p>
          )}
        </section>

        <hr className="section-divider" />

        {/* Answer Form Section */}
        <section className="answer-form-section">
          <h2 className="answer-form-heading">Submit Your Answer</h2>
          <form onSubmit={handleSubmit} className="answer-form">
            <textarea
              name="content"
              id="answerContent"
              rows="8"
              placeholder="Write your insightful answer here..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              required
              className="answer-textarea"
            ></textarea>
            <button type="submit" className="submit-button">
              Post Your Answer
            </button>
            {submitStatus && (
              <p className={`submit-status ${submitStatus.includes("successfully") ? "success" : "error"}`}>
                {submitStatus}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default Board_detail;