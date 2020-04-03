import Fuse from "fuse.js";
import initModal from "./modal";
import "./map";

("use strict");

/* READ IN LOCAL JSON AS ARRAY */
fetch("DocsJSON.json")
  .then(res => res.json())
  .then(data => {
    writeData(data); // writes JSON as JS object
    makeDataTable(data); // presents data in table
    fuseListener(); // listener for changes to search field
    makeSearch(); // initiates Fuse search
    additionListener(); // listener for doc adds
    removalListener(); // listener for doc removes
    initModal(); // initiates modal functions
    makeCartTable(); // generates shopping cart table in modal
  });

let data;

const writeData = source => {
  data = source;
};

/* LOCAL JSON TABLE */
const makeDataTable = data => {
  let html = '<table class="table is-striped" id="addition">';
  html += "<tr>";
  const headers = ["Year", "Author", "Title", ""];
  headers.forEach(header => {
    return (html += `<th>${header}</th>`);
  });
  html += "</tr>";
  data.forEach(doc => {
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

/* SHOPPING CART */
// If user has cart data in their localStorage, this becomes `docsInCart`
let cartStore;
let docsInCart;

const initCartStore = () => {
  if (JSON.parse(window.localStorage.getItem("cart")) === null) {
    window.localStorage.setItem("cart", "[]");
  }
  cartStore = JSON.parse(window.localStorage.getItem("cart"));
  docsInCart = cartStore;
};

const modifyCartStore = cart => {
  window.localStorage.setItem("cart", JSON.stringify(cartStore));
  cartStore = JSON.parse(window.localStorage.getItem("cart"));
};

function addDoc(fid, source, cart) {
  source.forEach(doc => {
    if (fid === doc.FID) {
      if (cart && cart.length) {
        let found = false;

        for (let i = 0; i < cart.length; i++) {
          if (cart[i].FID === doc.FID) {
            found = true;
            break;
          }
        }

        if (found === false) {
          cart.push(doc);
        }
      } else {
        cart.push(doc);
      }
    }
  });
  modifyCartStore(cart);
  makeCartTable();
}

function removeDoc(fid, cart) {
  let docIndex;

  cart.forEach(doc => {
    if (fid === doc.FID) {
      docIndex = cart.indexOf(doc);
    }
  });
  cart.splice(docIndex, 1);
  modifyCartStore(cart);
  makeCartTable();
}

const additionListener = () => {
  const addition = document.getElementById("clicky");
  addition.addEventListener(
    "click",
    event => {
      event.preventDefault();
      const isButton = event.target.nodeName === "BUTTON";
      if (!isButton) {
        return;
      }
      let fid = event.target.id;
      addDoc(fid, data, docsInCart);
    },
    false
  );
};

const removalListener = () => {
  const removal = document.getElementById("cart");
  removal.addEventListener(
    "click",
    event => {
      event.stopPropagation();
      const isButton = event.target.nodeName === "BUTTON";
      if (!isButton) {
        return;
      }
      let fid = event.target.id;
      removeDoc(fid, docsInCart);
    },
    false
  );
};

function makeCartTable() {
  if (!cartStore) {
    docsInCart = [];
  } else {
    docsInCart = cartStore;
  }

  let html = '<table class="table is-striped">';
  html += "<tr>";
  const headers = ["Year", "Author", "Title", ""];
  headers.forEach(header => {
    return (html += `<th>${header}</th>`);
  });
  html += "</tr>";
  cartStore.forEach(doc => {
    const tableRow = `<tr>
      <td>${doc.Year}</td>
      <td>${doc.Author}</td>
      <td>${doc.Title}</td>
      <td><button class="button is-danger is-outlined is-small" id="${doc.FID}">Remove from cart</button></td>
      </tr>`;
    return (html += tableRow);
  });
  html += "</table>";
  document.querySelector("div#cart").innerHTML = html;
}

/* FUSE SEARCH */
let fuse;

const makeSearch = () => {
  fuse = new Fuse(data, options);
};

let options = {
  shouldSort: true,
  threshold: 0.5,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["Title", "Author", "contentTags"]
};

/* FUSE SEARCH RESULTS */
const fuseListener = () => {
  const fusefield = document.getElementById("fusefield");
  fusefield.addEventListener("keyup", event => {
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
    headers.forEach(header => {
      return (html += `<th>${header}</th>`);
    });
    html += "</tr>";
    result.forEach(doc => {
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
  for (let i = 0; i < docsInCart.length; i++) {
    docs.push(docsInCart[i]);
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

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("requestForm");
  const output = document.getElementById("output");

  initCartStore();

  form.addEventListener(
    "submit",
    function(e) {
      e.preventDefault();
      let user = getInputs(this);
      let docs = wrapDocs();
      fullRequest["user"] = user;
      fullRequest["documents"] = docs;
      output.innerHTML = JSON.stringify(fullRequest);

      let tmp = JSON.stringify(fullRequest);
      let formData = new FormData();
      formData.append("request", tmp);

      fetch("./api/sg-trans.php", { method: "POST", body: formData })
        .then(function(response) {
          window.localStorage.removeItem("cart");
          return response.text();
        })
        .then(function(body) {
          console.log(body);
        });
    },
    false
  );
});

/////////////////////////////////////////////////////////////////////////////////////////

document.onreadystatechange = function() {
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