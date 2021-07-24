var hterr_grabber = {
 pageData: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" lang="{%HTML_LANG%}">\n <head>\n  <title>{%HTML_TITLE%}</title>\n  <link rel="stylesheet" href="chrome://global/skin/netError.css" type="text/css" media="all" />\n  <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHRleHQgeD0iMCIgeT0iMTQiPuKaoO+4jzwvdGV4dD48L3N2Zz4=" type="image/svg+xml" />\n  <script>\n   function goBackThis(buttonEl)\n   {\n    try\n    {\n     history.go(-1);\n    }\n    catch(e) {}\n    buttonEl.disabled = true;\n   }\n   function retryThis(buttonEl)\n   {\n    try \n    {\n     {%RETRY_SCOPE%}location.reload();\n    }\n    catch(e) {}\n    buttonEl.disabled = true;\n   }\n  </script>{%STYLE%}\n </head>\n <body dir="{%LOCALE_DIR%}">\n  <div id="errorPageContainer">\n   <div id="errorTitle"><h1 id="errorTitleText">{%HTTP_ERROR_TITLE%}</h1></div>\n   <div id="errorLongContent">\n    <div id="errorShortDesc"><p id="errorShortDescText">{%HTTP_ERROR_DESCRIPTION%}</p></div>\n    <div id="errorLongDesc">{%HTTP_ERROR_DETAILS%}</div>\n   </div>\n   <button id="errorTryAgain" autocomplete="off" onclick="retryThis(this);">{%RETRY_LABEL%}</button>\n   <button id="errorGoBack" autocomplete="off" onclick="goBackThis(this);">{%BACK_LABEL%}</button>\n   <script>\n    // Only do autofocus if we\'re the toplevel frame; otherwise we\n    // don\'t want to call attention to ourselves!  The key part is\n    // that autofocus happens on insertion into the tree, so we\n    // can remove the button, add @autofocus, and reinsert the\n    // button.\n    if (2 > history.length)\n    {\n     var button = document.getElementById("errorGoBack");\n     var parent = button.parentNode;\n     parent.removeChild(button);\n    }\n    var noRetry = {%HTTP_ERROR_RETRY_BLOCKED%};\n    if (noRetry)\n    {\n     var button = document.getElementById("errorTryAgain");\n     var parent = button.parentNode;\n     parent.removeChild(button);\n     var button2 = document.getElementById("errorGoBack");\n     if (button2 !== null)\n      button2.setAttribute("id", "errorTryAgain");\n    }\n    if (window.top == window)\n    {\n     var button = document.getElementById("errorTryAgain");\n     if (button !== null)\n     {\n      var nextSibling = button.nextSibling;\n      var parent = button.parentNode;\n      parent.removeChild(button);\n      button.setAttribute("autofocus", "true");\n      parent.insertBefore(button, nextSibling);\n     }\n    }\n   </script>\n  </div>\n </body>\n</html>',
 plainData: '{%HTML_TITLE%}\n\n{%HTTP_ERROR_TITLE%}\n{%HTTP_ERROR_DESCRIPTION%}\n\n{%HTTP_ERROR_DETAILS%}',
 hideReload: [400, 403, 410, 414, 415, 418, 421, 422, 423, 426, 428, 431, 444, 449, 450, 451, 494, 497, 499, 501, 505, 506, 507, 508, 509, 510, 518, 523, 526, 530],
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
  data = data.replace(/{%STYLE%}/g, '');
  data = data.replace(/{%RETRY_SCOPE%}/g, '');
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
 BlankBuilder: function(sConsole)
 {
  let data = hterr_grabber.pageData;
  let localeDir = 'ltr';
  let htmlLang = 'en';
  
  let htmlTitle = 'Problem loading page';
  let cmdBack = 'Go Back';
  let cmdRetry = 'Try Again';
  
  let errTitle = 'Blank Page Detected';
  let errDesc = 'There was an error rendering this website.';
  let errDetail = '<p>The page you are visiting did not render correctly. The error console may provide more details.</p>';
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
  
  try {errTitle = locale.GetStringFromName('error.blank.title');}
  catch(e) {errTitle = 'Blank Page Detected';}
  try {errDesc = locale.GetStringFromName('error.blank.desc');}
  catch(e) {errDesc = 'There was an error rendering this website.';}
  try {errDetail = locale.GetStringFromName('error.blank.longDesc');}
  catch(e) {errDetail = '<p>The page you are visiting did not render correctly. The error console may provide more details.</p>';}
  if (sConsole !== '')
   errDetail+= '<textarea id="console" readonly="readonly" wrap="off">' + sConsole + '</textarea>';
  
  let sStyle = '\n  <style>' +
   '\n   #console' +
   '\n   {' +
   '\n    background-color: inherit;' +
   '\n    color: inherit;' +
   '\n    min-width: 100%;' +
   '\n    max-width: 100%;' +
   '\n    min-height: 6em;' +
   '\n    max-height: 30em;' +
   '\n   }' +
   '\n  </style>';
  
  data = data.replace(/{%STYLE%}/g, sStyle);
  data = data.replace(/{%RETRY_SCOPE%}/g, 'window.top.');
  data = data.replace(/{%LOCALE_DIR%}/g, localeDir);
  data = data.replace(/{%HTML_LANG%}/g, htmlLang);
  
  data = data.replace(/{%HTML_TITLE%}/g, htmlTitle);
  data = data.replace(/{%BACK_LABEL%}/g, cmdBack);
  data = data.replace(/{%RETRY_LABEL%}/g, cmdRetry);
  
  data = data.replace(/{%HTTP_ERROR_TITLE%}/g, errTitle);
  data = data.replace(/{%HTTP_ERROR_DESCRIPTION%}/g, errDesc);
  data = data.replace(/{%HTTP_ERROR_DETAILS%}/g, errDetail);
  data = data.replace(/{%HTTP_ERROR_RETRY_BLOCKED%}/g, errNoRetry);
  return data;
 },
 BlankPageChecker: function(wnd)
 {
  if (!wnd)
   return;
  if (wnd.contentWindow.hterrTimer)
   wnd.contentWindow.clearTimeout(wnd.hterrTimer);
  if (wnd.contentDocument.body.scrollHeight > wnd.contentDocument.documentElement.clientHeight)
   return;
  if (wnd.contentDocument.body.scrollWidth > wnd.contentDocument.documentElement.clientWidth)
   return;
  const canvas = wnd.contentDocument.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  canvas.width = wnd.contentDocument.documentElement.clientWidth;
  canvas.height = wnd.contentDocument.documentElement.clientHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawWindow(wnd.contentWindow, 0, 0, canvas.width, canvas.height, 'rgb(255,255,255)', ctx.DRAWWINDOW_DRAW_VIEW);
  const dt = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let r = dt.data.filter(b => b !== 255);
  if (r.length > 0)
   return;
  let consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  let consoleLines = consoleService.getMessageArray();
  let sConsole = '';
  let waitForBlank = 10;
  let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
  if (prefs.prefHasUserValue('extensions.hterr.blankwait'))
   waitForBlank = prefs.getIntPref('extensions.hterr.blankwait');
  if (waitForBlank < 1)
   waitForBlank = 1;
  if (waitForBlank > 60)
   waitForBlank = 60;
  for (let i = 0; i < consoleLines.length; i++)
  {
   try
   {
    let oErr = consoleLines[i].QueryInterface(Components.interfaces.nsIScriptError);
    let wndUtil = wnd.contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindowUtils);
    if (wndUtil.currentInnerWindowID !== oErr.innerWindowID)
     continue;
    if ((oErr.flags & 2) === 0)
     continue;
    let sMsg = oErr.errorMessage;
    if (oErr.sourceName !== '')
     sMsg += '\n  ' + oErr.sourceName;
    if (oErr.lineNumber > 0)
    {
     sMsg += '\n    line ' + oErr.lineNumber;
     if (oErr.columnNumber > 0)
      sMsg += ', column ' + oErr.columnNumber;
    }
    if (oErr.sourceLine !== '')
     sMsg += '\n> ...' + oErr.sourceLine + '...';
    if (sConsole === '')
     sConsole = sMsg;
    else
     sConsole += '\n\n' + sMsg;
   }
   catch(ex){continue;}
  }
  let sHTML = hterr_grabber.BlankBuilder(sConsole);
  let doc = wnd.contentDocumentAsCPOW;
  let d = doc.createElement('iframe');
  d.setAttribute('frameborder', '0');
  d.setAttribute('style','position: absolute; top: 0; left: 0; width: 100%; height: 100%;');
  d.srcdoc = sHTML;
  doc.body.appendChild(d);
 },
 DocumentFinder: function(request, mustBeReady)
 {
  let mainDoc = false;
  if (gBrowser.browsers === undefined || gBrowser.browsers.length < 1)
   return mainDoc;
  for (let i = 0; i < gBrowser.browsers.length; i++)
  {
   if (mustBeReady)
   {
    if (gBrowser.browsers[i].contentDocument.readyState === 'complete')
     continue;
    if (gBrowser.browsers[i].contentDocument.readyState === 'uninitialized')
     continue;
    if (gBrowser.browsers[i].contentDocument.readyState !== 'loading' && gBrowser.browsers[i].contentDocument.readyState !== 'interactive')
     console.log('Unknown readyState:', gBrowser.browsers[i].contentDocument.readyState, '(Risking it as something to compare)');
   }
   if (request.originalURI !== undefined)
   {
    if (gBrowser.browsers[i].contentDocument.location.href === request.originalURI.spec)
    {
     mainDoc = gBrowser.browsers[i];
     break;
    }
   }
   if (gBrowser.browsers[i].contentDocument.location.href === request.name)
   {
    mainDoc = gBrowser.browsers[i];
    break;
   }
  }
  return mainDoc;
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
  let mainDoc = hterr_grabber.DocumentFinder(request, false);
  if (mainDoc !== false)
  {
   if (mainDoc.contentWindow.hterrTimer)
    mainDoc.contentWindow.clearTimeout(mainDoc.hterrTimer);
  }
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
   let mainDoc = hterr_grabber.DocumentFinder(request, true);
   if (!mainDoc)
    return;
   if (mainDoc.contentWindow.hterrTimer)
    mainDoc.contentWindow.clearTimeout(mainDoc.contentWindow.hterrTimer);
   let waitForBlank = 10;
   let prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
   if (prefs.prefHasUserValue('extensions.hterr.blankwait'))
    waitForBlank = prefs.getIntPref('extensions.hterr.blankwait');
   if (waitForBlank > 60)
    waitForBlank = 60;
   if (waitForBlank > 0)
    mainDoc.contentWindow.hterrTimer = mainDoc.contentWindow.setTimeout(hterr_grabber.BlankPageChecker, waitForBlank * 1000, mainDoc);
   request.QueryInterface(Components.interfaces.nsIHttpChannel);
   if (!hterr_grabber.nullData[request.channelId])
    return;
   if (!request.hasOwnProperty('responseStatus'))
    return;
   if (!request.hasOwnProperty('originalURI'))
    return;
   delete hterr_grabber.nullData[request.channelId];
   let code = 0;
   try
   {
    code = request.responseStatus;
   }
   catch (ex){}
   if (code < 400)
    return;
   if (code >= 600)
    return;
   let mime = request.contentType;
   let cType = mime.substring(0, mime.indexOf('/'));
   let cEnc = mime.substring(mime.indexOf('/') + 1);
   if (!(cType === 'text' || (cType === 'application' && (cEnc.includes('html') || cEnc.includes('xml'))) || mime === 'image/svg+xml'))
    return;
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
  catch (e) {console.log(e);}
  finally
  {
   try
   {
    this.originalListener.onStopRequest(request, context, statusCode);
   }
   catch (e) {}
  }
 },
 QueryInterface: function (aIID)
 {
  if (aIID.equals(Components.interfaces.nsIStreamListener) || aIID.equals(Components.interfaces.nsISupports))
   return this;
  throw Components.results.NS_NOINTERFACE;
 }
};
window.addEventListener('load', hterr_grabber.LoadListener, false);
