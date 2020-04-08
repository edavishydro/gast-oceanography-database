const initModal = () => {
  const modal = document.getElementById("myModal");
  const btn = document.getElementById("myBtn");
  const xClose = document.querySelector("header > button");
  const cancelClose = document.querySelector("#cancel");

  btn.onclick = () => (modal.style.display = "block");
  xClose.onclick = () => (modal.style.display = "none");
  cancelClose.onclick = () => (modal.style.display = "none");
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

export default initModal;
