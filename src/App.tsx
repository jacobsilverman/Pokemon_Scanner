import { useState } from "react";
import { fetchOpenAIResponse } from "./services/openaiService";

const App = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
      try {
          const result = await fetchOpenAIResponse(input);
          setResponse(result.choices[0].message.content);
      } catch (error) {
          setResponse("Error fetching response.");
      }
  };

  return (
    <div>
      <h1>Miles and Leon</h1>
      <div className="main-body">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} />
          <div>
            <button onClick={handleSubmit}>Send</button>
          </div>
          
          <p>Response: {response}</p>
      </div>
    </div>
  );
};

export default App;