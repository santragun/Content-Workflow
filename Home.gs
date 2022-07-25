function doGet() {
  var authorization = PropertiesService.getScriptProperties().getProperty("authorization");
  if (authorization == 'no') {
    var authUrl = callAPIExec(functionName, [spreadsheetId, 'Unassigned']).substring(14);
    var html = HtmlService.createTemplateFromFile('authorization');
    html.authUrl = authUrl;
    return html.evaluate();
  }
  else {
    var html = HtmlService.createTemplateFromFile('Base');
    return html.evaluate();
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
function identifyPrivilege() {
  var privilege = callAPIExec('getPermission', [spreadsheetId, writer]);
  return privilege;
}
function getTopics() {
  unassigned.shift();

  var postTopics = unassigned;
  postTopics.push('unassigned');
  return postTopics;
}
function retrieveTopics(type){
  var ret = [];
  if(type == 'progress'){
    ret = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Progress']));
  }
  else if(type == 'review' || type == 'reviewNew'){
    ret = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Review']));
  }
  else{
    ret = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'Completed']));
  }
  
  ret.shift();
  ret.push(type);
  return ret;
}

function myTopics(callee) {
  var myInProgress = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Progress']));
  var myInreview = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'In Review']));
  var myCompleted = JSON.parse(callAPIExec(functionName, [spreadsheetId, 'Completed']));

  var myAllTopics = [];
  for (let i = 0; i < myInProgress.length; i++) {
    if (myInProgress[i][7].toLocaleLowerCase().localeCompare(writer.toLocaleLowerCase()) == 0) {
      let row = myInProgress[i];
      row.push('In Progress');
      myAllTopics.push(row);
      break;
    }
  }
  for (let i = 0; i < myInreview.length; i++) {
    if (myInreview[i][7].toLocaleLowerCase().localeCompare(writer.toLocaleLowerCase()) == 0) {
      let row = myInreview[i];
      row.push('In Review');
      myAllTopics.push(row);
    }
  }
  for (let i = 0; i < myCompleted.length; i++) {
    if (myCompleted[i][9].toLocaleLowerCase().localeCompare(writer.toLocaleLowerCase()) == 0) {
      let row = myCompleted[i];
      row.push('Completed');
      myAllTopics.push(row);
    }
  }

  if (callee == 'not found') {
    myAllTopics.push('not found');
  }
  else if (callee == 'selection') {
    myAllTopics.push('selected');
  }
  else {
    myAllTopics.push('non');
  }

  return JSON.stringify(myAllTopics);
}

function selectTopic(postID) {
  var startDate = Utilities.formatDate(new Date(), "GMT + 5:30", "dd/MM/yyyy");
  var dueDate = Utilities.formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 20), "GMT + 5:30", "dd/MM/yyyy");
  var myPostTopics = inProgress;
  var row_1 = 0;
  for (let i = 0; i < myPostTopics.length; i++) {
    if (myPostTopics[i][7].localeCompare(writer) == 0) {
      row_1 = i;
      break;
    }
  }
  if (row_1 == 0) {
    var unassignedTopics = unassigned;
    var row = 0;
    for (let i = 0; i < unassignedTopics.length; i++) {
      if (unassignedTopics[i][0].localeCompare(postID) == 0) {
        row = i;
        break;
      }
    }
    if (row != 0) {
      var selectedTopic = unassignedTopics[row];
      if (selectedTopic.length >= 6) {
        selectedTopic = selectedTopic.slice(0, 6);
      }
      if (selectedTopic[5].trim() == '') {
        selectedTopic[5] = dueDate;
      }
      selectedTopic.push(startDate);
      selectedTopic.push(writer);
      callAPIExec('assignTopic', [spreadsheetId, row + 1, selectedTopic]);
      return myTopics('selection');
    }
    else {
      return myTopics('not found');
    }
  }
  else {
    return ['assigned task'];
  }
}

function getScriptURL() {
  return ScriptApp.getService().getUrl();
}

function moveToReview(postID) {
  var myPostTopics = JSON.parse(callAPIExec('getSpreadsheetData', [spreadsheetId, 'In Progress']));
  var row = 0;
  for (let i = 0; i < myPostTopics.length; i++) {
    if (myPostTopics[i][0].localeCompare(postID) == 0) {
      row = i;
      break;
    }
  }
  if (row != 0) {
    var result = callAPIExec('makeInReview', [spreadsheetId, row + 1, myPostTopics[row]]);
  }
}

function markAsCompleted(postID) {
  var myPostTopics = JSON.parse(callAPIExec('getSpreadsheetData', [spreadsheetId, 'In Review']));
  var row = 0;
  for (let i = 0; i < myPostTopics.length; i++) {
    if (myPostTopics[i][0].localeCompare(postID) == 0) {
      row = i;
      break;
    }
  }
  if (row != 0) {
    callAPIExec('markAsCompleted', [spreadsheetId, row + 1, myPostTopics[row]]);
  }
}