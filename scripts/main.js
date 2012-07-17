/*global require:true requirejs:true*/

requirejs.config({
    shim: {
		"jquery.easing.1.3": ["jquery"],
		"jquery.ba-throttle-debounce": ["jquery"],
		"jquery.fracs-0.11.min": ["jquery"],
		"jquery.nicescroll.min": ["jquery"]
	}
});

require(["PanelsAndLayers"], function(PanelsAndLayers) {

	var PL, scrollPos = 0;

	PL = new PanelsAndLayers();

	$(window).on("mousewheel", function(e) {

		$("body").toggleClass("scroll-up", e.originalEvent.wheelDelta >= 0);

	});



});
