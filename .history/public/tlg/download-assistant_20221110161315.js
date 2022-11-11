function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        console.log('Enabled DL link for ', el.dataset['title']);
    });

}

function createModalIfNotExists() {
    const html = `
    
<div class="dl-modal" id="dl-modal">
  <div class="dl-modal-bg dl-modal-exit"></div>
  <div class="dl-modal-container">
    <h1>Amazing Modal</h1>
    <h2>Pure Vanilla JavaScript</h2>
    <button class="dl-modal-close modal-exit">X</button>
  </div>
</div>
<style>
const modals = document.querySelectorAll("[data-modal]");

modals.forEach(function (trigger) {
  trigger.addEventListener("click", function (event) {
    event.preventDefault();
    const modal = document.getElementById(trigger.dataset.modal);
    modal.classList.add("open");
    const exits = modal.querySelectorAll(".modal-exit");
    exits.forEach(function (exit) {
      exit.addEventListener("click", function (event) {
        event.preventDefault();
        modal.classList.remove("open");
      });
    });
  });
});

`;
return html;
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
