

//<!-- SEARCH -->
//<!-- This script will read through .JSON data and construct a queryable HTML table from it -->
 //<script type="text/javascript">

var column = 0;
var InfoBox = null;

//Reads the HTML table created from the XML
function readTable() {
  // Declare variables 
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("dvCSV");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  // make i = 1 to start reading table below the header

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[column];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    } 
  } 
}	
	
// This has to set the value of the column before the search function is performed
function displayRadioValue(value) { 
	column= value;
	//alert(column);

} 


/**
* Setup the information box and display the specified HTML content
* @param TheHTML - The HTML that will be placed in the box
*/
function SetupInfoBox(TheHTML)
{
	if (InfoBox==null) // if the box has not been created, create it
	{
		var TheCanvasElement=TheMainContainer.GetElement(CMMainContainer.CANVAS_CONTAINER);
		InfoBox=document.createElement("DIV");
		InfoBox.className="CM_InfoBox";
		
		TheCanvasElement.appendChild(InfoBox);
		CMUtilities.AbsolutePosition(InfoBox,275,5,350,25);  //left, top, width, height
	}
	InfoBox.innerHTML=TheHTML;
}	


//<!-- MAP SCRIPT-->
//<!--This script will create a map that will link locations with documents that study them -->

var TheMainContainer=null;

function init()
{
	TheMainContainer=new CMMainContainer();
	
	// setup the folder that contains images for the icons in CanvasMap
	
	TheMainContainer.SetSetting("MainContainer","ImageFolder","http://gsp.humboldt.edu/CanvasMap/Images/"); // lets CanvasMap know where the images are

    //TheMainContainer.SetElement(CMMainContainer.TOOL_CONTAINER,null); // turn off the tool bar below the title
    //TheMainContainer.SetElement(CMMainContainer.NAVIGATION,null); // turn off the nagivation controls in the map
    TheMainContainer.SetElement(CMMainContainer.VERTICAL_TAB_CONTAINER,null); // turn off the tab controls to the upper right of the map
    TheMainContainer.SetElement(CMMainContainer.LAYER_LIST,null); // hide the list of layers that is below the tab controls
    TheMainContainer.SetElement(CMMainContainer.BACKGROUND_LIST,null); // hide the background list
    
	///// This will remove all border tool features of the map
	//  To bring it back, change .CM_CanvasContainer in CanvasMap.css 
	
	//TheMainContainer.SimpleMap();
	
    TheMainContainer.SetElement(CMMainContainer.SEARCH_PANEL,null); // hide the search panel
    TheMainContainer.SetElement(CMMainContainer.SETTINGS_PANEL,null); // hide the settings panel
    //TheMainContainer.SetElement(CMMainContainer.MAP_FOOTER,null); // hide the map footer at the bottom of the map
    
	
	// initialize the internal variables within CanvasMap
	TheMainContainer.Initialize();
	
	// setup these variables so we have them available
	var TheView=TheMainContainer.GetView();
	var TheScene=TheMainContainer.GetScene();
	
	// setup the projector to compute coordinates in Geographic
	var TheProjector=new CMProjectorGoogleMaps();
	TheProjector.SetZoomLevel(18);  //changed from zoomlevel 17 to fix the coordinates
	TheMainContainer.SetProjector(TheProjector);	

	//*****************************************************
	// Add the background layers 
	
	var URLArray=[
		'http://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		'http://b.tile.opentopomap.org/{z}/{x}/{y}.png',
		'http://c.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
		'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
		'http://b.tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
		'http://tile.stamen.com/toner/{z}/{x}/{y}.png',
		'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
		'http://b.tiles.mapbox.com/v3/jeffmerrick.map-tnw3k3na/{z}/{x}/{y}.png'
		];
	
	var NameArray=[
		'Esri NatGeoWorldMap', //  'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
		'Esri World Imagery', //  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		'OpenTopoMap', // Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)
		'OpenStreetMap BW', //<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
		'ArcGIS World Topo',
		'Stamen',
		'Stamen Terrain',
		'Stamen Toner',
		'Stamen Watercolor',
		'CartoDB'
	];
	
	var Index=2;
	
	for (var i=0;i<NameArray.length;i++)
	{
		var Layer_World=new CMLayerDataset();
		Layer_World.SetSetting("Item","Name",NameArray[i]); 
		
		TheMainContainer.AddBackground(Layer_World);
		
//		Layer_World.SetURL(URLArray[i],CMDataset.PYRAMID_OPEN_FORMAT);  // OpenStreetMap Standard
		Layer_World.SetSetting("Dataset","Format",CMDataset.PYRAMID_OPEN_FORMAT);
		Layer_World.SetSetting("Dataset","URL",URLArray[i]);
		Layer_World.RequestData();
	}
 
//*******************************************************************************
//**********************************Layers***************************************
//*******************************************************************************

	//****************************Labeled Marine Bodies******************************
	//****************************************************************************
	// add a GeoJSON Polygon layer - Labeled Marine Bodies
	// DATA SOURCE: Natural Earth
	
	var MarineBodies=new CMLayerDataset();
	MarineBodies.SetSetting("Item","Name","Marine Bodies");
	
	MarineBodies.SetSetting("Dataset","URL","OceanData/marine_polys2.js");
	MarineBodies.RequestData();

    MarineBodies.id="MarineBodies";
    
	// Set the style for the layer
	MarineBodies.SetSetting("Style","fillStyle","rgba(255,255,250,.05)");
	MarineBodies.SetSetting("Style","strokeStyle","rgba(60,60,60,0.2)");
	MarineBodies.SetSetting("Style","lineWidth",2);
	
	MarineBodies.SetSetting("MouseOverStyle","fillStyle","rgba(255,255,255,.2)");
	MarineBodies.SetSetting("MouseOverStyle","shadowBlur","20");
	MarineBodies.SetSetting("MouseOverStyle","shadowColor","rgba(255,255,255,.75)");
	
	MarineBodies.SetSetting("MouseOverStyle","strokeStyle","rgba(255,255,255,.2)");
	MarineBodies.SetSetting("MouseOverStyle","lineWidth","1");	

	TheMainContainer.AddLayer(MarineBodies);
	
	OceanicBodies=MarineBodies;
	
	MarineBodies.Old_MouseOver = MarineBodies.MouseOver;
	// override the Layer's mouse down function to put information in the info box
	MarineBodies.MouseOver=function(TheView,RefX,RefY,FeatureIndex) 
	{
		result=this.Old_MouseOver(TheView,RefX,RefY,FeatureIndex);
		
		if (FeatureIndex!=-1) // -1 indicates no feature selected
		{
			this.SetSelectedFeature(FeatureIndex);
			
			var TheDataset=this.GetDataset();
					
			// get the information for the information box
			var Name=TheDataset.GetAttributeCellByHeading("name",FeatureIndex);

			// convert the informatin to an HTML string
			var TheHTML="<div>";
			TheHTML+="<a id='InfoBoxStyle'> Marine Body: "+ Name +"</a>";
			TheHTML+="</div>";
			
			// set the HTML into the information box
			SetupInfoBox(TheHTML);
		}
		return(result); // we always use the mouse down
	};
	
//********************************Ocean Currents******************************
//****************************************************************************
// add a GeoJSON Polygon layer - Ocean Currents
// DATA SOURCE: Data compiled by Maps.com from NOAA, National Weather Service, and the US Army
// Description: Major wind driven ocean currents of the world, represented as polygons optimized for cartographic display with arrowheads at scales between 1:30,000,000 - 1:100,000,000. This layer is a copied subset of Major_Ocean_Currents_arrowPolys features whose SCALE = 30,000,000. Currents are color coded to indicate warm and cold currents. The ocean currents data was compiled from the NOAA National Weather Service map here: http://www.srh.noaa.gov/jetstream/ocean/currents_max.htm
// https://www.arcgis.com/home/item.html?id=24bfd85e97b042948e6ed4928dc45a8b
	
	var Currents = new CMLayerDataset();
	
	Currents.SetSetting("Item","Name","Currents");
    Currents.SetSettingAttribute("Layer","InfoText","NAME");
	
	Currents.SetSetting("Layer","ZoomToBoundsOnLoad",false); 
	
	Currents.SetSetting("Dataset","URL","OceanData/Currents_Projected2.js");
	Currents.RequestData();
	TheMainContainer.AddLayer(Currents);
	
	for (var i=0;i<74;i++)
	{
		if ( i > 28 ) {
			Currents.SetFeatureSetting("Style","fillStyle",i,"rgba(250,120,120,0.4)"); // fill the data with red color
		}
		else {
			Currents.SetFeatureSetting("Style","fillStyle",i,"rgba(120,120,250,0.2)"); // fill the data with blue color
		}
	}
	OceanCurrents=Currents;
	
//******************** West Coast Ocean Currents******************************
//****************************************************************************
// add a GeoJSON Polygon layer - WestCoast Ocean Currents (for zoom)
// DATA SOURCE: Data compiled by Maps.com from NOAA, National Weather Service, and the US Army	
	
	var WestUSCurrents=new CMLayerDataset();

	WestUSCurrents.SetSetting("Item","Name","WestUSCurrents");
    WestUSCurrents.SetSettingAttribute("Layer","InfoText","NAME");

	WestUSCurrents.SetSetting("Layer","ZoomToBoundsOnLoad",true); 
	WestUSCurrents.SetSetting("Dataset","URL","OceanData/Currents_Projected_California.js");
	WestUSCurrents.RequestData();

	WestUSCurrents.SetSettingGroup("Style",{fillStyle:"rgba(227,232,239,0.0)"}); // fill the data with pale green color

	TheMainContainer.AddLayer(WestUSCurrents);
	WestNorthAmericanOceanCurrents=WestUSCurrents;	
	

//****************************************************************************
// add the Document Locations 
//****************************************************************************
	var DocLocations=new CMLayerDataset();

	DocLocations.SetSetting("Item","Name","DocLocations");
    DocLocations.SetSettingAttribute("Layer","InfoText","Title");
	

	DocLocations.SetSetting("Layer","ZoomToBoundsOnLoad",false); 
	DocLocations.SetSetting("Dataset","URL","OceanData/Docs_March2.js");
	DocLocations.RequestData();
	
	
	DocLocations.SetSettingGroup("Style",{fillStyle:"rgba(227,50,50,0.7)"}); // fill the data with pale green color
	DocLocations.SetSetting("Mark","Type",CMLayer.MARK_CIRCLE);
	
	var pointSize = 10
	
	DocLocations.SetSetting("Mark","Size",pointSize);	
	//DocLocations.SetSetting("Style",{fillStyle:"rgba(227,50,50,0.3)"});

	TheMainContainer.AddLayer(DocLocations);
	
	DocumentLocations=DocLocations;	
	
//#############################################################	
	
//*************************************************************
//Gradicules//
//*************************************************************
		 
	var TheLayer=new CMLayerGraticule();
	TheLayer.SetSetting("Item","Name","Graticules");
	TheLayer.SetSetting("Border","BorderWidth",20);
	 
	TheMainContainer.AddLayer(TheLayer);
	
	
//#############################################################	

	TheMainContainer.StartMap(false);
	
	SetupInfoBox("<a id='InfoBoxStyle'>Hover mouse for Marine Body Name</a>")
}

//broken call on mouse move
document.ondblclick = function ElementCoords() {
  
  if (column == 4){
	
	  var coordClass = document.getElementsByClassName("CM_MapCoordinates");
	  var coordinates = coordClass[0].innerText;
	  
	  MoreCoords = coordinates.split(" ");
	  
	  console.log(MoreCoords[0]);
	  console.log(MoreCoords[1]);
	  console.log(MoreCoords[2]);
	  console.log(MoreCoords[3]);  
	  
	  lat1 = parseInt(MoreCoords[0].slice(0,-1));
	  long1 = parseInt(MoreCoords[2].slice(0,-1));
	  
	  if (MoreCoords[1] == "S"){
	  lat1 = lat1*-1
	  }
	  
	  if (MoreCoords[3] == "W"){
	  long1 = long1*-1
	  }
	  
	  coordinatesFinal = long1 +","+lat1;

	  console.log(coordinatesFinal);
  
	  //document.getElementById("demooo").innerHTML = coordinates; //this will appear under the discription text
	  document.getElementById("myInput").value = coordinatesFinal;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////

document.onreadystatechange = function(){
     if(document.readyState === 'complete'){
         

		function setCoordinates(){
		var Long = document.getElementById("Long").value;
		var Lat = document.getElementById("Lat").value;

		var radius = 20;

		locationRange(Long,Lat)
			function locationRange(Long, Lat){
				
				var test = Long - Lat
				
				console.log(test)

				document.getElementById("coordinate").innerHTML = test;	
			}
		}

		function CreateTableFromJSON() {

			var docArray = null;   //This is IMPORTANT
			$.ajax({
				'async': false,
				'global': false,
				'url': "/document_Info.json",
				'dataType': "json",
				'success': function (data) {
					docArray = data;
				}
			});

			// EXTRACT VALUE FOR HTML HEADER. 
			var col = [];
			//for (var i = 0; i < docArray.length; i++) {
			for (var i = 0; i < docArray.length; i++) {
				for (var key in docArray[i]) {
					if (col.indexOf(key) === -1) {
						col.push(key);
					}
				}
			};

			// CREATE DYNAMIC TABLE.
			var table = document.createElement("table");

			// CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

			var tr = table.insertRow(-1);                   // TABLE ROW.
			
			var th = document.createElement("th");
			th.innerHTML = "Select";
			tr.appendChild(th);
			
			var th = document.createElement("th");
			th.innerHTML = col[0];
			tr.appendChild(th);
			
			var th = document.createElement("th");
			th.innerHTML = col[1];
			tr.appendChild(th);
			
			var th = document.createElement("th");
			th.innerHTML = col[2];
			tr.appendChild(th);
			
			// ***Coordinates ***
			var th = document.createElement("th");
			th.innerHTML = "Longitude,Latitude";
			tr.appendChild(th);
			
			
			// ADD JSON DATA TO THE TABLE AS ROWS.
			for (var i = 0; i < docArray.length; i++) {
				
				tr = table.insertRow(-1);
				
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = "<input type='checkbox' id='myCheck' onmouseup='captureDoc()'><span class='checkmark'></span>"
				
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = docArray[i][col[0]];
				
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = docArray[i][col[1]];
				
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = docArray[i][col[2]];
				
				//  *** Coordinates ***
				//var tabCell = tr.insertCell(-1);
				var tabCell = tr.insertCell(-1);
				tabCell.innerHTML = docArray[i][col[3]]+ "," +docArray[i][col[4]];

			};

			// FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
			var divContainer = document.getElementById("dvCSV");
			divContainer.innerHTML = "";
			divContainer.appendChild(table);
			
		}

		CreateTableFromJSON()	
			


		var domString = '<table><tr><th>Select</th><th>FID</th><th>Year</th><th>Author</th><th>Title</th><th>Location</th></tr></table>';

		function captureDoc() {
			//$(document).ready(function(){
			
				$("#myCheck").click(function() {                             //Select ID myCheck and on click perform this function
				var $td = $(this).closest('tr').children("td");              //Select the closest tr of the td then creates list of children tds
					//$td = $td.shift(),                                       //removes first element of the array
					len = $td.length;		                                 //finds length of the selected children 
				var tableData = $td.map(function(i) {	                     // makes a new jQuery object
					//return $this.text()                                    //
					
					if(i < len)                                              //
						return $(this).text();                               //
						
				}).get();
				
				tableData = JSON.stringify(tableData);
				//tableData = tableData.splice(0,1);
				
				$('#SelectedDocs').append(tableData);
				
				console.log(tableData);
				
				return tableData;
				
				docCartTable();
			});
		};


		/* MODAL SCRIPT */
		/* this script is at the end of the HTML because it needs to be loaded first for the script to work */
		/* The Modal (background) */

		// Get the modal
		var modal = document.getElementById("myModal");

		// Get the button that opens the modal
		var btn = document.getElementById("myBtn");

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on the button, open the modal
		btn.onclick = function() {
		  modal.style.display = "block";
		}

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
		  modal.style.display = "none";
		}

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
		  if (event.target == modal) {
			modal.style.display = "none";
		  }
		}
	}
}