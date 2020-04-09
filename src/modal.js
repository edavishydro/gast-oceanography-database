export const initModal = () => {
  const modal = document.getElementById("cartModal");
  const btn = document.getElementById("myBtn");
  const xClose = document.querySelectorAll(".delete");
  const cancelClose = document.querySelector("#cancel");
  //showSuccess();

  btn.onclick = () => {
    modal.style.display = "block";
  };

  xClose.forEach((el) =>
    el.addEventListener("click", (event) => {
      modal.style.display = "none";
    })
  );

  cancelClose.onclick = () => (modal.style.display = "none");

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

export const showSuccess = () => {
  const modal = document.getElementById("cartModal");
  const modalContainer = document.querySelector(".modal-card");
  const success = document.querySelector(".container .success-message");
  modalContainer.innerHTML = success.outerHTML;
  const _success = document.querySelector(".modal-card .success-message");
  _success.style.display = "block";

  const del = document.querySelectorAll(".message-header .delete");
  del.forEach((el) =>
    el.addEventListener("click", (e) => (modal.style.display = "none"))
  );
};
