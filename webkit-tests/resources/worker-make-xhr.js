try {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", "/resources/get.txt", true); 
    postMessage("xhr allowed");
} catch(e) {
    postMessage("xhr blocked");
}

