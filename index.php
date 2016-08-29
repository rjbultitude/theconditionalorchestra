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
        <!-- begin main -->
        <main id="main" aria-label="Content">
          <!-- begin article -->
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
                <div class="wrapper">
                  <!-- begin forms -->
                  <div class="form-section section">
                    <div class="form-user-location" data-ref="form-user-location">
                      <button id="use-location-btn" class="cta" aria-controls="message-block">Play my weather</button>
                      <a href="#form-coords" id="link-location-select">Or choose another location</a>
                    </div>
                    <form class="form-coords inactive" id="form-coords" data-ref="form-coords">
                      <h2 class="form-coords__legend">Enter a place</h2>
                      <label for="place">place</label>
                      <input type="text" id="place" data-ref="place-field">
                      <button class="cta" id="form-coords-btn" data-ref="submit" aria-controls="message-block">Play</button>
                      <button class="button-close" data-ref="close">
                        <span class="text">
                          Close
                        </span>
                        <span class="icon">
                          <?php echo file_get_contents("img/close-icon.svg"); ?>
                        </span>
                      </button>
                    </form>
                  </div>
                  <!-- end forms -->

                  <!-- Begin message & icon block -->
                  <section id="main-section" class="main-section section">
                    <div id="core-content">
                      <div class="status-bar">
                        <div class="icons-block">
                          <?php include('includes/status-icons.php'); ?>
                        </div>
                        <p id="message-block" aria-live="polite">Loading...</p>
                      </div>
                    </div>
                  </section>
                  <!-- End message & icon block -->

                  <!-- Begin conditions display -->
                  <div class="conditions-display section">
                    <ul class="conditions-display__list">
                      <li class="conditions-display__item">
                        <h2 class="conditions-display__heading">Temperature</h2>
                        <div class="conditions-display__icon">
                          <?php echo file_get_contents("img/temperature-icon.svg"); ?>
                        </div>
                        <p class="conditions-display__value" data-ref="temperature">
                          <span data-ref="value"></span>
                          <span class="conditions-display__unit">C&deg;</span>
                        </p>
                      </li>
                      <li class="conditions-display__item">
                        <h2 class="conditions-display__heading">Cloud cover</h2>
                        <div class="conditions-display__icon">
                          <?php echo file_get_contents("img/cloud-cover-icon.svg"); ?>
                        </div>
                        <p class="conditions-display__value" data-ref="cloudCover">
                          <span data-ref="value"></span>
                          <span class="conditions-display__unit">&percnt;</span>
                        </p>
                      </li>
                      <li class="conditions-display__item">
                        <h2 class="conditions-display__heading">Air pressure</h2>
                        <div class="conditions-display__icon">
                          <?php echo file_get_contents("img/pressure-icon.svg"); ?>
                        </div>
                        <p class="conditions-display__value" data-ref="airPressure">
                          <span data-ref="value"></span>
                          <span class="conditions-display__unit">Mbs</span>
                        </p>
                      </li>
                    </ul>
                  </div>
                  <!-- End conditions display -->

                  <!-- Begin controls -->
                  <div class="controls-section section" data-ref="controls">
                    <button class="cta" type="button" data-a11y-dialog-show="visuals-dialog">
                      <span class="text">
                        Show visualiser
                      </span>
                      <span class="icon">
                        <?php echo file_get_contents("img/full-screen.svg"); ?>
                      </span>
                    </button>
                  </div>
                  <!-- End controls -->
                </div>
              </div>
              <!-- end body -->
          </article>
          <!-- end article -->
        </main>
        <!-- end main -->
        <!-- begin footer -->
        <footer class="footer">
          <div class="wrapper">
            <div class="tab__panel" id="help" data-ref="tab-panel">
              <h2 class="tab__heading">Help</h2>
              <p>If it can't find your location ensure you've clicked 'allow' when the browser asks to use your location".</p>
              <p>If it still doesn't work try using the "choose another location form where youcan enter any location you like.</p>
              <button class="button-close" data-ref="tab-close">
                <span class="text">
                  Close
                </span>
                <span class="icon">
                  <?php echo file_get_contents("img/close-icon.svg"); ?>
                </span>
              </button>
            </div>
            <div class="tab__panel" id="credits" data-ref="tab-panel">
              <h2 class="tab__heading">Credits</h2>
              <p>This project uses <a href="http://forecast.io/">Forecast.io</a> to obtain the weather data.</p>
              <p>The JavaScript library used to access the API can be found on <a href="https://github.com/iantearle/forecast.io-javascript-api">GitHub here</a>.</p>
              <p><a href="http://p5js.org/">P5.js</a> is used to generate the graphical interface and audio.</p>
              <p><a href="https://www.google.com/intx/en_uk/work/mapsearth/products/mapsapi.html">Google maps</a> is used to reverse Geocode the location information</p>
              <p>The Conditional Orchestra is written and maintained by <a href="https://github.com/rjbultitude">R.Bultitude</a></p>
              <button class="button-close" data-ref="tab-close">
                <span class="text">
                  Close
                </span>
                <span class="icon">
                  <?php echo file_get_contents("img/close-icon.svg"); ?>
                </span>
              </button>
            </div>
            <div class="tab__panel" id="source" data-ref="tab-panel">
              <h2 class="tab__heading">Source</h2>
              <p>This is an open source project. Download, fork or view the code here: <a href="https://github.com/rjbultitude/theconditionalorchestra">github.com/rjbultitude/theconditionalorchestra</a></p>
              <button class="button-close" data-ref="tab-close">
                <span class="text">
                  Close
                </span>
                <span class="icon">
                  <?php echo file_get_contents("img/close-icon.svg"); ?>
                </span>
              </button>
            </div>
            <ul class="tabs" data-directive="tabs">
              <li class="tabs__item">
                <a href="#help" data-behaviour="tab">Help</a>
              </li>
              <li class="tabs__item">
                <a href="#credits" data-behaviour="tab">Credits</a>
              </li>
              <li class="tabs__item">
                <a href="#source" data-behaviour="tab">Source</a>
              </li>
            </ul>
          </div>
        </footer>
        <!-- end footer -->

        <!-- Begin modal/dialog box -->
        <section id="visuals-dialog" aria-hidden="true" class="dialog">
          <div tabindex="-1" data-a11y-dialog-hide class="dialog-overlay"></div>
          <div role="dialog" class="dialog-content">
            <div id="canvas-container" class="canvas-container" role="document"></div>
            <button class="button-close" id="close-full-screen" type="button" data-a11y-dialog-hide aria-label="Close this dialog window">
              <span class="text">
                Close
              </span>
              <span class="icon">
                <?php echo file_get_contents("img/close-icon.svg"); ?>
              </span>
            </button>
          </div>
        </section>
        <!-- end modal/dialog box -->
        <script src="dist/scripts/app.js"></script>
    </body>
</html>
