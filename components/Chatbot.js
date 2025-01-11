import React, { useState } from "react";
import "./Chatbot.css";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function Chatbot() {
  const [question, setQuestion] = useState("");  // Store user input (including speech)
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]); // Track history of user questions

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setQuestion(transcript); // When stop is pressed, set the question to the transcript
  };

  async function generateAnswer() {
    const userMessage = { sender: "user", text: question };
    setMessages([...messages, userMessage]);

    // Save the question to history
    setHistory([...history, userMessage.text]);

    // Reset input field and transcript
    setQuestion("");
    resetTranscript();

    // Add a temporary loading message from the bot
    const loadingMessage = { sender: "bot", text: "Loading..." };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAN0TR8b5sSOHhn_RBQlkhGYYpDXYnCI0Y",
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const botMessage = {
        sender: "bot",
        text: response.data.candidates[0].content.parts[0].text,
      };

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        botMessage,
      ]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "An error occurred. Please try again later.",
      };
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        errorMessage,
      ]);
    }
  }

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="App">
      <div className="title-chatai">
        <h1>
          <i>ChatAI</i>
        </h1>
      </div>

      <div className="Chatbot">
        {/* History Section */}
        <div className="history">
          <h3>History</h3>
          {history.map((question, index) => (
            <div key={index} className="history-item">
              <div>{question}</div>
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="chat-container">
          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={question || transcript} // Update input field with transcript text while speaking
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && generateAnswer()}
            />
            <div className="search-button">
              <button onClick={generateAnswer}>Search</button>
            </div>

            <div className="voice-controls">
              <button onClick={startListening}>Start</button>
              <button onClick={stopListening}>Stop</button>
            </div>
          </div>

          <div className="transcript">
            <p>{transcript}</p>
            {listening && <p>Listening...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
