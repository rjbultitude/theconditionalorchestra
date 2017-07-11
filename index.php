<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>The Conditional Orchestra</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="apple-touch-icon" href="apple-touch-icon.png">
        <link rel="stylesheet" href="dist/styles/global.css">
    </head>
    <body>
      <div class="outerwrapper">
        <div class="innerwrapper">
          <!-- begin main -->
          <main id="main" aria-label="Content">
            <!-- begin article -->
            <article>
                <!-- begin header -->
                <header class="article-header" role="banner">
                  <div class="wrapper">
                    <h1 class="page-heading">The Conditional Orchestra</h1>
                    <p class="intro">Using current weather conditions The Conditional Orchestra generates unique compositions for your listening pleasure.</p>
                  </div>
                  <div class="version-sash">Beta</div>
                </header>
                <!-- end header -->
                <!-- begin body -->
                <div class="article-body" role="article">
                  <div class="wrapper">
                    <!-- begin forms -->
                    <section class="form-section section">
                      <h2 class="section-heading">Generate music from the weather</h2>
                      <div class="form-user-location" data-ref="form-user-location">
                        <button id="use-location-btn" class="cta" aria-controls="message-block" disabled>Play my weather</button>
                        <span class="conjunction">Or</span>
                        <a href="#form-coords" class="cta--secondary" id="link-location-select">Choose a location</a>
                      </div>
                      <form class="form-coords inactive" id="form-coords" data-ref="form-coords">
                        <h2 class="form-coords__legend">Enter a place</h2>
                        <label for="place">place</label>
                        <input type="text" id="place" data-ref="place-field" autocomplete="on" placeholder="e.g. Siberia" pattern="[A-Za-z ]*">
                        <div class="input-review">Please only enter words</div>
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
                    </section>
                    <!-- end forms -->

                    <!-- Begin message & icon block -->
                    <section id="main-section" class="main-section section">
                        <div class="status-bar">
                          <h2 class="section-heading">Status</h2>
                          <div class="icons-block">
                            <?php echo file_get_contents("img/sun-icon.svg"); ?>
                          </div>
                          <p id="message-block" aria-live="polite">Loading...</p>
                        </div>
                    </section>
                    <!-- End message & icon block -->

                    <!-- Begin summary -->
                    <section class="summary-section section">
                      <h2 class="summary-heading">Summary</h2>
                      <p id="summary-desc" class="summary-desc"></p>
                      <div id="summary-icon" class="summary-icon"></div>
                    </section>
                    <!-- End summary -->

                    <!-- Begin conditions display -->
                    <section class="conditions-display section">
                      <div id="map"></div>
                      <h2 class="section-heading">How it works</h2>
                      <ul class="conditions-display__list" aria-live="assertive">
                      </ul>
                    </section>
                    <!-- End conditions display -->
                  </div>
                </div>
                <!-- end body -->
            </article>
            <!-- end article -->
          </main>
          <!-- end main -->
          <!-- begin footer -->
          <footer class="footer" role="contentinfo">
            <div class="wrapper">
              <div class="tab__panel" id="help" data-ref="tab-panel">
                <h2 class="tab__heading">Help</h2>
                <p>If it can't find your location ensure you've clicked "allow" when the browser asks to use your location.</p>
                <p>Alternatively click "choose another location" where you can enter any place you like.</p>
                <p>Tip: try picking extreme places such as Nordvik, Dubai, Jakarta or Cape Farewell.</p>
                <p>To see a weather map of the world try <a href="https://www.windy.com/" target="_blank">Windy.com</a></p>
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
                <p>This project uses <a href="https://darksky.net" target="_blank">DarkSky.net</a> to obtain the weather data.</p>
                <p>The JavaScript library used to retrieve the weather data can be found on <a href="https://www.npmjs.com/package/darkskyjs" target="_blank">NPM here</a> or <a href="https://github.com/rjbultitude/darkskyjs" target="_blank">GitHub here</a>.</p>
                <p><a href="http://p5js.org/" target="_blank">P5.js</a> is used to load and control the audio.</p>
                <p><a href="https://www.google.com/intx/en_uk/work/mapsearth/products/mapsapi.html" target="_blank">Google maps</a> is used to reverse Geocode the location information</p>
                <p>The Conditional Orchestra is written and maintained by <a href="https://github.com/rjbultitude">R.Bultitude</a>. Feedback welcome</p>
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
                <p>This is an open source project. Download, fork or view the <a href="https://github.com/rjbultitude/theconditionalorchestra" target="_blank">code here</a></p>
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
        </div>
      </div>
      <script src="dist/scripts/app.js"></script>
    </body>
</html>
