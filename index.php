<?php
//Silence is golden 
?>
<html>
<head><meta http-equiv="Content-Type" content="text/html; charset=us-ascii">
	<title>Oceanography Research</title>
	<script src="/Libraries/jquery-3.4.1.min.js"></script>
	<script src="/Libraries/turf.min.js"></script>
	<script src="/Libraries/CanvasMap.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.4.5/fuse.min.js" charset="utf-8"></script>

	<link  href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" rel="stylesheet" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
	<link href="/styles/bulma.css" rel="stylesheet" type="text/css"></link>
	<link href="/styles/CanvasMapStyle.css" rel="stylesheet" type="text/css"></link> 
	<link href="/styles/main.css" rel="stylesheet" type="text/css"></link>
	
</head>

<!-- ********************************************************** -->
<!-- Start of HTML -->
<!-- ********************************************************** -->
<body>
	<nav class="navbar is-dark has-navbar-fixed-top" role="navigation" aria-label="main navigation">

		<div class="navbar-brand">
			<p class="navbar-item is-size-3-desktop">Gast Oceanography Collection</p>
			<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarMain">
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
			  </a>
		</div>

		<div id="navbarMain" class="navbar-menu">
			<p class="navbar-start">
				<a href="#" class="navbar-item">Background</a>
				<a href="#" class="navbar-item">Instructions</a>
				<a href="#" class="navbar-item">TGAEC Home Page</a>
			</p>
			<div class="navbar-end">
				<div class="navbar-item">
					<div class="buttons">
						<a href="#" class="button is-primary" id="myBtn">Document Cart</a>
					</div>
				</div>
			</div>
		</div>
	</nav>
<main>
	<div class="container">
<!--TOP CONTENT-->
		<div>
			<h1 class="is-size-3" style="text-align:center; margin:auto;padding-top:5px;">Gast Oceanography Collection</h1>
			
			<p style="padding-left:80px; padding-right:80px; min-height:30px; position:block;">This map is a geolibrary that contains decades of oceanography research from the personal collection of Humboldt State University Professor James Gast.
		In addition to teaching oceanography for over 30 years, Professor Gast served as the founding director of the Telonicher Marine Laboratory in Trinidad, California from 1964 - 1970. (http://www.hsumarinelab.org/lab-history).
			
		</div>
<!--MODAL-->
		<div class="modal" id="myModal">
			<div class="modal-background"></div>
			<div class="modal-card">
			  <header class="modal-card-head">
				<p class="modal-card-title">Document Shopping Cart</p>
				<button class="delete close" aria-label="close"></button>
			  </header>
			  <section class="modal-card-body">
				<div>
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
						  <h1 class="is-size-2"> Shopping Cart </h1>
							<div id="cart" class="table-container"></div>
			  </section>
			  <footer class="modal-card-foot">
				<button class="button is-success" type="submit" form="requestForm">Checkout</button>
				<button class="button" type="button" id="cancel">Cancel</button>
			  </footer>
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
								<input class="input" type="text" placeholder="Text input" id="fusefield">

								</div>
							
							<!-- JSON will be read in here and converted to the HTML table -->		

							<div  style="height: 650px; display:inline-block;"> <!-- make scrollable -->
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
</div>
</main>

<script src="/dist/app.bundle.js"></script>
<script src="/dist/1.bundle.js"></script>
</body>
</html>