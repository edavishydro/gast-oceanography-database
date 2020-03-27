const DataTable = data => {
  return (
    <div className="flex justify-center">
      <table className="table-fixed w-full">
        <thead className="text-left">
          <tr>
            <th className="w-4/12 px-4 pt-2">Year</th>
            <th className="w-2/12 px-4 pt-2">Author</th>
            <th className="w-2/12 px-4 pt-2">Title</th>
            <th className="w-2/12 px-4 pt-2">Tags</th>
            <th className="w-2/12 px-4 pt-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map(doc => (
            <tr key={doc.FID} className="border-t hover:bg-gray-200">
              <td className="px-4 py-2">{doc.item.Year}</td>
              <td className="px-4 py-2">{doc.item.Author}</td>
              <td className="px-4 py-2">{doc.item.Title}</td>
              <td className="px-4 py-2">{doc.item.contentTags}</td>
              <td>
                <button>Add to cart</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
