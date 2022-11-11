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
</div>`
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
