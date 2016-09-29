/**
 * Writes to the Log tab in the algorithm
 * @author Adrian Haarbach
 * @class
 * @param {Object} parentDiv - a d3 selector
 */
Logger = function(parentDiv,lastEntryDiv){
  parentDiv.style("text-align","left");
  var outerList = parentDiv.append("ol").attr("class","level1");
  this.parentDiv = parentDiv;
  this.lastEntryDiv = lastEntryDiv;

  this.reset();
}//end Logger

//static
Logger.listTypes=["ol","ol","ul","ul","ul"];


Logger.prototype.addLogEntry = function(text,parentId){
  var newId = this.state.idCounter++;
  var logEntry = {text:text, id:newId, children:[]};
  //this.map.set(logEntry.id,logEntry);
  this.state.map[logEntry.id]=logEntry;
  if(parentId !== null){
    var innerNode = this.state.map[parentId];//this.map.get(parentId);
    innerNode.children.push(logEntry.id);
  }
  return logEntry;
}

Logger.prototype.log = function(val){
  var logEntry = this.addLogEntry(val,"root");
  this.state.id2=logEntry.id;
  this.update();
}

Logger.prototype.log2 = function(val){
  var logEntry = this.addLogEntry(val,this.state.id2);
  this.state.id3=logEntry.id;
  this.update();
}

Logger.prototype.log3 = function(val){
  var logEntry = this.addLogEntry(val,this.state.id3);
  this.update();
}

Logger.prototype.reset = function(){
  this.state = {
    idCounter : 0,
    id2 : -1,
    id3 : -1,
    map : {"root" : {children:[]}}
  }
//   this.map = d3.map();
//   this.map.set("root",{children:[]});
}


Logger.prototype.updateRecursive = function(arr,selection,depth){
  if(arr && arr.length > 0){
    var childContainer = selection.append(Logger.listTypes[depth]);
    arr.forEach(function(childItemId){
      var childItem = this.state.map[childItemId];//this.map.get(childItemId);
      var listItem = childContainer.append("li");
      listItem.html(childItem.text);
      this.lastEntryDiv.html(childItem.text);
      this.updateRecursive(childItem.children,listItem,depth+1);
    },this);
  }
}

Logger.prototype.update = function(){
  this.parentDiv.selectAll("ol").remove();
  this.lastEntryDiv.html("");
  this.updateRecursive(this.state.map["root"].children,this.parentDiv,0);
}

Logger.prototype.setState = function(state){
  this.state = JSON.parse(state);
}

Logger.prototype.getState = function(){
  return JSON.stringify(this.state);
}