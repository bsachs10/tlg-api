function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        el.addEventListener('click', function(event) {
            console.log(el.dataset)
            event.preventDefault();
            openModal(el.dataset);
        })
        console.log(`Enabled DL link for "${el.dataset['title']}"`);
    });

}

function openModal({title, filename}) {

    if (!document.getElementById('dl-modal')) {

        const innerHTML = `
    <div class="dl-modal-bg dl-modal-exit"></div>
    <div class="dl-modal-container">
        <h1>Get a download link to your inbox</h1>
        <h2>Pure Vanilla JavaScript</h2>
        <button class="dl-modal-close dl-modal-exit">&times;</button>
    </div>
    <style>
        .dl-modal {
            z-index: 99999;
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
            background: rgba(0,0,0, .6);
            width: 100%;
            height: 100%;
        }
        .dl-modal-container {
            background: #fff;
            position: relative;
            padding: 30px;
        }
        .dl-modal-close {
            position: absolute;
            right: 0.8em;
            top: 0.5em;
            outline: none;
            appearance: none;
            color: black;
            background: none;
            border: 0px;
            font-size: 1.5em;
            cursor: pointer;
        }
        </style>

    `;

        const modal = document.createElement('div');
        modal.setAttribute('id', 'dl-modal');
        modal.setAttribute('class', 'dl-modal');
        modal.innerHTML = innerHTML;
        document.body.appendChild(modal);

        const exits = modal.querySelectorAll(".dl-modal-exit");
        exits.forEach(function (exit) {
            console.log('exit', exit)
            exit.addEventListener("click", function (event) {
                console.log('exiting!', exit)
                event.preventDefault();
                modal.classList.remove("open");
            });
        });

    }

    document.getElementById('dl-modal').classList.add("open");
    
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
