<!doctype html>
<html class="no-js" lang="en-GB">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>The Conditional Orchestra</title>
      <meta name="description" content="">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta 
        http-equiv="Content-Security-Policy" 
        report-uri="/csp-violation-report-endpoint/" 
        content="img-src 'self' https://www.google-analytics.com *.googleapis.com *.gstatic.com; script-src 'self' https://api.darksky.net/forecast/ *.googleapis.com https://fonts.gstatic.com/ https://www.google-analytics.com 'nonce-2109b8a76z'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com/; worker-src 'self' blob:;"
      >
      <meta name="theme-color" content="#314187">
      <link rel="stylesheet" href="dist/styles/global.css">
      <link rel="manifest" href="manifest.json">
      <link rel="stylesheet" href="dist/styles/global.css">
      <link rel="apple-touch-icon" sizes="180x180" href="img/app-icons/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="16x16" href="img/app-icons/favicon-16x16.png">
      <link rel="icon" type="image/png" sizes="32x32" href="img/app-icons/favicon-32x32.png">
      <link rel="mask-icon" href="img/app-icons/safari-pinned-tab.svg" color="#314187">

      <script nonce="2109b8a76z">
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-104582644-1', 'auto');
        ga('send', 'pageview');

      </script>
    </head>
    <body>
      <div class="outerwrapper">
        <div class="innerwrapper">
          <!-- begin main -->
          <main id="main" aria-label="Content">
            <p id="test"></p>
            <!-- begin article -->
            <article>
                <!-- begin header -->
                <header class="article-header" role="banner">
                  <div class="wrapper">
                    <h1 class="page-heading"><span class="minor-word">The</span> Conditional Orchestra</h1>
                    <p class="intro">Using current weather conditions The Conditional Orchestra generates unique compositions for your listening pleasure.</p>
                  </div>
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
                <p>If it can't find your location ensure you've clicked &ldquo;allow&rdquo; when the browser asks to use your location. 
                Alternatively click &ldquo;choose a location&rdquo; where you can enter any place you like.</p>
                <p>If the music playback is glitchy please try it on a more powerful device.</p>
                <p>The audio may stop if it's not the active tab in your browser, so be sure to open in a new window for continuous playback.</p>
                <p>Tip: try picking extreme places such as Nordvik, Dubai, Jakarta or Cape Farewell. To see a weather map of the world try <a href="https://www.windy.com/" target="_blank" rel="noopener">Windy.com</a></p>
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
                <p>This project uses <a href="https://darksky.net" target="_blank" rel="noopener">DarkSky.net</a> to obtain the weather data. 
                The library used to retrieve the data can be found on <a href="https://www.npmjs.com/package/darkskyjs" target="_blank" rel="noopener">NPM here</a></p>
                <p><a href="https://www.google.com/intx/en_uk/work/mapsearth/products/mapsapi.html" target="_blank" rel="noopener">Google maps</a> is used to reverse Geocode the location information</p>
                <p><a href="http://p5js.org/" target="_blank" rel="noopener">P5.js</a> is used to load and control the audio.</p>
                <p><a href="https://www.npmjs.com/package/freqi">Freqi</a> is a small module I wrote to generate the frequencies for playback.</p>
                <p>The Conditional Orchestra is an open <a href="https://github.com/rjbultitude/theconditionalorchestra" target="_blank" rel="noopener">source project</a>, 
                written and maintained by me, <a href="https://github.com/rjbultitude">Rich Bultitude</a>.</p>
                <p>Read about why and how I created this project <a href="https://medium.com/@pointbmusic/making-the-conditional-orchestra-df3149b17d23">here.</a></p>
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
                <h2 class="tab__heading">Share</h2>
                <p>Any location you listen to can be shared, just copy and paste the URL e.g. <a href="https://theconditionalorchestra.com/?London-UK" target="_blank" rel="noopener">theconditionalorchestra.com/?London-UK</a></p>
                <p>If you have any comments, suggestions or want to know more <a href="https://twitter.com/pointbmusic" target="_blank" rel="noopener">DM on Twitter</a></p>
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
                  <a href="#source" data-behaviour="tab">Share</a>
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
