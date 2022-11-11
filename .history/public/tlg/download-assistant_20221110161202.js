function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        console.log('Enabled DL link for ', el.dataset['title']);
    });

}

function 

enableDownloadLinks();
window.onload = enableDownloadLinks;
