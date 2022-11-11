function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        console.log('Enabled DL link for ', el.dataset['title']);
    });

}

function createModalIfNotExists() {
    const html = `
    
<div class="dl-modal" id="modal-one">
  <div class="modal-bg modal-exit"></div>
  <div class="modal-container">
    <h1>Amazing Modal</h1>
    <h2>Pure Vanilla JavaScript</h2>
    <button class="modal-close modal-exit">X</button>
  </div>
</div>`
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
