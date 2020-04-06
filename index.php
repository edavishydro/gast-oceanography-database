<?php
?>

<html>
<head><meta http-equiv="Content-Type" content="text/html; charset=us-ascii">
	<title>Oceanography Research</title>
	<script>
//***************************************************************************
// Web-based mapping solution
//
// To change the map layers:
// 1. add to "ItemsToLoad" below
// 2. change the bounds in StartMap()
//***************************************************************************

</script>
<script src="/Libraries/jquery-3.4.1.min.js"></script>
<script src="/Libraries/turf.min.js"></script>
<script src="/Libraries/CanvasMap.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.4.5/fuse.min.js" charset="utf-8"></script>

<link href="/Libraries/bulma.css" rel="stylesheet" type="text/css"></link>
<link href="/CanvasMapStyle.css" rel="stylesheet" type="text/css"></link>
<!--<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.0/css/bulma.min.css">
-->
<link  href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" rel="stylesheet" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">


<style>
/* Modal stylings are set here  */
/* The Modal (background) */

.modal {
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 65%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

tr {
  /* Add a bottom border to all table rows */
  border-bottom: 1px solid #ddd;
}

/* Sets the initial style of the InfoBox */
#InfoBoxStyle {
 /* background-color: red;  #use this to visualize the background of the text */
 font-size: 18px;
 margin: 12px;

}
<!-- TopNAV -->

/* Add a black background color to the top navigation */
.topnav {
  background-color: black;
  overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {

 float: left;
  padding: 12px;
  color: black;
  text-decoration: none;
  font-size: 17px;
  width: 24%; /* Four equal-width links. If you have two links, use 50%, and 33.33% for three links, etc.. */
  text-align: center; /* If you want the text to be centered */
  border-style: solid;
  border-color: black;
  border-width: 2px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.topnav a.active {
  background-color: darkgrey;
  color: black;
}
/* When the screen is less than 600 pixels wide, hide all links, except for the first one ("Home"). Show the link that contains should open and close the topnav (.icon) */
@media screen and (max-width: 600px) {
  .topnav a:not(:first-child) {display: none;}
  .topnav a.icon {
    float: right;
    display: block;
  }
}

/* The "responsive" class is added to the topnav with JavaScript when the user clicks on the icon. This class makes the topnav look good on small screens (display the links vertically instead of horizontally) */
@media screen and (max-width: 600px) {
  .topnav.responsive {position: relative;}
  .topnav.responsive a.icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  .topnav.responsive a {
    float: none;
    display: block;
    text-align: left;
  }
}
</style>
</head>

<!-- ********************************************************** -->
<!-- Start of HTML -->
<!-- ********************************************************** -->
<!--- body tag should call a function to initialize the map -->
<body onload="init()" style="background-color:white;"><!-- This will appear above the map --><!--<h1 style="text-align: center;">Salmon of the Klamath</h1> --><!-- This text must also be positioned absolutely so it appears below instead of behind the map -->
	<div class="topnav" style=" margin: auto; display: relative;">
	  <a  href="http://tgaec.com" style="background-color: black; color:white;"><b>TGAEC Home Page</b></a>
	  <a  class="active" href="#home">Oceanography Database</a>
	  <a  href="#contact">How to Use this tool</a>
	  <a  id="myBtn" >Document Cart</a>
	</div>

	<div style="width:100%; margin:0px; background-color: white;" > <!-- Try this:  width:80%;margin: auto; -->
		<div style="background-color: rgb(224, 226, 229);">
			<div>
			<table>
			<tr>

			<td>
				<!-- BUTTON THAT TRIGGERS THE MODAL BOX -->

				<div>
					<h1 class="is-size-3" style="text-align:center; margin:auto;padding-top:5px;">Gast Oceanography Collection</h1>

					<p style="padding-left:80px; padding-right:80px; min-height:30px; position:block;">This map is a geolibrary that contains decades of oceanography research from the personal collection of Humboldt State University Professor James Gast.
				In addition to teaching oceanography for over 30 years, Professor Gast served as the founding director of the Telonicher Marine Laboratory in Trinidad, California from 1964 - 1970. (http://www.hsumarinelab.org/lab-history).

				</div>

			</div>
			</td>
			<!--
			<td style="width:300px">
				<div>
					<button id="myBtn" style=" top:10px; right:10px; margin:15px; min-width: 300px; min-height:90px; position:relative; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">
						<div>
							<h3> Document Cart </h3>
							<p> Click here to review requested documents</p>
						</div>
					</button>
				</div>
			</td>
			-->
		</tr>
	</table>
			<!-- MODAL BOX WITH DOCUMENT CART HERE -->
				<!-- The Modal -->
	<div id="myModal" class="modal" style="display:none;z-index:10;">

	<!-- Modal content -->
	<div class="modal-content">
		<span class="close">&times;</span>

		<!-- This is going to be the contents of the Document cart -->
		<div>
			<h3> Review Selected Documents </h3>
			<div class="container">
				<div style="border: 2px darkgrey solid; padding:5px;">
					<form name="requestForm" action="index.html" method="get" id="requestForm">
					  <div class="field">
						<label class="label">Full Name</label>
						<div class="control has-icons-left has-icons-right">
						  <input class="input request" type="text" placeholder="Enter your full name" name="fullName" required>
						  <span class="icon is-small is-left">
							<i class="fas fa-user"></i>
						  </span>
						</div>
					  </div>

					  <div class="field">
						<label class="label">Email</label>
						<div class="control has-icons-left has-icons-right">
						  <input class="input request" type="email" placeholder="Enter your email" name="email" required>
						  <span class="icon is-small is-left">
							<i class="fas fa-envelope"></i>
						  </span>
						</div>
					  </div>

					  <div class="field">
						<label class="label">Affiliation</label>
							<div class="control">
							  <div class="select">
								<select name="affiliation" required>
								  <option value="" selected>Select dropdown</option>
								  <option value="Academic">Academic</option>
								  <option value="Government">Government</option>
								  <option value="Private">Private Industry</option>
								</select>
							  </div>
							</div>
						  </div>
						  <div class="field is-grouped">
							<div class="control">
							  <input type="submit" class="button is-link" value="Send request"></input>
							</div>
							<div class="control">
							  <button class="button is-link is-light">Cancel</button>
							</div>
						  </div>
						</form>
						<pre id="output"></pre>

						<table>

							<h1 class="is-size-2"> Shopping Cart </h1>
							<div id="cart" class="table-container"></div>
						</table>
						<!-- selected document data will be appended here inside of <td> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

	<!-- TABLE CONTAINING MAIN CONTENT -->
	<div style="padding-top:5px;">
		<table style="width:96%; border: 1px solid black; background-color: rgb(224, 226, 229); margin:auto; position:inherit; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">
			<tbody>
				<tr >
					<!-- Map content -->
					<td style="width: 50%; height: 100%; border: 1px solid black;">
						<div id="test" style="width: 100%;"><!-- This is the container for the map. -->
							<div id="CM_MapContainer_0" style="float:left;">
							</div>
						</div>
					</td>
					<!-- Search bar Items -->
					<td style="width:50%; min-width:400px; max-width:800px;">
						<div>
							<div style="background: lightgrey;text-align: center; margin:auto; position: inherit;">

								<!-- From w3 schools: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_searchbar -->
								<h1 class="is-size-3">Search through Documents</h1>
								<input class="input" type="text" placeholder="Text input", onkeydown="fusesearch(this.value)" id="fusefield">

								</div>

							<!-- JSON will be read in here and converted to the HTML table -->

							<div  style="height: 650px; float:right; display:inline-block; > <!-- make scrollable -->
								        <h1 class="is-size-4" style="margin: auto; text-align: center"> Search Results </h1>
										<div id="clicky" class="table-container" style="height:650px;overflow-y:auto;""></div>

								<!--<table id="dvCSV"> </table>-->
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
<!-- <p style="padding:12px">Map Data Sources: Natural Earth, Maps.com, and WWF</p> -->
</div>

<!-- <p style="text-align: center;"><a href="http://www.tgaec.com/"><b>Thomas Gast & Associates Environmental Consultants | 2020 </b></a></p> -->
<!--<p>Data from:USGS and US Census</p>-->

<script src="Map_JS.js"></script>

</body>
</html>
