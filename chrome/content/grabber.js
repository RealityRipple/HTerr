var hterr_grabber = {
 pageData: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" lang="{%HTML_LANG%}">\n <head>\n  <title>{%HTML_TITLE%}</title>\n  <link rel="stylesheet" href="chrome://global/skin/netError.css" type="text/css" media="all" />\n  <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHRleHQgeD0iMCIgeT0iMTQiPuKaoO+4jzwvdGV4dD48L3N2Zz4=" type="image/svg+xml" />\n  <script>\n   function goBackThis(buttonEl)\n   {\n    try\n    {\n     history.go(-1);\n    }\n    catch(e) {}\n    buttonEl.disabled = true;\n   }\n   function retryThis(buttonEl)\n   {\n    try \n    {\n     location.reload();\n    }\n    catch(e) {}\n    buttonEl.disabled = true;\n   }\n  </script>\n </head>\n <body dir="{%LOCALE_DIR%}">\n  <div id="errorPageContainer">\n   <div id="errorTitle"><h1 id="errorTitleText">{%HTTP_ERROR_TITLE%}</h1></div>\n   <div id="errorLongContent">\n    <div id="errorShortDesc"><p id="errorShortDescText">{%HTTP_ERROR_DESCRIPTION%}</p></div>\n    <div id="errorLongDesc">{%HTTP_ERROR_DETAILS%}</div>\n   </div>\n   <button id="errorTryAgain" autocomplete="off" onclick="retryThis(this);">{%RETRY_LABEL%}</button>\n   <button id="errorGoBack" autocomplete="off" onclick="goBackThis(this);">{%BACK_LABEL%}</button>\n   <script>\n    // Only do autofocus if we\'re the toplevel frame; otherwise we\n    // don\'t want to call attention to ourselves!  The key part is\n    // that autofocus happens on insertion into the tree, so we\n    // can remove the button, add @autofocus, and reinsert the\n    // button.\n    if (2 > history.length)\n    {\n     var button = document.getElementById("errorGoBack");\n     var parent = button.parentNode;\n     parent.removeChild(button);\n    }\n    var noRetry = {%HTTP_ERROR_RETRY_BLOCKED%};\n    if (noRetry)\n    {\n     var button = document.getElementById("errorTryAgain");\n     var parent = button.parentNode;\n     parent.removeChild(button);\n     var button2 = document.getElementById("errorGoBack");\n     if (button2 !== null)\n      button2.setAttribute("id", "errorTryAgain");\n    }\n    if (window.top == window)\n    {\n     var button = document.getElementById("errorTryAgain");\n     if (button !== null)\n     {\n      var nextSibling = button.nextSibling;\n      var parent = button.parentNode;\n      parent.removeChild(button);\n      button.setAttribute("autofocus", "true");\n      parent.insertBefore(button, nextSibling);\n     }\n    }\n   </script>\n  </div>\n </body>\n</html>',
 plainData: '{%HTML_TITLE%}\n\n{%HTTP_ERROR_TITLE%}\n{%HTTP_ERROR_DESCRIPTION%}\n\n{%HTTP_ERROR_DETAILS%}',
 hideReload: [400, 403, 410, 414, 415, 418, 421, 422, 423, 426, 428, 431, 444, 449, 450, 451, 494, 497, 499, 501, 505, 506, 507, 508, 509, 510, 523, 526, 530],
 nullData: {},
 LoadListener: function()
 {
  window.removeEventListener('load', hterr_grabber.LoadListener, false);
  let observerService = Components.classes['@mozilla.org/observer-service;1'].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(hterr_grabber.ResponseObserver, 'http-on-examine-response', false);
 },
 ErrorBuilder: function(code, plainText, extraParam)
 {
  let data = hterr_grabber.pageData;
  if (plainText)
   data = hterr_grabber.plainData;
  let localeDir = 'ltr';
  let htmlLang = 'en';
  
  let htmlTitle = 'Problem loading page';
  let cmdBack = 'Go Back';
  let cmdRetry = 'Try Again';
  
  let errTitle = 'HTTP Error ' + code;
  let errDesc = 'There was an error connecting to this website.';
  let errDetail = '<p>The error code (' + code + ') is not standard. Please try again.</p>';
  let errNoRetry = 'false';
  let gBundle = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
  let locale = gBundle.createBundle('chrome://hterr/locale/hterr.properties');
  try {localeDir = locale.GetStringFromName('locale.dir');}
  catch(e) {localeDir = 'ltr';}
  try {htmlLang = locale.GetStringFromName('html.lang');}
  catch(e) {htmlLang = 'en';}
  
  try {htmlTitle = locale.GetStringFromName('html.title');}
  catch(e) {htmlTitle = 'Problem loading page';}
  try {cmdBack = locale.GetStringFromName('back.label');}
  catch(e) {cmdBack = 'Go Back';}
  try {cmdRetry = locale.GetStringFromName('retry.label');}
  catch(e) {cmdRetry = 'Try Again';}
  
  try {errTitle = locale.GetStringFromName('error.' + code + '.title');}
  catch(e) {errTitle = 'HTTP Error ' + code;}
  try {errDesc = locale.GetStringFromName('error.' + code + '.desc');}
  catch(e) {errDesc = 'There was an error connecting to this website.';}
  try {errDetail = locale.GetStringFromName('error.' + code + '.longDesc');}
  catch(e) {errDetail = '<p>The error code (' + code + ') is not standard. Please try again.</p>';}
  if (extraParam !== null)
  {
   switch (code)
   {
    case 429:
    case 501:
    case 503:
     if (!isNaN(extraParam))
     {
      let newDate = new Date((new Date()).getTime() + (extraParam * 1000));
      extraParam = newDate.toGMTString();
     }
     break;
   }
   let sAdditon = '<p>Additional details from server: <em>' + extraParam + '</em></p>';
   try {sAddition = locale.formatStringFromName('error.' + code + '.additional', [extraParam], 1)}
   catch(e) {sAddition = '<p>Additional details from server: <em>' + extraParam + '</em></p>';}
   errDetail += sAddition;
  }
  if (hterr_grabber.hideReload.includes(code))
   errNoRetry = 'true';
  data = data.replace(/{%LOCALE_DIR%}/g, localeDir);
  data = data.replace(/{%HTML_LANG%}/g, htmlLang);
  
  data = data.replace(/{%HTML_TITLE%}/g, htmlTitle);
  data = data.replace(/{%BACK_LABEL%}/g, cmdBack);
  data = data.replace(/{%RETRY_LABEL%}/g, cmdRetry);
  
  data = data.replace(/{%HTTP_ERROR_TITLE%}/g, errTitle);
  data = data.replace(/{%HTTP_ERROR_DESCRIPTION%}/g, errDesc);
  data = data.replace(/{%HTTP_ERROR_DETAILS%}/g, errDetail);
  data = data.replace(/{%HTTP_ERROR_RETRY_BLOCKED%}/g, errNoRetry);
  if (!plainText)
   return data;
  data = data.replace(/<p>/gi, '');
  data = data.replace(/<\/p><ul>/gi, '');
  data = data.replace(/<\/p>/gi, '\n\n');
  data = data.replace(/<\/?ul>/gi, '');
  data = data.replace(/<\/li>/gi, '');
  data = data.replace(/<li>/gi, '\n - ');
  data = data.replace(/<[^>]+>/gi, '');
  return String.fromCodePoint(0xEF, 0xBB, 0xBF) + data;
 },
 ResponseObserver:
 {
  observe: function(aSubject, aTopic, aData)
  {
   if (aTopic !== 'http-on-examine-response')
    return;
   if (aSubject === null)
    return;
   let newListener = new hterr_grabber.TracingListener();
   aSubject.QueryInterface(Components.interfaces.nsITraceableChannel);
   newListener.originalListener = aSubject.setNewListener(newListener);
  },
  QueryInterface : function (aIID)
  {
   if (aIID.equals(Components.interfaces.nsIObserver) || aIID.equals(Components.interfaces.nsISupports))
    return this;
   throw Components.results.NS_NOINTERFACE;
  }
 },
 TracingListener: function()
 {
  this.originalListener = null;
 }
};
hterr_grabber.TracingListener.prototype = {
 onDataAvailable: function(request, context, inputStream, offset, count)
 {
  if (count < 1)
   return;
  request.QueryInterface(Components.interfaces.nsIHttpChannel);
  hterr_grabber.nullData[request.channelId] = false;
  try
  {
   this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
  }
  catch (e) {}
 },
 onStartRequest: function(request, context)
 {
  request.QueryInterface(Components.interfaces.nsIHttpChannel);
  hterr_grabber.nullData[request.channelId] = true;
  try
  {
   this.originalListener.onStartRequest(request, context);
  }
  catch (e) {}
 },
 onStopRequest: function(request, context, statusCode)
 {
  try
  {
   request.QueryInterface(Components.interfaces.nsIHttpChannel);
   if (hterr_grabber.nullData[request.channelId] === true && request.hasOwnProperty('responseStatus') && request.hasOwnProperty('originalURI'))
   {
    delete hterr_grabber.nullData[request.channelId];
    let code = request.responseStatus;
    if (code >= 400 && code < 600)
    {
     let mime = request.contentType;
     let cType = mime.substring(0, mime.indexOf('/'));
     let cEnc = mime.substring(mime.indexOf('/') + 1);
     if (cType === 'text' || (cType === 'application' && (cEnc.includes('html') || cEnc.includes('xml'))) || mime === 'image/svg+xml')
     {
      let mainDoc = false;
      for (let i = 0; i < gBrowser.browsers.length; i++)
      {
       if (gBrowser.browsers[i].contentDocument.readyState === 'complete')
        continue;
       if (gBrowser.browsers[i].contentDocument.readyState === 'uninitialized')
        continue;
       if (gBrowser.browsers[i].contentDocument.readyState !== 'loading' && gBrowser.browsers[i].contentDocument.readyState !== 'interactive')
        console.log('Unknown readyState:', gBrowser.browsers[i].contentDocument.readyState, '(Risking it as something to compare)');
       if (gBrowser.browsers[i].contentDocument.location.href === request.originalURI.spec)
       {
        mainDoc = true;
        break;
       }
      }
      if (mainDoc)
      {
       let extraParam = null;
       try
       {
        switch (code)
        {
         case 401:
          extraParam = request.getResponseHeader('WWW-Authenticate');
          break;
         case 407:
          extraParam = request.getResponseHeader('Proxy-Authenticate');
          break;
         case 426:
          extraParam = request.getResponseHeader('Upgrade');
          break;
         case 429:
         case 501:
         case 503:
          extraParam = request.getResponseHeader('Retry-After');
          break;
        }
        if (extraParam !== null)
         extraParam = extraParam.replace(/<[^>]+>/gi, '');
       }
       catch (ex) {extraParam = null;}
       let plainText = false;
       if (mime === 'text/plain')
        plainText = true;
       let txt = hterr_grabber.ErrorBuilder(code, plainText, extraParam);
       let tCount = txt.length;
       let iStor = Components.classes['@mozilla.org/io/string-input-stream;1'].getService(Components.interfaces.nsIStringInputStream);
       iStor.setData(txt, tCount);
       this.originalListener.onDataAvailable(request, context, iStor, 0, tCount);
      }
     }
    }
   }
  }
  catch (e) {console.log(e);}
  try
  {
   this.originalListener.onStopRequest(request, context, statusCode);
  }
  catch (e) {}
 },
 QueryInterface: function (aIID)
 {
  if (aIID.equals(Components.interfaces.nsIStreamListener) || aIID.equals(Components.interfaces.nsISupports))
   return this;
  throw Components.results.NS_NOINTERFACE;
 }
};
window.addEventListener('load', hterr_grabber.LoadListener, false);
