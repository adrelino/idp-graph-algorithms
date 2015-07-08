//TODO: inherit from GraphDrawer and capsulate functions

function click(){
  if(!currentedge) return;
  if(clicked) return;
  var pos = d3.mouse(this);
  var end=addNode(pos);
  edgestart.selection.style("stroke","black");

//   currentedge=null;
//   edgestart=null;
  clicked=false;
}


// svgOrigin.on('click',function(d){
//   console.log(d3.event);
function doubleclick(d,i){
  var pos = d3.mouse(this);
  addNode(pos);
  d3.event.preventDefault();
}

function addNode(pos){
//   console.log(pos);
  var point = {x: x.invert(pos[0]-margin.left), y: y.invert(pos[1]-margin.top), id:id++};
//   var point = {x: d3.event.x,y: d3.event.y, id:id++};
//   console.log(point);
  nodes.push(point);
  updateNodes();
  return point;
}
// });

var moved = false;
var currentedge = null;

function mousemove(){
  moved = true;
  var pos = d3.mouse(this);

  if(selected){
      selected.d.x = x.invert(pos[0]-margin.left);
      selected.d.y = y.invert(pos[1]-margin.top);
      selected.selection.attr("transform","translate(" + (pos[0]-margin.left) + "," + (pos[1]-margin.top) + ")");
      updateEdges();
  }else if(edgestart){
      var edgeend = {};
      edgeend.x = x.invert(pos[0]-margin.left);
      edgeend.y = y.invert(pos[1]-margin.top);

      if(!currentedge){
        currentedge = {start : edgestart.d};
        links.push(currentedge);
      }
      currentedge.end = edgeend;

      updateEdges();

  }

}

function edgeClicked(d,i,all)
{
  console.log(d,i,all);
  d.cap--;
  d3.event.stopPropagation();
//   d3.event.preventDefault();
  updateEdges();
}


var selected = null;
var clicked=false;

function nodeDown(d,a,b){
  moved=false;
  if(selected){
    selected.selection.style("stroke","black");
  }
  var elem = {d: d, selection: d3.select(this)};

  if(currentedge){
    currentedge.end=d;
    d3.event.stopPropagation();
    updateEdges();
    clicked=true;
    currentedge=null;
    edgestart=null;

  }else{
    elem.selection.style("stroke","red");
    selected=elem;
  }
  
  d3.event.preventDefault();

}

var edgestart=null;

function nodeUp(d,a,b){
  if(moved){
    if(selected){
      selected.selection.style("stroke","black");
    }
    selected=null;
//   var elem = {d: d, selection: d3.select(this)};
//   elem.selection.style("stroke","red");
//   selected=elem;
    edgestart=null;
  }else{
    edgestart=selected;
    if(selected){
      selected.selection.style("stroke","green");
    }
    selected=null;
  }
  d3.event.preventDefault();
}