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
        <h2>Download</h2>
        <h2><span id="dl-modal-filename">Your file awaits</span></div>
        <div class="field-list clear">

        

          

          

            

            

            

            

            

            

            

            

            

            

            

            

            

            
              
            

            

            

            

            

            

        

          

          

            

            

            

            

            
              <div id="" class="form-item field email required">
                
            <label class="title" for="yyy">
              Email
              
                
              
            </label>
          
                
                <input class="field-element" id="yyy" name="email" type="email" autocomplete="email" spellcheck="false" aria-required="true">
              </div>
            

            

            

            

            

            

            

            

            

            

            

            

            

            

            

        

          

          

            

            

            
              <div id="text-yui_3_17_2_1_1558357554822_56100" class="form-item field text required">
                
            <label class="title" for="text-yui_3_17_2_1_1558357554822_56100-field">
              Subject
              
                <span class="required" aria-hidden="true">*</span>
              
            </label>
          
                
                <input class="field-element text" type="text" id="text-yui_3_17_2_1_1558357554822_56100-field" aria-required="true">
              </div>
        
              <div id="textarea-yui_3_17_2_1_1554218195091_8246" class="form-item field textarea required">
                
            <label class="title" for="textarea-yui_3_17_2_1_1554218195091_8246-field">
              Your Question
              
                <span class="required" aria-hidden="true">*</span>
              
            </label>
          
                
                <textarea class="field-element " id="textarea-yui_3_17_2_1_1554218195091_8246-field" aria-required="true"></textarea>
              </div>
            

        </div>

        <input type=text name=email>
        <button>Deliver to my inbox</button>
        <button class="dl-modal-close dl-modal-exit">&times;</button>

        <div class="newsletter-form-body">
      <div class="newsletter-form-fields-wrapper form-fields" style="vertical-align: middle;">
        
        
          
            <div id="email-yui_3_17_2_1_1666385866350_3413" class="newsletter-form-field-wrapper form-item field email required" style="vertical-align: bottom;">
              <label class="newsletter-form-field-label title" for="email-yui_3_17_2_1_1666385866350_3413-field">Email Address</label>
              <input id="email-yui_3_17_2_1_1666385866350_3413-field" class="newsletter-form-field-element field-element" name="email" x-autocompletetype="email" autocomplete="email" type="email" spellcheck="false" placeholder="Email Address">
            </div>
          
        
          
        
      </div>
      <div data-animation-role="button" class="newsletter-form-button-wrapper submit-wrapper preFade fadeIn" style="vertical-align: middle; transition-timing-function: ease; transition-duration: 0.45s; transition-delay: 0.275s;">
        <button class="
            newsletter-form-button
            sqs-system-button
            sqs-editable-button-layout
            sqs-editable-button-style
            sqs-editable-button-shape
            sqs-button-element--primary
          " type="submit" value="Join the List for a Sneak Peek">
          <span class="newsletter-form-spinner sqs-spin light large"></span>
          <span class="newsletter-form-button-label">Join the List for a Sneak Peek</span>
          <span class="newsletter-form-button-icon"></span>
        </button>
      </div>
      
        <div class="model"></div>
        
      
    </div>


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
    document.getElementById('dl-modal-filename').innerHTML = filename;
    
}

enableDownloadLinks();
window.onload = enableDownloadLinks;
