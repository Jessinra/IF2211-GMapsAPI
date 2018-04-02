// Variable
var markers = [], nodes = [];
var edge = [], edges = [], paths = [], resPaths = [];
// Variable map
var map;
var centerA = {lat: -6.891448, lng: 107.610654};
var centerB = {lat: -6.921948, lng: 107.607168};
// DOM
var select = document.getElementsByClassName("select-view");
var selectPath = document.getElementsByClassName("select-path");
var deleteVertex = document.getElementById("delete-vertex");
var deleteEdge = document.getElementById("delete-edge");
var deleteVertices = document.getElementById("delete-vertices");
var deleteEdges = document.getElementById("delete-edges");
var submitButton = document.getElementById("submit");
var resetButton = document.getElementById("reset");
var navButton = document.getElementById("nav-button");
var navBar = document.getElementsByClassName("navbar");
var itb = document.getElementById("ITB");
var alun = document.getElementById("Alun-Alun");
var costRes = document.getElementById("cost");

// Method
function initMap() {
	// Variable used
	navBar = navBar[0];
	
	// Add Style
	var styledMapType = new google.maps.StyledMapType(
		[
			{
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#212121"
					}
				]
			},
			{
				"elementType": "labels.icon",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#757575"
					}
				]
			},
			{
				"elementType": "labels.text.stroke",
				"stylers": [
					{
						"color": "#212121"
					}
				]
			},
			{
				"featureType": "administrative",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#757575"
					}
				]
			},
			{
				"featureType": "administrative.country",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#9e9e9e"
					}
				]
			},
			{
				"featureType": "administrative.land_parcel",
				"stylers": [
					{
						"visibility": "off"
					}
				]
			},
			{
				"featureType": "administrative.locality",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#bdbdbd"
					}
				]
			},
			{
				"featureType": "poi",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#757575"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#181818"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#616161"
					}
				]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels.text.stroke",
				"stylers": [
					{
						"color": "#1b1b1b"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "geometry.fill",
				"stylers": [
					{
						"color": "#2c2c2c"
					}
				]
			},
			{
				"featureType": "road",
				"elementType": "labels.text.fill",
				"stylers": [
					{
							"color": "#8a8a8a"
					}
				]
			},
			{
				"featureType": "road.arterial",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#373737"
					}
				]
			},
			{
				"featureType": "road.highway",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#3c3c3c"
					}
				]
			},
			{
				"featureType": "road.highway.controlled_access",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#4e4e4e"
					}
				]
			},
			{
				"featureType": "road.local",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#616161"
					}
				]
			},
			{
				"featureType": "transit",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#757575"
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "geometry",
				"stylers": [
					{
						"color": "#000000"
					}
				]
			},
			{
				"featureType": "water",
				"elementType": "labels.text.fill",
				"stylers": [
					{
						"color": "#3d3d3d"
					}
				]
			}
		]
	);
	// Instance of Map
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 17,
		center: centerA,
		mapTypeId: ['roadmap', 'satellite', 'hybrid', 'terrain', 'styled_map']
	});
	map.mapTypes.set('styled_map', styledMapType);
	map.setMapTypeId('styled_map');

	// Event listener
	map.addListener('click', function (event) {
		placeMarker(event.latLng);
	});

	deleteVertex.addEventListener('click', function () {
		resetResults();
		if (markers.length === 0)
			return;
		// Variable
		var idx = select[0].length -1;
		// Reset the map
		setMapOnAll(null);
		// Splice it nodes and markers
		markers.splice(idx, 1);
		nodes.splice(idx, 1);
		// Set the map
		setMapOnAll(map);
		// Edit the option
		editOption(0);
		// Delete all the edges
		if (edges.length === 0)
			return;
		setMapPathOnAll(null);
		edges = []; paths = [];
		editOption(1);
	});

	deleteEdge.addEventListener('click', function () {
		resetResults();
		if (edges.length === 0)
			return; 
		// Variable
		var idx = select[1].length - 1;
		// Reset the map
		setMapPathOnAll(null);
		edges.splice(idx, 1);
		paths.splice(idx, 1);
		// Set the map
		setMapPathOnAll(map);
		// Edit the option
		editOption(1);
	});

	deleteVertices.addEventListener('click', removeAllVertices);

	deleteEdges.addEventListener('click', removeAllEdges);

	submitButton.addEventListener('click', submit);

	resetButton.addEventListener('click', resetResults);

	navButton.addEventListener('click', function() {
		console.log(navBar.display);
		if (navBar.style.display === "none") {
			console.log("tes");
			navBar.style.display = "block";
		} else {
			navBar.style.display = "none";
		}
	});

	itb.addEventListener('click', function() {
		map.setCenter(centerA);
	});

	alun.addEventListener('click', function() {
		console.log("a");
		map.setCenter(centerB);
	});
}

// Place the marker in map
function placeMarker(location) {
	var marker = new google.maps.Marker({
		position: location,
		map: map,
		label: { 
			text: (markers.length + 1).toString(),
			color: 'white'
		}
	});
	// Add listener
	marker.addListener('click', function () {
		// Change color to black
		if (edge.length === 0) {
			var label = this.getLabel();
			label.color = 'black';
			this.setLabel(label);  
		}
		// Set to make the line
		addEdge(marker);
	});
	// Push it to list
	markers.push(marker);
	// Add to list of nodes
	var node = {
		label: (markers.length).toString(),
		lat: marker.getPosition().lat(),
		lng: marker.getPosition().lng()
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

function setMapResPathOnAll(map) {
	for (var i = 0; i < resPaths.length; i++) {
		resPaths[i].setMap(map);
	}
}

function addToOption(i, index) {
	// Variable
	var str;
	if (i === 0) {
		var lat = nodes[index].lat.toFixed(4);
		var lng = nodes[index].lng.toFixed(4);
		str = (index + 1).toString() + ". (" + lat.toString() + ", " + lng.toString() + ")";
	} else { // i === 1
		var label1 = edges[index].v1.label;
		var label2 = edges[index].v2.label;
		str = (index + 1).toString() + ". ( Path " + label1 + " and " + label2 + " )";
	}
	console.log(str);
	// Add to option
	var option = document.createElement("option");
	option.classList.add("option-text");
	option.text = str;
	select[i].add(option);
}

function addToPathChoice(index) {
	var str = (index + 1).toString();
	// Option 1
	var option = document.createElement("option");
	option.classList.add("option-text");
	option.text = str;
	selectPath[0].add(option);
	// Option 2
	option = document.createElement("option");
	option.classList.add("option-text");
	option.text = str;
	selectPath[1].add(option);
}

function deleteVertexOption() {
	var length = select[0].length;
	// Delete all
	for (var i = 0; i < length; i++) {
		select[0].remove(0);
		if (selectPath[0].length > 0) {
			selectPath[0].remove(0);
		}
		if (selectPath[1].length > 0) {
			selectPath[1].remove(0);
		}
	}
}

function deleteEdgeOption() {
	var length = select[1].length;
	for (var i = 0; i < length; i++) {
		select[1].remove(0);
	}
}

function editOption(idx) {  
	if (idx === 0) {
		deleteVertexOption();
	} else {
		deleteEdgeOption();
	}
	if (idx === 0) length = nodes.length;
	else length = edges.length;
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
		var loc1 = {lat: marker1.position.lat(), lng: marker1.position.lng(), label: marker1.getLabel().text};
		var loc2 = {lat: marker2.position.lat(), lng: marker2.position.lng(), label: marker2.getLabel().text};
		// Validate
		if (!inPath(marker1.getLabel().text, marker2.getLabel().text) && (marker1.label !== marker2.label)) {
			// Add to edges
			var loc = {v1: loc1, v2: loc2, dist: distance};
			edges.push(loc);
			// Add to paths
			addPath(loc1, loc2)
		}
		// Reset edge
		edge = [];
		// Set the color back for marker 1 & 2
		var label = marker1.getLabel();
		label.color = 'white';
		marker1.setLabel(label);
	}
}

function inPath(lab1, lab2) {
	console.log("inPath");
	console.log(lab1);
	console.log(lab2);
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

function removeAllVertices () {
	// Set map to null
	resetResults();
	setMapOnAll(null);
	setMapPathOnAll(null);
	// Reset all
	markers = []; nodes = []; edges = []; edge = []; paths = [];
	// Edit the option
	editOption(0);
	editOption(1);
	alert("Delete all nodes and the paths..");
}

function removeAllEdges() {
	resetResults();
	setMapPathOnAll(null);
	edges = [];
	paths = [];
	editOption(1);
	alert("All paths deleted..");
}

function submit() {
	resetResults();
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
	// Make http request post
	var http = new XMLHttpRequest();
	http.open("POST", "post_data", true);
	http.setRequestHeader("Content-type", "application/json");
	http.send(JSON.stringify(dict));
	http.onreadystatechange = function () {
		if(http.readyState === XMLHttpRequest.DONE && http.status === 200) {
		var res = JSON.parse(http.responseText);
		var cost = res["cost"];
		var path = res["path"];
		costRes.innerHTML = cost;
		animateResult(path);
		}
	};
}

function animateResult(path) {
	var length = path.length;
	var i = 0;
	var func = setInterval(animate, 700);

	function animate() {
		if (i < length - 1) {
			var flightPlanCoordinates = [
				{
					lat: markers[path[i]-1].position.lat(), 
					lng: markers[path[i]-1].position.lng()
				},
				{
					lat: markers[path[i+1]-1].position.lat(), 
					lng: markers[path[i+1]-1].position.lng()
				},
			];
			var flightPath = new google.maps.Polyline({
				path: flightPlanCoordinates,
				geodesic: true,
				strokeColor: '#FF9800',
				strokeOpacity: 1.0,
				strokeWeight: 3
			});
			flightPath.setMap(map);
			resPaths.push(flightPath);
			i++;
		} else {
			clearInterval(func);
			return;
		}

	}
}

function resetResults() {
	setMapResPathOnAll(null);
	resPaths = [];
}