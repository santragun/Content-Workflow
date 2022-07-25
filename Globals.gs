var spreadsheetId = '1jLvkyvO9VbYe8zdW82IYJy4vaWzmt45RAv8E2UvnkMU';
var writer = Session.getEffectiveUser().getEmail();







var unassigned, inProgress, inReview, completed = "";
var functionName = 'getSpreadsheetData';
unassigned = callAPIExec(functionName, [spreadsheetId, 'Unassigned']);
Logger.log(unassigned);
if(!unassigned.includes('Not authorized')){
  unassigned = JSON.parse(unassigned);
}
else{
  unassigned = unassigned.substring(14);
}
if (typeof (unassigned) != 'string') {
  PropertiesService.getScriptProperties().setProperty('authorization', 'yes');
  inProgress = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Progress']));
  inReview = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Review']));
  completed = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'Completed']));
}
else {
  PropertiesService.getScriptProperties().setProperty("authorization", "no");
}

function callAPIExec(functionName, parameters) {
  var service = getOAuthServiceWithClientID();
  // service.reset();
  if (service.hasAccess()) {
    var token = service.getAccessToken();

    var scriptId = '11Ik_QjOLSGKgKlis1nQPi2S6iBRqpf8d7GU--rPclXu_dQsqpscSFcDh';
    var deploymentID = 'AKfycbwJnPil-wkxsWRKjFDLwV8J0-whudy4i9r5DiBfsxzBbxqR5KJ9GkwMnUS_-o0Vzl3V';

    var url = 'https://script.googleapis.com/v1/scripts/' + deploymentID + ':run';
    var options = {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      payload: JSON.stringify({
        "function": functionName,
        "parameters": parameters,
        "devMode": false
      }),
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response).response.result;
  }
  else {
    var authorizationUrl = service.getAuthorizationUrl();
    return 'Not authorized' + authorizationUrl;  
  }
}
