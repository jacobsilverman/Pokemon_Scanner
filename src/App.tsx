import { useState } from "react";
import { fetchOpenAIResponse, fetchOpenAIFetch } from "./services/openaiService";
import { pokemonSets } from "./constants/Sets";
import BarLoader from "react-spinners/BarLoader";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import "./App.scss"
// import { searchRecentlyBuyProducts, searchRecentlySoldProducts } from "./services/ebayService";

const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState<string[][]>([]);
  const [failure, setFailure] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // const [response, setResponse] = useState<any>("");

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const addSetName = (extractedArray: string[]): string[][] => {
    const properNames = extractedArray.reduce((acc: string[], card: string) => {
      const pokemonName = card.split(" ").filter((ele) => ele.indexOf("/")===-1).join(" ");
      const setNumber: string = card.split("/")[1]?.trim(); // Ensure no spaces or undefined values
      const sets: Array<string> = pokemonSets[setNumber]; // Get corresponding sets
  
      if (sets) {
        acc.push(...sets.map((set: string) => `${pokemonName}:${set}`));
      }
  
      return acc;
    }, []);

    let pokemonCards:any= {};
    for (let i=0;i<properNames.length;i++){
      const c = properNames[i].split(":")[0];
      if (pokemonCards[c]){
        pokemonCards[c].push(properNames[i]);
      }else {
        pokemonCards[c]=[properNames[i]];
      }
    }

    return Object.values(pokemonCards);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Convert file to a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }
    setLoading(true);

    try {
      const imageBase64 = await convertFileToBase64(selectedFile);
      const card = await fetchOpenAIFetch(imageBase64);
      // hard code instead of relying on openai
      // const card = {choices: [
      //   {
      //     message :{
      //       content: "Umbreon 161/131 prismatic evolutions"
      //     }
      //   }
      // ]}
      // const result = await searchRecentlyBuyProducts(card.choices[0].message.content);

      //ebay buy works
      // const result = await searchRecentlySoldProducts(card.choices[0].message.content);
      const response = card.choices[0].message.content;
      console.log("response: " + response);
      const match = response.match(/\[([\s\S]*)\]/);
      const extractedArray = match ? JSON.parse(match[0]) : [];
      if (extractedArray.length === 0){
        setFailure(true);
      } else {
        setFailure(false);
      }
      console.log("extractedArray: "+ addSetName(extractedArray));
      setSearch(addSetName(extractedArray));
      setLoading(false);
    } catch (error) {
      console.error("Error processing image:", error);
      setLoading(false);
      setFailure(true);
    }
  };

  const displayResults = (value: string[]) => {
    if (value.length===0){
      return [];
    }
    const name = value[0].split(":");
    if (value.length===1){
      const card = value[0].replace(":", " ");
      return (
        <div className="link" key={value[0]+0}>
          <a href={`https://www.tcgplayer.com/search/all/product?q=${card}&ListingType=Sold`} target="_blank">
            {name[0]}
            <div>
              {name.map((e, i)=> i>=1?e+" ":null)}
            </div>
          </a>
        </div>)
      } else if (value.length > 1){
        return (
          <Dropdown>
            <Dropdown.Toggle variant="primary">
              {name[0]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {value.map((ele)=>{
                const card = ele.split(":");
                return (<Dropdown.Item key={ele} href={`https://www.tcgplayer.com/search/all/product?q=${card.join(" ")}&ListingType=Sold`} target="_blank">{card[1]}</Dropdown.Item>);
              })}
            </Dropdown.Menu>
          </Dropdown>
        );
      }
  }


  const containerCls = `link-container-${search.length >= 3 ? "3" : search.length >= 2 ? "2" : "1" }`;
  return (
    <div>
      <h1>Pokemon Card Scanner</h1>
      <div className="main-body">
        <div className="file-upload">
          <label className="file-label">
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
          </label>
        </div>

        <div>
          {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px', borderRadius: '8px' }} />}
        </div>

        <div>
          <button onClick={handleSubmit}>Send</button>
        </div>
        <div className="body">
          {loading && <BarLoader
              color="blue"
              loading={true}
              aria-label="Loading Spinner"
              width={300}
            />}

          <div className={containerCls}>
            {!loading && search && search.map((v: string[]) => displayResults(v))}
            {failure && <div>something went wrong please try again</div>}
          </div>


          {/* {response && response.sort((a: any, b: any) => a.price.value-b.price.value).map((ele: any, index: any) => {
            return (<div key={index}>
              <a target="_blank" href={ele.itemWebUrl}>
                {ele.title} : {ele.price.currency} {ele.price.value}
              </a>
            </div>)
          })} */}
        </div>
      </div>
      <footer>
        Happy Birthday Miles and Leon
      </footer>
    </div>
  );
};

export default App;