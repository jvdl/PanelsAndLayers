/*global require:true requirejs:true*/

//requirejs.config({
//    shim: {
//		"jquery.easing.1.3": ["jquery"],
//		"jquery.ba-throttle-debounce": ["jquery"],
//		"jquery.fracs-0.11.min": ["jquery"],
//		"jquery.localscoll-1.2.7-min": ["jquery"],
//		"jquery.scrollTo-1.4.2-min": ["jquery"],
//		"jquery.nicescroll.min": ["jquery"]
//	}
//});

require(["PanelsAndLayers"], function(PanelsAndLayers) {


	$(document).ready(function(){


		new PanelsAndLayers({
			niceScroll: true,
			navigation: true,
			throttle: false,
			scrollAnimationDuration: 100

		});



	});


});
