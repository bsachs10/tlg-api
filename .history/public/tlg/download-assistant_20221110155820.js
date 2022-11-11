function enableDownloadLinks() {
    elements = Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)'));

}

enableDownloadLinks

window.onload = enableDownloadLinks;
enableDownloadLinks();