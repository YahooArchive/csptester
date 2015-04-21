//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
//
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015
//

window.addEventListener('load', converToLocaleDate, false);
function converToLocaleDate(){
  if (document.getElementById("expirytime") != undefined) {
    var ts = document.getElementById("expirytime").textContent;
    d = new Date(parseInt(ts));
    document.getElementById("expirytime").textContent = d.toLocaleString();
  }

  if (document.getElementById("share-url") != undefined) {
    // i dont like this, but this should work for now
    document.getElementById("share-url").value = (document.URL).split("&")[0];
    document.getElementById("share-url").select();
  }

}

if (document.getElementById("share-link") != undefined) {
  document.getElementById("share-link").addEventListener("click", shareLink);
}

function shareLink(e) {
  e.preventDefault();
  var share_uri =  document.getElementById("share-uri").textContent;
  document.location.assign(share_uri);
}



