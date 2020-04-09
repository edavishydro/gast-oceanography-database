import { data } from "./DocsJSON";
import makeDataTable from "./dataTable";

let column = null;
let InfoBox = null;

// This has to set the value of the column before the search function is performed
function displayRadioValue(value) {
  column = value;
  //alert(column);
}

/**
 * Setup the information box and display the specified HTML content
 * @param TheHTML - The HTML that will be placed in the box
 */
function SetupInfoBox(TheHTML) {
  if (InfoBox == null) {
    // if the box has not been created, create it
    let TheCanvasElement = TheMainContainer.GetElement(
      CMMainContainer.CANVAS_CONTAINER
    );
    InfoBox = document.createElement("DIV");
    InfoBox.className = "CM_InfoBox";

    TheCanvasElement.appendChild(InfoBox);
    CMUtilities.AbsolutePosition(InfoBox, 250, 5, 325, 25); //left, top, width, height
  }
  InfoBox.innerHTML = TheHTML;
}

//<!-- MAP SCRIPT-->
//<!--This script will create a map that will link locations with documents that study them -->

let TheMainContainer = null;

function init() {
  TheMainContainer = new CMMainContainer();

  // setup the folder that contains images for the icons in CanvasMap

  TheMainContainer.SetSetting(
    "MainContainer",
    "ImageFolder",
    "http://gsp.humboldt.edu/CanvasMap/Images/"
  ); // lets CanvasMap know where the images are

  //TheMainContainer.SetElement(CMMainContainer.TOOL_CONTAINER,null); // turn off the tool bar below the title
  //TheMainContainer.SetElement(CMMainContainer.NAVIGATION,null); // turn off the nagivation controls in the map
  TheMainContainer.SetElement(CMMainContainer.VERTICAL_TAB_CONTAINER, null); // turn off the tab controls to the upper right of the map
  TheMainContainer.SetElement(CMMainContainer.LAYER_LIST, null); // hide the list of layers that is below the tab controls
  TheMainContainer.SetElement(CMMainContainer.BACKGROUND_LIST, null); // hide the background list

  ///// This will remove all border tool features of the map
  //  To bring it back, change .CM_CanvasContainer in CanvasMap.css

  //TheMainContainer.SimpleMap();

  TheMainContainer.SetElement(CMMainContainer.SEARCH_PANEL, null); // hide the search panel
  TheMainContainer.SetElement(CMMainContainer.SETTINGS_PANEL, null); // hide the settings panel
  //TheMainContainer.SetElement(CMMainContainer.MAP_FOOTER,null); // hide the map footer at the bottom of the map

  // initialize the internal letiables within CanvasMap
  TheMainContainer.Initialize();

  // setup these letiables so we have them available
  let TheView = TheMainContainer.GetView();
  let TheScene = TheMainContainer.GetScene();

  // setup the projector to compute coordinates in Geographic
  let TheProjector = new CMProjectorGoogleMaps();
  TheProjector.SetZoomLevel(18); //changed from zoomlevel 17 to fix the coordinates
  TheMainContainer.SetProjector(TheProjector);

  //*****************************************************
  // Add the background layers

  let URLArray = [
    "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
    "https://c.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    "https://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg",
    "https://b.tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
    "https://tile.stamen.com/toner/{z}/{x}/{y}.png",
    "https://c.tile.stamen.com/watercolor/{z}/{x}/{y}.png",
    "https://b.tiles.mapbox.com/v3/jeffmerrick.map-tnw3k3na/{z}/{x}/{y}.png",
  ];

  let NameArray = [
    "Esri NatGeoWorldMap", //  'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
    "Esri World Imagery", //  'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    "OpenTopoMap", // Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)
    "OpenStreetMap BW", //<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>
    "ArcGIS World Topo",
    "Stamen",
    "Stamen Terrain",
    "Stamen Toner",
    "Stamen Watercolor",
    "CartoDB",
  ];

  let Index = 2;

  for (let i = 0; i < NameArray.length; i++) {
    let Layer_World = new CMLayerDataset();
    Layer_World.SetSetting("Item", "Name", NameArray[i]);

    TheMainContainer.AddBackground(Layer_World);

    //		Layer_World.SetURL(URLArray[i],CMDataset.PYRAMID_OPEN_FORMAT);  // OpenStreetMap Standard
    Layer_World.SetSetting("Dataset", "Format", CMDataset.PYRAMID_OPEN_FORMAT);
    Layer_World.SetSetting("Dataset", "URL", URLArray[i]);
    Layer_World.RequestData();
  }

  //*******************************************************************************
  //**********************************Layers***************************************
  //*******************************************************************************

  //****************************Labeled Marine Bodies******************************
  //****************************************************************************
  // add a GeoJSON Polygon layer - Labeled Marine Bodies
  // DATA SOURCE: Natural Earth

  let MarineBodies = new CMLayerDataset();
  MarineBodies.SetSetting("Item", "Name", "Marine Bodies");

  MarineBodies.SetSetting("Dataset", "URL", "OceanData/marine_polys2.js");
  MarineBodies.RequestData();

  MarineBodies.id = "MarineBodies";

  // Set the style for the layer
  MarineBodies.SetSetting("Style", "fillStyle", "rgba(255,255,250,.05)");
  MarineBodies.SetSetting("Style", "strokeStyle", "rgba(60,60,60,0.2)");
  MarineBodies.SetSetting("Style", "lineWidth", 2);

  MarineBodies.SetSetting(
    "MouseOverStyle",
    "fillStyle",
    "rgba(255,255,255,.2)"
  );
  MarineBodies.SetSetting("MouseOverStyle", "shadowBlur", "20");
  MarineBodies.SetSetting(
    "MouseOverStyle",
    "shadowColor",
    "rgba(255,255,255,.75)"
  );

  MarineBodies.SetSetting(
    "MouseOverStyle",
    "strokeStyle",
    "rgba(255,255,255,.2)"
  );
  MarineBodies.SetSetting("MouseOverStyle", "lineWidth", "1");

  TheMainContainer.AddLayer(MarineBodies);

  let OceanicBodies = MarineBodies;

  MarineBodies.Old_MouseOver = MarineBodies.MouseOver;
  // override the Layer's mouse down function to put information in the info box
  MarineBodies.MouseOver = function (TheView, RefX, RefY, FeatureIndex) {
    let result = this.Old_MouseOver(TheView, RefX, RefY, FeatureIndex);

    if (FeatureIndex != -1) {
      // -1 indicates no feature selected
      this.SetSelectedFeature(FeatureIndex);

      let TheDataset = this.GetDataset();

      // get the information for the information box
      let Name = TheDataset.GetAttributeCellByHeading("name", FeatureIndex);

      // convert the informatin to an HTML string
      let TheHTML = "<div>";
      TheHTML += "<a id='InfoBoxStyle'> Marine Body: " + Name + "</a>";
      TheHTML += "</div>";

      // set the HTML into the information box
      SetupInfoBox(TheHTML);
    }
    return result; // we always use the mouse down
  };

  //********************************Ocean Currents******************************
  //****************************************************************************
  // add a GeoJSON Polygon layer - Ocean Currents
  // DATA SOURCE: Data compiled by Maps.com from NOAA, National Weather Service, and the US Army
  // Description: Major wind driven ocean currents of the world, represented as polygons optimized for cartographic display with arrowheads at scales between 1:30,000,000 - 1:100,000,000. This layer is a copied subset of Major_Ocean_Currents_arrowPolys features whose SCALE = 30,000,000. Currents are color coded to indicate warm and cold currents. The ocean currents data was compiled from the NOAA National Weather Service map here: http://www.srh.noaa.gov/jetstream/ocean/currents_max.htm
  // https://www.arcgis.com/home/item.html?id=24bfd85e97b042948e6ed4928dc45a8b

  let Currents = new CMLayerDataset();

  Currents.SetSetting("Item", "Name", "Currents");
  Currents.SetSettingAttribute("Layer", "InfoText", "NAME");

  Currents.SetSetting("Layer", "ZoomToBoundsOnLoad", false);

  Currents.SetSetting("Dataset", "URL", "OceanData/Currents_Projected2.js");
  Currents.RequestData();
  TheMainContainer.AddLayer(Currents);

  for (let i = 0; i < 74; i++) {
    if (i > 28) {
      Currents.SetFeatureSetting(
        "Style",
        "fillStyle",
        i,
        "rgba(250,120,120,0.4)"
      ); // fill the data with red color
    } else {
      Currents.SetFeatureSetting(
        "Style",
        "fillStyle",
        i,
        "rgba(120,120,250,0.2)"
      ); // fill the data with blue color
    }
  }
  let OceanCurrents = Currents;

  //******************** West Coast Ocean Currents******************************
  //****************************************************************************
  // add a GeoJSON Polygon layer - WestCoast Ocean Currents (for zoom)
  // DATA SOURCE: Data compiled by Maps.com from NOAA, National Weather Service, and the US Army

  let WestUSCurrents = new CMLayerDataset();

  WestUSCurrents.SetSetting("Item", "Name", "WestUSCurrents");
  WestUSCurrents.SetSettingAttribute("Layer", "InfoText", "NAME");

  WestUSCurrents.SetSetting("Layer", "ZoomToBoundsOnLoad", true);
  WestUSCurrents.SetSetting(
    "Dataset",
    "URL",
    "OceanData/Currents_Projected_California.js"
  );
  WestUSCurrents.RequestData();

  WestUSCurrents.SetSettingGroup("Style", {
    fillStyle: "rgba(227,232,239,0.0)",
  }); // fill the data with pale green color

  TheMainContainer.AddLayer(WestUSCurrents);
  let WestNorthAmericanOceanCurrents = WestUSCurrents;

  //****************************************************************************
  // add the Document Locations
  //****************************************************************************
  let DocLocations = new CMLayerDataset();

  DocLocations.SetSetting("Item", "Name", "DocLocations");
  DocLocations.SetSettingAttribute("Layer", "InfoText", "Title");
  DocLocations.SetSettingAttribute("Layer", "Latitude", "lat");
  DocLocations.SetSettingAttribute("Layer", "Longitude", "long");

  DocLocations.SetSetting("Layer", "ZoomToBoundsOnLoad", false);
  DocLocations.SetSetting("Dataset", "URL", "OceanData/Docs_March2.js");
  DocLocations.RequestData();

  DocLocations.SetSettingGroup("Style", { fillStyle: "rgba(227,50,50,0.7)" }); // fill the data with pale green color
  DocLocations.SetSetting("Mark", "Type", CMLayer.MARK_CIRCLE);

  let pointSize = 10;

  DocLocations.SetSetting("Mark", "Size", pointSize);
  //DocLocations.SetSetting("Style",{fillStyle:"rgba(227,50,50,0.3)"});

  TheMainContainer.AddLayer(DocLocations);

  let DocumentLocations = DocLocations;

  DocLocations.MouseDown = function (TheView, RefX, RefY) {
    var Used = false; // flag to indicate if we have used the event

    if (this.GetVisible()) {
      // get the feature selected, if any

      var FeatureIndex = this.In(TheView, RefX, RefY);

      if (FeatureIndex != -1) {
        // -1 indicates no feature selected
        this.SetSelectedFeature(FeatureIndex);

        let lat = JSON.stringify(
          this.FeatureSettings[FeatureIndex].Layer.Latitude
        );
        let lon = JSON.stringify(
          this.FeatureSettings[FeatureIndex].Layer.Longitude
        );

        Used = true; // let the caller know we've used the event so no one else uses it

        getDocuments(lat, lon);
      }
    }

    return Used;
  };

  //#############################################################

  //*************************************************************
  //Gradicules//
  //*************************************************************

  let TheLayer = new CMLayerGraticule();
  TheLayer.SetSetting("Item", "Name", "Graticules");
  TheLayer.SetSetting("Border", "BorderWidth", 20);

  TheMainContainer.AddLayer(TheLayer);

  //#############################################################

  TheMainContainer.StartMap(false);

  SetupInfoBox("<a id='InfoBoxStyle'>Hover mouse for Marine Body Name</a>");
}

//broken call on mouse move
document.ondblclick = function ElementCoords() {
  if (column == 4) {
    let coordClass = document.getElementsByClassName("CM_MapCoordinates");
    let coordinates = coordClass[0].innerText;

    MoreCoords = coordinates.split(" ");

    console.log(MoreCoords[0]);
    console.log(MoreCoords[1]);
    console.log(MoreCoords[2]);
    console.log(MoreCoords[3]);

    lat1 = parseInt(MoreCoords[0].slice(0, -1));
    long1 = parseInt(MoreCoords[2].slice(0, -1));

    if (MoreCoords[1] == "S") {
      lat1 = lat1 * -1;
    }

    if (MoreCoords[3] == "W") {
      long1 = long1 * -1;
    }

    coordinatesFinal = long1 + "," + lat1;

    console.log(coordinatesFinal);

    //document.getElementById("demooo").innerHTML = coordinates; //this will appear under the discription text
    document.getElementById("myInput").value = coordinatesFinal;
  }
};

const getDocuments = (lat, lon) => {
  let results = [];
  data.forEach((doc) => {
    if (doc.lat === lat && doc.long === lon) {
      results.push(doc);
    }
  });
  makeDataTable(results);
};

window.onload = () => {
  init();
};
