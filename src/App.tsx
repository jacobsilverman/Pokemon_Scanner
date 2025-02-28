import { useState } from "react";
import { fetchOpenAIResponse } from "./services/openaiService";

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>("");

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
        alert("Please select an image.");
        return;
    }

    try {
        const imageBase64 = await convertFileToBase64(selectedFile);
        const result = await fetchOpenAIResponse(imageBase64);
        setResponse(result.choices[0].message.content);
    } catch (error) {
        console.error("Error processing image:", error);
    }
};

  return (
    <div>
      <h1>Miles and Leon</h1>
      <div className="main-body">
      <input type="file" accept="image/*" onChange={handleFileChange} />
          <div>
            <button onClick={handleSubmit}>Send</button>
          </div>
          
          <p>Response: {response}</p>
      </div>
    </div>
  );
};

export default App;