import Fuse from "fuse.js";
import initModal from "./modal";
import "./map";
import * as cart from "./cart";
import makeDataTable from "./dataTable";

("use strict");

/* READ IN LOCAL JSON AS ARRAY */
fetch("DocsJSON.json")
  .then((res) => res.json())
  .then((data) => {
    writeData(data); // writes JSON as JS object
    makeDataTable(data); // presents data in table
    fuseListener(); // listener for changes to search field
    makeSearch(); // initiates Fuse search
    additionListener(); // listener for doc adds
    removalListener(); // listener for doc removes
    initModal(); // initiates modal functions
    cart.makeCartTable(); // generates shopping cart table in modal
  });

let data = [];

const writeData = (source) => {
  data = source;
};

/* SHOPPING CART */
// If user has cart data in their localStorage, this becomes `docsInCart`

const additionListener = () => {
  const addition = document.getElementById("clicky");
  addition.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      const isButton = event.target.nodeName === "BUTTON";
      if (!isButton) {
        return;
      }
      let fid = event.target.id;
      cart.addDoc(fid, data, cart.docsInCart);
    },
    false
  );
};

const removalListener = () => {
  const removal = document.getElementById("cart");
  removal.addEventListener(
    "click",
    (event) => {
      event.stopPropagation();
      const isButton = event.target.nodeName === "BUTTON";
      if (!isButton) {
        return;
      }
      let fid = event.target.id;
      cart.removeDoc(fid, cart.docsInCart);
    },
    false
  );
};

/* FUSE SEARCH */
let fuse;

const makeSearch = () => {
  let options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["Title", "Author", "contentTags"],
  };
  fuse = new Fuse(data, options);
};

/* FUSE SEARCH RESULTS */
const fuseListener = () => {
  const fusefield = document.getElementById("fusefield");
  fusefield.addEventListener("keyup", (event) => {
    event.stopPropagation();
    fusesearch(fusefield);
  });
};

function fusesearch(fusefield) {
  let query = fusefield.value;
  let result;
  if (!query) {
    result = data;
  } else {
    result = fuse.search(query);
  }
  if (result.length == 0) {
    var html = "No search results found.";
  } else {
    var html = `<p>Your search returned ${result.length} results.</p><table class="table is-striped" id="addition">`;
    html += "<tr>";
    var flag = 0;
    var headers = ["Year", "Author", "Title", ""];
    headers.forEach((header) => {
      return (html += `<th>${header}</th>`);
    });
    html += "</tr>";
    result.forEach((doc) => {
      const tableRow = `<tr>
      <td>${doc.item.Year}</td>
      <td>${doc.item.Author}</td>
      <td>${doc.item.Title}</td>
      <td><button class="button is-link is-outlined is-small addCart" id="${doc.item.FID}">Add to cart</button></td>
      </tr>`;
      return (html += tableRow);
    });
    html += "</table>";
  }
  document.querySelector("div#clicky").innerHTML = html;
}

/* FORM SUBMISSION */

let fullRequest = {}; // This is the final form object

function wrapDocs() {
  let docs = [];
  for (let i = 0; i < cart.docsInCart.length; i++) {
    docs.push(cart.docsInCart[i]);
  }

  return docs;
}

function getInputs(form) {
  let obj = {};
  let elements = form.querySelectorAll("input, select, textarea");
  for (let i = 0; i < elements.length; ++i) {
    let element = elements[i];
    let name = element.name;
    let value = element.value;

    if (name) {
      obj[name] = value;
    }
  }
  return obj;
}

/* LISTENER FOR CLICKING SUBMIT BUTTON */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("requestForm");
  const output = document.getElementById("output");

  cart.initCartStore();

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach((el) => {
      el.addEventListener("click", () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }

  form.addEventListener(
    "submit",
    function (e) {
      e.preventDefault();
      let user = getInputs(this);
      let docs = wrapDocs();
      fullRequest["user"] = user;
      fullRequest["documents"] = docs;

      let tmp = JSON.stringify(fullRequest);
      let formData = new FormData();
      formData.append("request", tmp);

      fetch("./api/sg-trans.php", { method: "POST", body: formData })
        .then(function (response) {
          window.localStorage.removeItem("cart");
          return response.text();
        })
        .then(function (body) {
          console.log(body);
        })
        .catch(alert("Something went wrong..."));
    },
    false
  );
});

/////////////////////////////////////////////////////////////////////////////////////////

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    function setCoordinates() {
      var Long = document.getElementById("Long").value;
      var Lat = document.getElementById("Lat").value;

      var radius = 20;

      locationRange(Long, Lat);
      function locationRange(Long, Lat) {
        var test = Long - Lat;

        console.log(test);

        document.getElementById("coordinate").innerHTML = test;
      }
    }
  }
};
