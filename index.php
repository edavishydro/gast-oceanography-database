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
	<nav class="navbar is-dark has-navbar-fixed-top is-bold" role="navigation" aria-label="main navigation">

		<div class="navbar-brand">
			<p class="navbar-item is-size-3-desktop">Gast Oceanography Collection</p>
			<a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarMain">
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
			  </a>
		</div>

		<div id="navbarMain" class="navbar-menu">
			<div class="navbar-start">
				<div class="navbar-item has-dropdown is-hoverable is-mega">
					<a class="navbar-link">
					  Project Background
					</a>
					<div class="navbar-dropdown">
					  <div class="hero is-large is-info is-bold">
						  <div class="hero-body">
							  <div class="container">
								  <h1 class="title">Project Background</h1>
								  <p class="subtitle">
									This map is a geolibrary that contains decades of oceanography research from the personal collection of Humboldt State University Professor James Gast.
									In addition to teaching oceanography for over 30 years, Professor Gast served as the founding director of the Telonicher Marine Laboratory in Trinidad, California from 1964 - 1970. (http://www.hsumarinelab.org/lab-history).
								  </p>
							  </div>
						  </div>
					  </div>
					</div>
				  </div>
				<a href="#" class="navbar-item">User Instructions</a>
				<a href="#" class="navbar-item">TGAEC Home Page</a>
				</div>
			<div class="navbar-end">
				<div class="navbar-item">
					<div class="buttons">
						<a href="#" class="button is-info" id="myBtn">Document Cart</a>
					</div>
				</div>
			</div>
		</div>
	</nav>

<main>
	<div class="container">
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
				<button class="button is-primary" type="submit" form="requestForm">Checkout</button>
				<button class="button" type="button" id="cancel">Cancel</button>
			  </footer>
			</div>
		  </div>
	</div>

<section class="section has-background-light" id="mapData">
	<div class="container">
		<div class="columns">
			<!-- TABLE CONTAINING MAIN CONTENT -->
			<div id="mapColumn" class="column is-three-fifths"><!-- This is the container for the map. -->
				<div id="CM_MapContainer_0"></div>
			</div>
			<div class="column results-column">
				<!-- Search bar Items -->
				<div>
					<h1 class="is-size-3">Search through Documents</h1>
					<p class="control has-icons-left">
						<input class="input" type="text" placeholder="Search" id="fusefield">
						<span class="icon is-left">
						  <i class="fas fa-search" aria-hidden="true"></i>
						</span>
					  </p>
				</div>
				
				<!-- JSON will be read in here and converted to the HTML table -->		
				<div> 
					<h1 class="is-size-4" style="margin: auto; text-align: center"> Search Results </h1>
					<div id="clicky" class="table-container" style="max-height:670px; overflow-y: auto;"></div>
				</div>
				</div>
			</div>
	</div>
</section>
<section class="footer has-background-dark">
	<p class="has-text-grey-light">footerrrrr</p>
</section>
</main>

<script src="/dist/app.bundle.js"></script>
<script src="/dist/1.bundle.js"></script>
</body>
</html>