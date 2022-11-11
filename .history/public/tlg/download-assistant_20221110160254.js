function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        console.log('Enabled DL link for ', el, el.dataset['data-title']);
    });

}

enableDownloadLinks();

window.onload = enableDownloadLinks;
enableDownloadLinks();