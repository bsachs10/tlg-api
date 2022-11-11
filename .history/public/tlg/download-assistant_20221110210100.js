function enableDownloadLinks() {
    Array.from(document.querySelectorAll('.downloader-link:not(.downloader-link-enabled)')).map( el => {
        el.classList.add('downloader-link-enabled');
        el.addEventListener('click', function(event) {
            console.log(el.dataset)
            event.preventDefault();
            openModal(el.dataset);
        })
        console.log(`Enabled DL link for "${el.dataset['title']}"`);
        handleEmail({ title: 'My File', filename: 'my file.pdf', email: 'benjaminsachs@gmail.com' });
    });

}


async function handleEmail({title, filename, email}) {
   
    const response = fetch('/.netlify/functions/ping', {
        method: 'POST',
        body: JSON.stringify({ title, filename, email })
    })
        .then(response => {
            console.log('response', response);
            document.getElementById('dl-form').style.display = 'none';
            document.getElementById('dl-success').style.display = 'block';
            document.getElementById('dl-error').style.display = 'block';   
            console.log('response.json()', response.json());
        });
}

 

function openModal({title, filename}) {

    if (document.getElementById('dl-modal')) {
        document.getElementById('dl-modal').remove();
    }

    const innerHTML = `
    <div class="dl-modal-bg dl-modal-exit"></div>
    <div class="dl-modal-container">
        <button class="dl-modal-close dl-modal-exit">&times;</button>
        
        <div id="dl-success" style="display: none">
            <h2 style="text-align: center">Check your inbox!</h2>
            <div class=sqs-block-html">And your promotions folder, your spam folder, and so on, and so on.</div>
        </div>
        <div id="dl-error" style="display: none">
            <h2 style="text-align: center">Ruh roh!</h2>
            <div class="sqs-block-html">An error occurred. If you don't receive the email, <a href="https://www.thelandinggroup.com/contact">contact us for help</a>.</div>
        </div>
        
        <div id="dl-form">
            <h2 style="text-align: center">Download</h2>
            <div class="sqsrte-large"><span id="dl-modal-filename">${title}</span></div>
            
            <div class="field-list clear sqs-block-newsletter">
                <div class="dl-email-container form-item field email required">
                    <input id="dl-email" class="dl-email" name="email" type="email" autocomplete="email" spellcheck="false" aria-required="true" placeholder="Email Address">
                </div>
                <div data-animation-role="button" class="form-button-wrapper form-button-wrapper--align-left">
                    <input id="dl-submit" class="dl-submit btn btn--border theme-btn--primary-inverse sqs-button-element--primary" value="Send to my inbox" type="submit">
                </div>
            </div>
        </div>

    </div>
    <style>
        .dl-email-container {
            padding: 0.5rem 0.25rem 0.5rem 0;
            margin: 1em 0;
        }
        input.dl-email {
            border: 1px solid rgba(0,0,0,.12);
            width: calc(100% - 2em);
            padding: 1em;
            background: #fff;
            font-family: inherit;
            font-size: 100%;
            margin: 0;
            line-height: normal;
        }
        input.dl-email.invalid {
            border: 1px solid red;
        }
        input.dl-submit {
            width: 100%;
        }
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

    document.getElementById("dl-submit").addEventListener('click', function(event) {
        event.preventDefault();
        const email = document.getElementById('dl-email').value;
        if (!validateEmail(email)) {
            document.getElementById('dl-email').classList.add('invalid');
            document.getElementById('dl-email').addEventListener('focus', function(event) {
                document.getElementById('dl-email').classList.remove('invalid');
            }, { once: true });
        } else {
            handleEmail({ title, filename, email });
        }
        console.log(document.getElementById('dl-email').value)
    });


    document.getElementById('dl-modal').classList.add("open");

    
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

enableDownloadLinks();
window.onload = enableDownloadLinks;

