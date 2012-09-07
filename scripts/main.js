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


	$(document).ready(function(){


		new PanelsAndLayers({
			niceScroll: true,
			throttleTime: 1,
			scrollAnimationDuration: 1000

		});

	});


});
