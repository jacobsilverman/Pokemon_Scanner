import { useState } from "react";
// import { fetchOpenAIResponse } from "./services/openaiService";
import { searchRecentlyBuyProducts, searchRecentlySoldProducts } from "./services/ebayService";

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>("");

  // const convertFileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onload = () => resolve(reader.result as string);
  //       reader.onerror = (error) => reject(error);
  //   });
  // };

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
        // const imageBase64 = await convertFileToBase64(selectedFile);
        // const result = await fetchOpenAIResponse(imageBase64);
        // setResponse(result.choices[0].message.content);

        const result = await searchRecentlyBuyProducts("charizard");
        setResponse(result);

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
          
          <div>Response: {response && response.map((ele: any, index: any) => {
            return <div key={index}><a target="_blank" href={ele.itemWebUrl}>{ele.title} : {ele.price.currency} {ele.price.value}</a></div>
          })}</div>
      </div>
    </div>
  );
};

export default App;