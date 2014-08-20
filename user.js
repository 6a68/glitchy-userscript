// ==UserScript==
// @name           GlitchMonkey
// @namespace      http://d.hatena.ne.jp/youpy/
// @include        *
// @grant GM_xmlhttpRequest
// ==/UserScript==

window.addEventListener('load', function() {
  alert('load event fired');
  // put a button in the corner so we can refry the beans
  var container = document.createElement('div')
  container.innerHTML = '<div id="glitchee" style="position: fixed; top: 0px; right: 0px; '
    + 'background: none repeat scroll 0% 0% green; width: 120px; font-size: 20px">G L I T C H</div>';
  document.body.appendChild('container');
  // wait a turn then wire up the button
  setTimeout(function() {
    var glitchBtn = document.getElementById('glitchee');
    glitchBtn.on('click', glitchWat);
  })
  // call the initial call
  glitchWat();
});

function glitchWat() {

  var Corruptions = {
      'image/jpeg': function() {
        console.log('attempting to glitch a jpeg');
        return this.replace(/0/g, Math.floor(Math.random() * 10));
      },
      'image/gif': function() {
        console.log('attempting to glitch a gif');
        return this.replace(/x/ig, Math.floor(Math.random() * 10));
      },
      'image/png': function() {
        console.log('attempting to glitch a png');
        return this.replace(/x/ig, Math.floor(Math.random() * 10));
      }
  };

  Array.filter(document.images, is_glitchable).forEach(glitch);

  document.addEventListener("DOMNodeInserted", function(e){
    if (!e.target.tagName) return;
    console.log('DOMNodeInserted listener fired');
    Array.filter(e.target.getElementsByTagName('img'), is_glitchable).forEach(function(el){
      // Greasemonkey access violation: unsafeWindow cannot call GM_xmlhttpRequest.
      setTimeout(function(){ glitch(el); },0);
    });
  }, false);

  function glitch(element) {
    console.log('called glitch');
    GM_xmlhttpRequest({
      method: "GET",
      overrideMimeType: "text/plain; charset=x-user-defined",
      url: element.src,
      onload: function (res) {
      console.log('glitch xhr.onload fired');
      if (debug) console.log(res);
        var type = contentType(res.responseHeaders);
        var oldsrc = element.src;

        if(typeof Corruptions[type] != 'undefined') {
          element.addEventListener('error', function() {
            this.src = oldsrc;
          }, false);

          element.src =
            [
             'data:',
             type,
             ';base64,',
             base64encode(Corruptions[type].apply(res.responseText)),
             ].join('');
        }
      }
    });
  }

  function contentType(headers) {
    console.log('contentType called');
    return headers.match(/Content-Type: (.*)/i)[1];
  }

  function base64encode(data) {
    console.log('base64encode called');
    return btoa(data.replace(/[\u0100-\uffff]/g, function(c) {
      return String.fromCharCode(c.charCodeAt(0) & 0xff);
    }));
  }

  function is_glitchable(img) {
    return img.src.match(/\.(gif|jpe?g)/i);
  }

};
