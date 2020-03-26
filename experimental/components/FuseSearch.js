import Fuse from "fuse.js";
import DataTable from "./DataTable";

const FuseSearch = () => {
  const DocData = require("../data/document_Info.json");
  let options = {
    shouldSort: true,
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["Title", "Author"]
  };
  let fuse = new Fuse(DocData, options);
  let result = fuse.search("jones");
  return (
    <div>
      <div>{DataTable(result)}</div>
    </div>
  );
};

export default FuseSearch;
