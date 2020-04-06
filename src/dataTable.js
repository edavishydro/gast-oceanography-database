/* LOCAL JSON TABLE */
const makeDataTable = (data) => {
  let html = '<table class="table is-striped" id="addition">';
  html += "<tr>";
  const headers = ["Year", "Author", "Title", ""];
  headers.forEach((header) => {
    return (html += `<th>${header}</th>`);
  });
  html += "</tr>";
  data.forEach((doc) => {
    const tableRow = `<tr class="addCart">
        <td>${doc.Year}</td>
        <td>${doc.Author}</td>
        <td>${doc.Title}</td>
        <td><button class="button is-link is-outlined is-small addCart" id="${doc.FID}">Add to cart</button></td>
        </tr>`;
    return (html += tableRow);
  });
  html += "</table>";
  document.querySelector("div#clicky").innerHTML = html;
};

export default makeDataTable;
