<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang=""> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" lang=""> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" lang=""> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang=""> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>The Conditional Orchestra</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="apple-touch-icon" href="apple-touch-icon.png">
        <link rel="stylesheet" href="dist/styles/global.css">
    </head>
    <body>
        <!--[if lt IE 8]>
            <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
        <![endif]-->
        <main aria-role="main">
          <article>
              <!-- begin header -->
              <header class="article-header">
                <div class="wrapper">
                  <h1 class="page-heading">The Conditional Orchestra</h1>
                  <p class="intro">Using the weather conditions in your local area The Conditional Orchestra plays unique compositions all day every day.</p>
                </div>
              </header>
              <!-- end header -->

              <!-- begin body -->
              <div class="article-body">
                <button id="use-location-btn" class="cta">Play my weather</button>
                <div id="main-section" class="main-section">
                  <div id="core-content">
                    <div class="status-bar">
                      <div class="icon">
                        <?php include('includes/status-icons.php'); ?>
                      </div>
                      <p id="message-block"></p>
                    </div>
                    <div id="canvas-container" class="canvas-container"></div>
                  </div>
                </div>
                <form id="form-coords" style="display: none">
                  <h2>Enter your coordinates</h2>
                  <label for="lat">Lattiude</label>
                  <input type="text" id="lat">
                  <label for="long">Longitude</label>
                  <input type="text" id="long">
                  <button id="form-coords-btn">Submit</button>
                </form>
                <div class="controls">
                  <button id="full-screen">
                    <span class="icon">
                      <?php echo file_get_contents("img/full-screen.svg"); ?>
                    </span>
                    <span class="text">
                      View visuals
                    </span>
                  </button>
                </div>
                <div class="conditions-display">
                  <ul>
                    <li class="conditions-display-item">
                      <h2 class="conditions-display-item__heading">Temperature</h2>
                      <div class="icon">
                        <?php echo file_get_contents("img/temperature-icon.svg"); ?>
                      </div>
                      <p class="conditions-display-item__value" data-ref="temperature">
                        <span class="conditions-display-item__unit">C&deg;</span>
                      </p>
                    </li>
                    <li class="conditions-display-item">
                      <h2 class="conditions-display-item__heading">Cloud cover</h2>
                      <div class="icon">
                        <?php echo file_get_contents("img/cloud-cover-icon.svg"); ?>
                      </div>
                      <p class="conditions-display-item__value" data-ref="cloudCover">
                        <span class="conditions-display-item__unit">&percnt;</span>
                      </p>
                    </li>
                    <li class="conditions-display-item">
                      <h2 class="conditions-display-item__heading">Air pressure</h2>
                      <div class="icon">
                        <?php echo file_get_contents("img/pressure-icon.svg"); ?>
                      </div>
                      <p class="conditions-display-item__value" data-ref="airPressure">
                        <span class="conditions-display-item__unit">Mbs</span>
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- end body -->
          </article>
        </main>
        <footer class="footer">
          <div class="wrapper">
            <ul class="tabs" data-directive="tabs">
              <li class="tabs_item">
                <a href="#help" data-behaviour="tab">Help</a>
              </li>
              <li class="tabs_item">
                <a href="#credits" data-behaviour="tab">Credits</a>
              </li>
              <li class="tabs_item">
                <a href="#source" data-behaviour="tab">Source</a>
              </li>
            </ul>
            <div class="tab" id="help">
              <p>If it can't find your location and you've not visited before nothing will play until you select "choose location"</p>
            </div>
            <div class="tab" id="credits">
              <h2>Credits</h2>
              <p>This project uses <a href="http://forecast.io/">Forecast.io</a> to obtain the weather data.</p>
              <p>The JavaScript library used to access the API can be found on <a href="https://github.com/iantearle/forecast.io-javascript-api">GitHub here</a>.</p>
              <p><a href="http://p5js.org/">P5.js</a> is used to generate the graphical interface and audio.</p>
              <p><a href="https://www.google.com/intx/en_uk/work/mapsearth/products/mapsapi.html">Google maps</a> is used to reverse Geocode the location information</p>
              <p>Musical Weathervane is written and maintained by <a href="https://github.com/rjbultitude">R.Bultitude</a></p>
            </div>
            <div class="tab" id="source">
              <p>This is an open source project. Download, fork or view the code here: </p>
            </div>
          </div>
        </footer>
        <script src="dist/scripts/app.js"></script>
    </body>
</html>
