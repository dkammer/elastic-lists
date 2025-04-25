---
layout: default 
---
<div class="container my-4">
  <h2 class="fw-semibold text-dark">
    Nobel Prize Winners
  </h2>
</div>

<div class="container">
	<br/>
	<div class="row" id="main"></div>
	<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
	<script src="{{ 'assets/js/data.js' | absolute_url }}"></script>
	<script src="{{ 'dist/elastic-list.js' | absolute_url }}"></script>
	<script src="{{ 'assets/js/simple.js' | absolute_url }}"></script>
	<link href="{{ 'dist/elastic-list.css' | absolute_url }}" rel="stylesheet">
  <div id="results" class="container mt-5">
    <!-- Filtered results will be appended here. -->
    <div id="results-row" class="row">
      <!-- Cards will be placed in columns by Bootstrap -->
    </div>
  </div>
</div>