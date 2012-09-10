/*

	A typical panel signature

	<div class="panel">

		##
		## Standard Panel
		##	Inertia - (Float)
		##		Takes care of the rate and direction of movement
		##		(it is a signed value i.e. it can be positive or negative)
		##	Min / Max - (Int)
		##		The layer will not move beyond these bounds
		##
		<div class="layer" data-inertia="1.2" data-min="200" data-max="400">
			<p>layer content</p>
		</div>

		##
		## Property - (String) top|left|bottom|right
		##      Will animate the specified position property.
		##      In most cases "top" and "left" will be the values you want and
		##      then control the direction with a given inertia
		##
		<div class="layer" data-inertia="-1.2" data-min="200" data-max="400" data-property="left">
			<p>layer content</p>
		</div>

	</div>


	data-inertia sets the movement rate and direction
	data-min sets the minimum value for "top" that will be achieved
	data-max sets the maximum value for the position property that will be achieved
	data-property sets the position property to be animated

*/

function PanelsAndLayers( options ) {
	"use strict";

	var _super = this,
		self = this;

	this.$window = $(window); //cache a shortcut to the window
	this.$body = $("body"); //cache a shortcut to the body

	/** Main config */
	this.config = {
		layersLocked: false,
		selectors: {
			panel: ".panel",
			layer: ".layer[data-inertia]" //no point in selecting layers that do not specify inertia
		},
		monitorScrollDirection: true, //adds a 'scroll-up' class to the body when scrolling changes
		throttle: 50, //throttling can in some cases improve performance
		scrollAnimationDuration: 800,
		scrollEasing: "easeOutExpo",
		background: {
			animate: false,
			inertia: 0.2
		},
		navigation: {
			duration: 1500,
			relativeDuration:true,
			speed: 1, //pixels per ms.
			maxDuration: 5000
		}

	};

	//merge our options with default options
	$.extend(true, this.config, this.config, options);

	this.panels = [];


	/**
	 * Bind the necessary events to perform animations
	 */
	this.bindEvents = function() {
		var scrollFn;

		this.$window.resize(function(){
			self.animate();
		});


		//window scroll handler
		scrollFn = function(){
			self.animate(); //move the layers!

			self.$body.toggleClass("scroll-up", self.config.monitorScrollDirection && self.config.lastPos > self.$window.scrollTop());
			self.config.lastPos = self.$window.scrollTop();
		};

		if (self.config.throttle !== false) {
			this.$window.bind('scroll', $.throttle(_super.config.throttle, false, scrollFn));
		}
		else {
			this.$window.bind('scroll', scrollFn);
		}


	};

	/** function to be called whenever the window is scrolled or resized
	 *
	 */
	this.animate = function(){
		if (this.config.layersLocked) {
			return;
		}
		$.each(this.panels, function(k,v) {
			self.panels[k].update();
		});
	};


	/** Add a new layer to a panel
	 *
	 */
	function Layer(parent, $layer) {
		//var self = this;

		this.layer = parent.container.find( $layer );

		this.updatePosition = function (pos) {
			var css = {};
			css[this.property] = pos;

			this.layer.stop().animate(css, {duration:_super.config.scrollAnimationDuration, easing: _super.config.scrollEasing });
		};

		this.setup = function(inertia){
			this.inertia = this.layer.data("inertia") / 10 || 0;
			this.property = this.layer.data("property");
			this.axis = this.layer.data("axis");


			if ( $.inArray(this.property, ["top", "left", "bottom", "right"] ) == -1) {
				this.property = (this.axis === "horizontal") ? "left" : "top";
			}

			this.cssStart = parseInt(this.layer.css( this.property ), 10);
			this.minOffset = Math.round( -(this.cssStart) * this.inertia );
			this.max = this.layer.data("max") || false;
			this.min = this.layer.data("min") || false;

		};

		/**
		 * Move the layer
		 */
		this.moveLayer = function() {
			var panelPos, newRawPos, newPosition,
				panelHeight = parent.container.height(),
				windowHeight = _super.$window.height();


			//calculate the appropriate panel position.
			panelPos = $(window).scrollTop() - parent.container.position().top;
			//if this is the last panel and it's not tall enough, compensate the panel position
			//by adding the remain
			if (parent.container.is(".panel:last") && panelHeight < windowHeight) {
				panelPos = panelPos + (windowHeight - panelHeight);
			}

			newRawPos = (this.cssStart + (+(panelPos))) * this.inertia;

			newPosition = this.minOffset + this.cssStart + newRawPos;
			newPosition = this.max === false ? newPosition : Math.min( newPosition, this.max );
			newPosition = this.min === false ? newPosition : Math.max( newPosition, this.min);

			this.updatePosition( newPosition + "px");
		};

		if (this instanceof Layer) {
			return this;
		}
		else {
			return new Layer(parent, $layer);
		}
	}



	/** Create a new panel
	 *
	 *  @param {String} selector
	 *  @param {Object} config
	 *  Config signature:
	 *      inertia {Number} a fraction (0.x) to specify the inertia
	 */
	function Panel(selector, config) {
		var self = this;

		this.windowHeight = _super.$window.height();

		this.container  = $(selector);

		this.panel_id   = this.container.attr("id");

		this.inertia    = 0 || config.inertia;

		this.layers     = [];


		/**
		 * Add a layer to the stack
		 * @param {jQuery} $layer The layer
		 * @returns {Layer}  the last layer that was pushed to the stack
		 */
		this.addLayer = function( $layer ) {
			var layer = new Layer(this, $layer);
			this.layers.push(layer);
			return layer; // for chaining
		};

		//move the background of the layer
		this.moveBackground = function() {

			var adjuster = this.container.position().top + this.container.height();
			var offSetAdjustment = (this.windowHeight - adjuster	) + this.container.position().top,
				panelAdjustment  = (this.windowHeight + _super.$window.scrollTop()) - adjuster,
				newYpos = ( -(panelAdjustment) +offSetAdjustment ) * this.inertia,
				newPosition = "50% " + Math.min(0, (newYpos -100)) + "px";

			this.container.css({'backgroundPosition': newPosition});
			return true;
		};

		this.update = function(){
			if (!this.inView()) {
				return;
			}

			if (this.animateBackground === true) {
				this.moveBackground();
			}


			//move all the layers
			$.each(this.layers, function(k,v) {
				self.layers[k].moveLayer();
			});




		};

		// check if a panel is in view
		this.inView = function(){
			return this.container.hasClass("inview");
		};


		/**
		 *	We use the fracs plugin to find out how much of a container is in the viewport
		 *	if enough of its possible viewing area enters the viewport then we
		 *	also set it active.
		 *	Could also potentially use this to implement some comprehensive tracking
		 */
		this.init = function() {

			if (this.container.data("animate") === true) {
				this.animateBackground = true;
				this.inertia = parseFloat( this.container.data("inertia") );
			}

			this.container.fracs(function(fracs) {
				if (fracs.possible > 0.01) {
					self.container.addClass("inview");
				}
				if (fracs.possible === 0) {
					self.container.removeClass("inview");
				}

				if (fracs.possible > 0.9) {
					_super.Nav.setActive(self.container.attr("id"));

				}

			});

		};

		if (this instanceof Panel) {
			this.init();
			return this;
		}
		else {
			return new Panel(selector, config);
		}

	}




	/**
	 * Implement Panel Navigation
	 *
	 * @type {Navigation}
	 * @class Navigation
	 * @param {String} Selector of navigation parent. This should contain a set of internal links to panels.
	 */

	function Navigation( navSelector ) {
		var self = this;

		this.nav = $( navSelector );
		this.$window = $(window);

		this.config = _super.config.navigation;


		/**
		 * Sets a nav item to active
		 *
		 * @param {String} theId Id of the panel that is going to be active
		 */
		this.setActive = function(theId){
			var $newActive;

			$(".active", this.nav).removeClass("active");
			$newActive = $("a[href='#"+theId+"']", this.nav);
			$newActive.addClass("active");

		};


		/**
		 * Bind all the nav events up
		 */
		this.bindEvents = function(){

			this.nav.on("click", "a", this.scrollToPanel);

		};

		this.scrollToPanel = function(e) {
			var $this = $(this),
				href = $this.attr("href"),
				distance = self.config.relativeDuration ? self.getDistance( href ) : self.config.duration,
				duration = Math.round( Math.min(distance, self.config.maxDuration ) / self.config.speed );

			if (self.config.relativeDuration === true) {
				duration = Math.max( self.config.duration, duration);
			}

			console.log("Distance to animate:", distance);
			e.preventDefault();

			console.log("Duration:", duration);
			$.scrollTo( href, {
				duration: duration,
				easing: "easeOutQuint",
				onAfter: function(e) {
					self.setActive($(e).attr("id"));
					window.location.hash = href;
				}
			});
		};


		this.getDistance = function( selector ) {
			var distance,
				$location = $(selector);

			distance = ($location.position().top - this.$window.scrollTop());
			distance = distance < 0 ? distance * -1 : distance;

			return Math.round( distance );
		};


		this.init = function() {
			this.bindEvents();
		};


		if (this instanceof Navigation) {
			this.init();
			return this;
		}
		else {
			return new Navigation(navSelector);
		}

	}




	this.init = function() {

		if ( this.config.niceScroll === true ) {
			$("html").niceScroll();
		}

		if (this.config.useNavigation === true) {
			this.Nav = new Navigation( "nav" );
		}

		//init the panels
		$( this.config.selectors.panel ).each(function(panelKey,panelEl){

			var $panel = $(panelEl),
				p = new Panel("#"+$panel.attr("id"), self.config),
				layerIndex = 0;

			//find all layers within a panel and assign a unique class
			$panel.find( self.config.selectors.layer ).each(function(layerKey, layerEl){

				var $layer = $(layerEl),
					uniqueLayerClass = '', //"panels-and-layers-"+ self.panels.length + "-" + layerIndex;
					//build a unique selector for each layer so they can be animated independently
					fullClass = '.' + $layer.attr("class").replace(/\s/g,".");//+ "." + uniqueLayerClass;

				$layer.addClass(uniqueLayerClass);

				p.addLayer( $layer ).setup( parseFloat( $layer.data("inertia") ) );

				layerIndex++;
			});

			self.panels.push( p );
		});


		this.bindEvents();


	};

	this.init();


}

/** Below section is usefull if we want to use requirejs */

/*global define:true requirejs:true*/

if (typeof requirejs === "function") {
	//make sure older plugins wait for jQuery
	requirejs.config({
		shim: {
			"lib/jquery.easing.1.3":           ["lib/jquery.min"],
			"lib/jquery.ba-throttle-debounce": ["lib/jquery.min"],
			"lib/jquery.fracs-0.11.min":       ["lib/jquery.min"],
			"lib/jquery.scrollTo-1.4.2-min":   ["lib/jquery.min"],
			"lib/jquery.localscroll-1.2.7-min":["lib/jquery.min"],
			"lib/jquery.nicescroll.min":       ["lib/jquery.min"]
		}
	});
}

if (typeof define === "function") {
	define(
		"PanelsAndLayers",
		[
			"lib/jquery.min",
			"lib/jquery.easing.1.3",
			"lib/jquery.ba-throttle-debounce",
			"lib/jquery.fracs-0.11.min",
			"lib/jquery.scrollTo-1.4.2-min",
			"lib/jquery.localscroll-1.2.7-min",
			"lib/jquery.nicescroll.min"
		],
		function($) {
			return PanelsAndLayers;
		}
	);
}
