window.onresize = setHtmlFontSize
function setHtmlFontSize () {
    var htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
    var htmlDom = document.getElementsByTagName('html')[0];
    if(htmlWidth<1080){
        htmlDom.style.fontSize = htmlWidth *28 / 750 + 'px';
    }else {
        htmlDom.style.fontSize = '40px';
    }
};
setHtmlFontSize();