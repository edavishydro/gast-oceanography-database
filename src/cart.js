export let cartStore;
export let docsInCart;

export const initCartStore = () => {
  if (JSON.parse(window.localStorage.getItem("cart")) === null) {
    window.localStorage.setItem("cart", "[]");
  }
  cartStore = JSON.parse(window.localStorage.getItem("cart"));
  docsInCart = cartStore;
};

export const modifyCartStore = (cart) => {
  window.localStorage.setItem("cart", JSON.stringify(cartStore));
  cartStore = JSON.parse(window.localStorage.getItem("cart"));
};

export function addDoc(fid, source, cart) {
  source.forEach((doc) => {
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

export function removeDoc(fid, cart) {
  let docIndex;

  cart.forEach((doc) => {
    if (fid === doc.FID) {
      docIndex = cart.indexOf(doc);
    }
  });
  cart.splice(docIndex, 1);
  modifyCartStore(cart);
  makeCartTable();
}

export function makeCartTable() {
  if (!cartStore) {
    docsInCart = [];
  } else {
    docsInCart = cartStore;
  }
  if (!cartStore.length) {
    let html = "<p>Your shopping cart is empty.</p>";
    document.querySelector("div#cart").innerHTML = html;
  } else {
    let html = '<table class="table is-striped">';
    html += "<tr>";
    const headers = ["Year", "Author", "Title", ""];
    headers.forEach((header) => {
      return (html += `<th>${header}</th>`);
    });
    html += "</tr>";
    cartStore.forEach((doc) => {
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
}
