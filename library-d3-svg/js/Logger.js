/**
 * Writes to the Log tab in the algorithm
 * @author Adrian Haarbach
 * @class
 * @param {Object} parentDiv - a d3 selector
 */
Logger = function(parentDiv){
    parentDiv.style("text-align","left");
    var outerList = parentDiv.append("ol").attr("class","level1");
    this.data = [];
    this.currentNodeLevel2 = null;
    this.currentNodeLevel3 = null;

    this.listTypes=["ol","ol","ul","ul","ul"];

    var that = this;


this.log = function(val){
//   console.log(val);
  var logEntry = {text:val};
  this.data.push(logEntry);
  this.currentNodeLevel2=logEntry;
  update();
}

this.log2 = function(val){
//   console.log(val);
  var logEntry = {text:val};
  this.currentNodeLevel2.children ? this.currentNodeLevel2.children.push(logEntry) : this.currentNodeLevel2.children = [logEntry];
  this.currentNodeLevel3=logEntry;
  update();
}

this.log3 = function(val){
//   console.log(val);
  var logEntry = {text:val};
  this.currentNodeLevel3.children ? this.currentNodeLevel3.children.push(logEntry) : this.currentNodeLevel3.children = [logEntry];
  update();
}

function update(){
//   updateSingle([]);
  parentDiv.selectAll("ol").remove();
  updateRecursive(that.data,parentDiv,0);
}

this.update = update;

function updateRecursive(arr,selection,depth){
  if(arr){
    var childContainer = selection.append(that.listTypes[depth]);
    arr.forEach(function(childItem){
            var listItem = childContainer.append("li");
            listItem.html(childItem.text);
            updateRecursive(childItem.children,listItem,depth+1);
    });
  }
}

// function updateSingle(arr){
// var selection = outerList.selectAll("li.level1").data(arr);
   
//    //enter
//    var enterSelection = selection
//     .enter()
//     .append("li")
//     .attr("class","level1");

//     enterSelection.append("p").attr("class","level1");
//     enterSelection.append("ol").attr("class","level2");


//    //update
//    selection.selectAll("p.level1").text(function(d,i){return d.text})
// //     .style("background-color","lightgray")
//   selection.selectAll("ol.level2").selectAll("li.level2")
//     .data(function(d1){return d1.children;})
//     .enter()
//     .append("li")
//     .attr("class","level2")
//     .text(function(d2){return d2.text})
// //     .style("background-color","white");

// // elem.exit().remove();

// }

}