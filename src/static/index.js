// Variable
var markers = [], nodes = [];
var edge = [], edges = [], paths = [];
// Variable map
var map;
// DOM
var select = document.getElementsByClassName("select-view");
var selectPath = document.getElementsByClassName("select-path");
var deleteVertex = document.getElementById("delete-vertex");
var deleteEdge = document.getElementById("delete-edge"); 
var deleteVertices = document.getElementById("delete-vertices");
var deleteEdges = document.getElementById("delete-edges"); 
var submitButton = document.getElementById("submit");

// Method
function initMap() {
  // Variable used
  var center = {lat: -6.891448, lng: 107.610654};

  // Instance of Map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16.2,
    center: center,
    mapTypeId: 'terrain'
  });

  // Event listener
  map.addListener('click', function(event) {
    placeMarker(event.latLng);
  });

  // add Event Listener to all the button and text related!

  deleteVertex.addEventListener('click', function() {
    if (markers.length === 0)
      return;
    // Variable
    var option = select[0].options[select[0].selectedIndex].value;
    var idx = select[0].selectedIndex;
    // Reset the map
    setMapOnAll(null);
    // Splice it
    markers.splice(idx, 1);
    // Reset nodes
    nodes = []
    // Iterate and edit all
    for(var i = 0; i < markers.length; i++) {
      var label = markers[i].getLabel();
      label.text = (i + 1).toString();
      label.color = 'white';
      markers[i].setLabel(label);
      // Add node
      var node = {
        label:(i+1).toString(), 
        lat:markers[i].getPosition().lat(), 
        lng:markers[i].getPosition().lng()
      };
      nodes.push(node);
    }
    // Set the map
    setMapOnAll(map);
    // Edit the option
    editOption(0);
    // Delete all the edges
    if (edges.length === 0)
      return;
    setMapPathOnAll(null);
    edges = [];
    paths = [];
    editOption(1);
  });

  deleteEdge.addEventListener('click', function() {
    if (edges.length === 0)
      return;
    // Variable
    var idx = select[1].selectedIndex;
    // Reset the map
    setMapPathOnAll(null);
    edges.splice(idx, 1);
    paths.splice(idx, 1);
    // Set the map
    setMapPathOnAll(map);
    // Edit the option
    editOption(1);
  });

  deleteVertices.addEventListener('click', function() {
    // Set map to null
    setMapOnAll(null);
    setMapPathOnAll(null);
    // Reset all
    markers = []; nodes = []; edges = []; edge = []; paths = [];
    // Edit the option
    editOption(0);
    editOption(1);
    alert("Delete all nodes and the paths..");
  });

  deleteEdges.addEventListener('click', function() {
    setMapPathOnAll(null);
    edges = []; paths = [];
    editOption(1);
    alert("All paths deleted..");
  });

  submitButton.addEventListener('click', function() {
    if (edges.length === 0 || markers === 0) {
      alert("Fill the edges and markers first!");
      return;
    }
    // Set the nodes
    var dict = {};
    dict["Nodes"] = nodes;
    dict["Edges"] = edges;
    dict["From"] = selectPath[0].options[selectPath[0].selectedIndex].value;
    dict["To"] = selectPath[1].options[selectPath[1].selectedIndex].value;
    console.log(dict);
    // Make http request
    var http = new XMLHttpRequest();
    http.open("POST", "post_data", true);
    http.setRequestHeader("Content-type", "application/json");
    http.send(JSON.stringify(dict));
    alert("Data submitted!")
  })
}

// Place the marker in map
function placeMarker(location) {
  var marker = new google.maps.Marker({
    position: location, 
    map: map,
    label: {
      text : (markers.length + 1).toString(),
      color : 'white'
    }
  });
  // Add listener
  marker.addListener('click', function() {
    // Change color to black
    var label = this.getLabel();
    label.color = 'black';
    this.setLabel(label);
    // Set to make the line
    addEdge(marker);
  });
  // Push it to list
  markers.push(marker);
  // Add to list of nodes
  var node = {
    label:(markers.length).toString(), 
    lat:marker.getPosition().lat(), 
    lng:marker.getPosition().lng()
  };
  nodes.push(node);
  // add to select option
  addToOption(0, markers.length - 1);
  addToPathChoice(markers.length - 1);
}

// Set picture marker to map
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Set picture path to map
function setMapPathOnAll(map) {
  for (var i = 0; i < paths.length; i++) {
    paths[i].setMap(map);
  }
}

function addToOption(i, index) {
  // Variable
  var str;

  if (i === 0) {
    var lat = nodes[index].lat.toFixed(4);
    var lng = nodes[index].lng.toFixed(4);
    str = (index+1).toString() + ". (" + lat.toString() + ", " + lng.toString() + ")";
  } else { // i === 1
    var label1 = edges[index].v1.label;
    var label2 = edges[index].v2.label;
    str = (index+1).toString() + ". ( Path " + label1 + " and " + label2 + " )";
  }
  console.log(str);
  // Add to option
  var option = document.createElement("option");
  option.classList.add("option-text");
  option.text = str;
  select[i].add(option);
}

function addToPathChoice(index) {
  var str = (index+1).toString();
  // Option 1
  var option = document.createElement("option");
  option.classList.add("option-text");
  option.text = str;
  selectPath[0].add(option);
  // Option 2
  var option = document.createElement("option");
  option.classList.add("option-text");
  option.text = str;
  selectPath[1].add(option);
}

function editOption(idx) {
  var length = select[idx].length;
  // Delete all
  for (var i = 0; i < length; i++) {
    select[idx].remove(0);
    // Remove the select option in the path
    if (idx === 0) {
      if (selectPath[0].length > 0)
        selectPath[0].remove(0);
      if (selectPath[1].length > 0)
      selectPath[1].remove(0);
    }
  }
  if (idx === 0)
    length = nodes.length;
  else
    length = edges.length;
  console.log(length);
  // Add the other
  for (var i = 0; i < length; i++) {
    addToOption(idx, i);
    if (idx === 0) {
      // Add again to path
      addToPathChoice(i);
    }
  }
} 

function addEdge(marker) {
  edge.push(marker);
  if (edge.length === 2) {
    // Get marker
    var marker1 = edge[0], marker2 = edge[1];
    var pos1 = marker1.getPosition(), pos2 = marker2.getPosition();
    // Get distance
    var distance = google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2);
    // Get loc
    var loc1 = {lat: marker1.position.lat(), lng: marker1.position.lng(), label : marker1.getLabel().text};
    var loc2 = {lat: marker2.position.lat(), lng: marker2.position.lng(), label : marker2.getLabel().text};
    // Validate
    if (!inPath(marker1.getLabel().text, marker2.getLabel().text) && (marker1.label !== marker2.label)) {
      // Add to edges
      var loc = {v1:loc1, v2:loc2, dist:distance};
      edges.push(loc);
      // Add to paths
      addPath(loc1, loc2)
      // Reset edge
      edge = [];
    } 
    // Set the color back
    // Marker 1
    var label = marker1.getLabel();
    label.color = 'white';
    marker1.setLabel(label);
    // Marker 2
    label.text = marker2.getLabel().text;
    marker2.setLabel(label);
  } 
}

function inPath(lab1, lab2) {
  for (var i = 0; i < edges.length; i++) {
    if ((edges[i].v1.label === lab1 && edges[i].v2.label === lab2) || (edges[i].v1.label === lab2 && edges[i].v2.label === lab1)) {
      return true;
    }
  } 
  return false;
}

function addPath(loc1, loc2) {
  var flightPlanCoordinates = [
    {lat: loc1.lat, lng: loc1.lng},
    {lat: loc2.lat, lng: loc2.lng},
  ];
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  console.log(flightPath.getPath().b[0]);
  flightPath.setMap(map);
  paths.push(flightPath);
  addToOption(1, edges.length - 1);
}