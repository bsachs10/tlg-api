function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('MyClass');
    });

}

enableDownloadLinks

window.onload = enableDownloadLinks;
enableDownloadLinks();