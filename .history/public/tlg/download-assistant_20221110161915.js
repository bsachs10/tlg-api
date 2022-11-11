function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        console.log('Enabled DL link for ', el.dataset['title']);
    });

}

function createModalIfNotExists() {

   

    const innerHTML = `
  <div class="dl-modal-bg dl-modal-exit"></div>
  <div class="dl-modal-container">
    <h1>Amazing Modal</h1>
    <h2>Pure Vanilla JavaScript</h2>
    <button class="dl-modal-close modal-exit">X</button>
  </div>
  <style>
    .dl-modal {
    position: fixed;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    }
    .dl-modal.open {
    visibility: visible;
    opacity: 1;
    transition-delay: 0s;
    }
    .dl-modal-bg {
    position: absolute;
    background: teal;
    width: 100%;
    height: 100%;
    }
    .dl-modal-container {
    border-radius: 10px;
    background: #fff;
    position: relative;
    padding: 30px;
    }
    .dl-modal-close {
    position: absolute;
    right: 15px;
    top: 15px;
    outline: none;
    appearance: none;
    color: red;
    background: none;
    border: 0px;
    font-weight: bold;
    cursor: pointer;
    }
    </style>

`;

    const modal = document.createElement('div');
    modal.setAttribute('id', 'dl-modal');
    modal.setAttribute('class', 'dl-modal');
    modal.innerHTML = innerHTML;
    document.body.appendChild(modal);

    modal.classList.add("open");
    const exits = modal.querySelectorAll(".dl-modal-exit");
    exits.forEach(function (exit) {
        exit.addEventListener("click", function (event) {
            event.preventDefault();
            modal.classList.remove("open");
        });
    });

    const modals = document.querySelectorAll("[data-modal]");

    modals.forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            const modal = document.getElementById(trigger.dataset.modal);
            modal.classList.add("open");
            const exits = modal.querySelectorAll(".dl-modal-exit");
            exits.forEach(function (exit) {
                exit.addEventListener("click", function (event) {
                    event.preventDefault();
                    modal.classList.remove("open");
                });
            });
        });
    });


    document.
return html;
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
