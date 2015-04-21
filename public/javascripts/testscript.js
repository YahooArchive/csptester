//
// Copyright (c) 2015, Yahoo Inc.
// Copyrights licensed under the New BSD License. See the
// accompanying LICENSE.txt file for terms.
//
//   Author Binu P. Ramakrishnan
//   Created 01/05/2015
//

function getCSPViolationReport() {
  var xmlhttp;
  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState  === 4) {

      if (xmlhttp.status === 200) {

        if (xmlhttp.responseText) {
          document.getElementById("cspreportdiv").innerHTML = xmlhttp.responseText;
          document.getElementById("noviolationmsg").style.display = 'none';
        } else {
          document.getElementById("noviolationmsg").innerHTML = "<center title=\"No violation reported; refreshing...\"> <progress value=\"" + times + "\" max=\"" + maxtimes  + "\"></progress> </center>";
          document.getElementById("noviolationmsg").style.display = 'block';
        }

        document.getElementById("loading").style.display = 'none';
      }

      if (times++ === maxtimes) {
        clearInterval(nIntervId);
        if (!xmlhttp.responseText) {
          document.getElementById("noviolationmsg").innerHTML = "<center> No violation reported </center>";
        }
      } 
    }
  };

  var testsrc =  "/report/" + document.getElementById("testid").textContent;   
  xmlhttp.open("GET", testsrc, true);
  xmlhttp.send();
}

var times = 0;
var maxtimes = 10;
var nIntervId = setInterval(getCSPViolationReport, 2000);

// jquery is used only for resize functionality
$(function() {
  $( "#topdiv" ).resizable({ axis: "y" });
  $( "#bottomdiv" ).resizable({ axis: "y" });
  $( "#noviolationmsg" ).hide();
});


