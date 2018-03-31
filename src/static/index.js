// Variable
var markers = [], nodes = [];
var edge = [], edges = [], paths = [];
// Variable map
var map;

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
  addToSelect(0, markers.length - 1);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function setMapPathOnAll(map) {
  for (var i = 0; i < paths.length; i++) {
    paths[i].setMap(map);
  }
}

function addToSelect(i, index) {
  // Variable
  var str;

  if (i === 0) {
    var lat = markers[index].getPosition().lat().toFixed(4);
    var lng = markers[index].getPosition().lng().toFixed(4);
    str = (index+1).toString() + ". (" + lat.toString() + ", " + lng.toString() + ")";
    var node = {label:(index+1).toString() ,lat:lat, lng:lng};
    nodes.push(node);
  } else { // I === 1
    var label1 = edges[index].v1.label;
    var label2 = edges[index].v2.label;
    str = (index+1).toString() + ". ( " + label1 + " - " + label2 + " )";
  }
  console.log(str);
  var option = document.createElement("option");
  option.classList.add("option-text");
  option.text = str;
  select[i].add(option);
}

function editOption(idx) {
  var length = select[idx].length;
  // Delete all
  for (var i = 0; i < length; i++) {
    var option = select[idx].options[select[idx].selectedIndex].value;
    select[idx].remove(option);
  }
  if (idx === 0)
    length = markers.length;
  else
    length = edges.length;
  // Add the other
  for (var i = 0; i < length; i++) {
    addToSelect(idx, i);
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
  addToSelect(1, edges.length - 1);
}