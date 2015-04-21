//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
//
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015
//
// test_window.ejs

document.getElementById("report-link").addEventListener("click", reportRedirect);

function reportRedirect(e) {
  e.preventDefault();
  var test_uri =  document.getElementById("test-uri").textContent;
  var report_uri =  document.getElementById("report-uri").textContent;

  var myPopup = window.open(report_uri, "_blank");
  window.location.replace(test_uri);
  return false;
}

