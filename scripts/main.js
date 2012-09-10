/*global require:true requirejs:true*/


require(["PanelsAndLayers"], function(PanelsAndLayers) {


	$(document).ready(function(){


		window.PanelsAndLayersDemo = new PanelsAndLayers({
			useNavigation: true,
			throttle: false,
			scrollAnimationDuration: 200,
			navigation: {
				speed: 0.5
			}

		});



	});


});
