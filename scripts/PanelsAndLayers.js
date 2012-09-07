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

	var _super = this,
		self = this;

	this.$window = $(window); //cache a shortcut to the window
	this.$body = $("body"); //cache a shortcut to the body

	/** Main config */
	this.config = {
		layersLocked: false,
		selectors: {
			panel: ".panel",
			layer: ".layer[data-inertia]"
		},
		monitorScrollDirection: true, //adds a 'scroll-up' class to the body when scrolling changes
		throttleTime: 50,
		scrollAnimationDuration: 800,
		scrollEasing: "easeOutExpo",
		background: {
			animate: false,
			inertia: 0.2
		}

	};

	//merge our options with default options
	$.extend(this.config, this.config, options);

	this.panels = [];


	/** Bind the necessary events to perform animations
	 *
	 */
	this.bindEvents = function() {

		this.$window.resize(function(){
			self.animate();
			//$(".panel:last").css({"minHeight": $(this).height()});
		});

		this.$window.bind('scroll', $.throttle(_super.config.throttleTime, false, function(){ //throttle this to help performance a tiny bit
			self.animate(); //move the layers!

			self.$body.toggleClass("scroll-up", self.config.monitorScrollDirection && self.config.lastPos > self.$window.scrollTop());
			self.config.lastPos = self.$window.scrollTop();
		}));


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
		var self = this;

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
			//console.log(this.layer, this.max);
		};

		/** Move the layer
		 *
		 *
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

		this.container	= $(selector);

		this.panel_id	= this.container.attr("id");

		this.inertia	= 0 || config.inertia;


		//set up the layers
		this.layers = [];

		// Add a layer
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
				newPosition = "50% " + (newYpos -100) + "px";

			this.container.css({'backgroundPosition': newPosition});
			return true;
		};

		this.update = function(){
			if (!this.inView()) {
				return;
			}

			if (config.background.animate === true) {
				this.moveBackground();
			}


			//move all the layers
			$.each(this.layers, function(k,v) {
				self.layers[k].moveLayer();
			});

			//if (self.container.data("pin") !== null) {
			//	var adjuster = _super.$window.scrollTop() - this.container.position().top ;
			//	//var offSetAdjustment = (this.windowHeight - adjuster	) + this.container.position().top,
			//	//	panelAdjustment  = (this.windowHeight + _super.$window.scrollTop()) - adjuster;
			//
			//	this.container.css({marginTop: Math.max(self.container.data("sticky-for"), adjuster) + "px"});
			//}


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

			this.inertia = parseFloat(this.container.data("background-inertia"));

			this.container.fracs(function(fracs) {
				if (fracs.possible > 0.01) {
					self.container.addClass("inview");
				}
				if (fracs.possible === 0) {
					self.container.removeClass("inview");
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





	this.Panel = Panel;
	this.Layer = Layer;


	this.init = function() {

		if ( this.config.niceScroll === true ) {
			$("html").niceScroll();
		}

		//init the panels
		$( this.config.selectors.panel ).each(function(panelKey,panelEl){

			var $panel = $(panelEl),
				p = new self.Panel("#"+$panel.attr("id"), self.config),
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
/*global define:true requirejs:true*/

if (typeof requirejs === "function") {
	//make sure older plugins wait for jQuery
	requirejs.config({
		shim: {
			"jquery.easing.1.3": ["jquery.min"],
			"jquery.ba-throttle-debounce": ["jquery.min"],
			"jquery.fracs-0.11.min": ["jquery.min"],
			"jquery.nicescroll.min": ["jquery.min"]
		}
	});
}
if (typeof define === "function") {
	define("PanelsAndLayers", ["jquery.min", "jquery.easing.1.3", "jquery.ba-throttle-debounce", "jquery.fracs-0.11.min", "jquery.nicescroll.min"], function($) {
		return PanelsAndLayers;
	});
}
