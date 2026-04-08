$(window).load(function(){
	$('.loading').fadeOut('fast');
	$('.container').fadeIn('fast');
});
$('document').ready(function(){
		var vw;
		$(window).resize(function(){
			 vw = $(window).width()/2;
			$('#b1,#b2,#b3,#b4,#b5,#b6,#b7').stop();
			$('#b11').animate({top:240, left: vw-350},500);
			$('#b22').animate({top:240, left: vw-250},500);
			$('#b33').animate({top:240, left: vw-150},500);
			$('#b44').animate({top:240, left: vw-50},500);
			$('#b55').animate({top:240, left: vw+50},500);
			$('#b66').animate({top:240, left: vw+150},500);
			$('#b77').animate({top:240, left: vw+250},500);
		});

	$('#turn_on').click(function(){
		$('#bulb_yellow').addClass('bulb-glow-yellow');
		$('#bulb_red').addClass('bulb-glow-red');
		$('#bulb_blue').addClass('bulb-glow-blue');
		$('#bulb_green').addClass('bulb-glow-green');
		$('#bulb_pink').addClass('bulb-glow-pink');
		$('#bulb_orange').addClass('bulb-glow-orange');
		$('body').addClass('peach');
		$(this).fadeOut('slow').delay(5000).promise().done(function(){
			$('#play').fadeIn('slow');
		});
	});
	$('#play').click(function(){
		var audio = $('.song')[0];
	audio.play();
	audio.loop = true; // keep playing throughout the whole experience
	startFloatingHearts(); // 💕 hearts float up during music
        $('#bulb_yellow').addClass('bulb-glow-yellow-after');
		$('#bulb_red').addClass('bulb-glow-red-after');
		$('#bulb_blue').addClass('bulb-glow-blue-after');
		$('#bulb_green').addClass('bulb-glow-green-after');
		$('#bulb_pink').addClass('bulb-glow-pink-after');
		$('#bulb_orange').addClass('bulb-glow-orange-after');
		$('body').css('backgroud-color','#FFF');
		$('body').addClass('peach-after');
		$(this).fadeOut('slow').delay(6000).promise().done(function(){
			$('#bannar_coming').fadeIn('slow');
		});
	});

	$('#bannar_coming').click(function(){
		$('.bannar').addClass('bannar-come');
		$(this).fadeOut('slow').delay(6000).promise().done(function(){
			$('#balloons_flying').fadeIn('slow');
		});
	});

	function loopOne() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b1').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b1++;
			if (balloonLoopCounts.b1 < MAX_BALLOON_LOOPS) {
				loopOne();
			}
		});
	}
	function loopTwo() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b2').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b2++;
			if (balloonLoopCounts.b2 < MAX_BALLOON_LOOPS) {
				loopTwo();
			}
		});
	}
	function loopThree() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b3').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b3++;
			if (balloonLoopCounts.b3 < MAX_BALLOON_LOOPS) {
				loopThree();
			}
		});
	}
	function loopFour() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b4').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b4++;
			if (balloonLoopCounts.b4 < MAX_BALLOON_LOOPS) {
				loopFour();
			}
		});
	}
	function loopFive() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b5').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b5++;
			if (balloonLoopCounts.b5 < MAX_BALLOON_LOOPS) {
				loopFive();
			}
		});
	}

	function loopSix() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b6').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b6++;
			if (balloonLoopCounts.b6 < MAX_BALLOON_LOOPS) {
				loopSix();
			}
		});
	}
	function loopSeven() {
		var randleft = 1000*Math.random();
		var randtop = 500*Math.random();
		$('#b7').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b7++;
			if (balloonLoopCounts.b7 < MAX_BALLOON_LOOPS) {
				loopSeven();
			}
		});
	}

    // --- Balloon loop control variables ---
    // Counts how many times each balloon has completed an animated move.
    var balloonLoopCounts = {b1:0,b2:0,b3:0,b4:0,b5:0,b6:0,b7:0};
    // Configure how many moves each balloon should make before stopping.
    // Increase this number to make balloons fly longer; set to Infinity for never-stop.
    var MAX_BALLOON_LOOPS = 6;

	$('#balloons_flying').click(function(){
		$('.balloon-border').animate({top:-500},8000);
		$('#b1,#b4,#b5,#b7').addClass('balloons-rotate-behaviour-one');
		$('#b2,#b3,#b6').addClass('balloons-rotate-behaviour-two');
		// $('#b3').addClass('balloons-rotate-behaviour-two');
		// $('#b4').addClass('balloons-rotate-behaviour-one');
		// $('#b5').addClass('balloons-rotate-behaviour-one');
		// $('#b6').addClass('balloons-rotate-behaviour-two');
		// $('#b7').addClass('balloons-rotate-behaviour-one');
		loopOne();
		loopTwo();
		loopThree();
		loopFour();
		loopFive();
		loopSix();
		loopSeven();
		
		$(this).fadeOut('slow').delay(5000).promise().done(function(){
			$('#cake_fadein').fadeIn('slow');
		});
	});	

	$('#cake_fadein').click(function(){
		$('.cake').fadeIn('slow');
		$(this).fadeOut('slow').delay(3000).promise().done(function(){
			$('#light_candle').fadeIn('slow');
		});
	});

	$('#light_candle').click(function(){
		$('.fuego').fadeIn('slow');
		$(this).fadeOut('slow').promise().done(function(){
			$('#wish_message').fadeIn('slow');
		});
	});

		
	$('#wish_message').click(function(){
		 vw = $(window).width()/2;

		$('#b1,#b2,#b3,#b4,#b5,#b6,#b7').stop();
		$('#b1').attr('id','b11');
		$('#b2').attr('id','b22')
		$('#b3').attr('id','b33')
		$('#b4').attr('id','b44')
		$('#b5').attr('id','b55')
		$('#b6').attr('id','b66')
		$('#b7').attr('id','b77')
		$('#b11').animate({top:240, left: vw-350},500);
		$('#b22').animate({top:240, left: vw-250},500);
		$('#b33').animate({top:240, left: vw-150},500);
		$('#b44').animate({top:240, left: vw-50},500);
		$('#b55').animate({top:240, left: vw+50},500);
		$('#b66').animate({top:240, left: vw+150},500);
		$('#b77').animate({top:240, left: vw+250},500);
		$('.balloons').css('opacity','0.9');
		$('.balloons h2').fadeIn(3000);
		$(this).fadeOut('slow').delay(3000).promise().done(function(){
			$('#story').fadeIn('slow');
		});
	});
	
	$('#story').click(function(){
		$(this).fadeOut('slow');
		$('.cake').fadeOut('fast').promise().done(function(){
			$('.message').fadeIn('slow');
		});
		
		var totalParagraphs = $('.message p').length;

		function msgLoop (i) {
			$(".message .col-md-12 p:nth-child("+i+")").fadeOut('slow').delay(800).promise().done(function(){
			i=i+1;
			$(".message .col-md-12 p:nth-child("+i+")").fadeIn('slow').delay(1000);
			if(i > totalParagraphs){
				$(".message .col-md-12 p:nth-child("+totalParagraphs+")").fadeOut('slow').promise().done(function () {
					$('.message').fadeOut('fast');
					$('.cake').fadeIn('fast').promise().done(function() {
						setTimeout(function() {
							$('#not_over').fadeIn('slow');
						}, 2000);
					});
				});
				
			}
			else{
				msgLoop(i);
			}			

		});
		}
		
		msgLoop(0);
		
	});

	// --- Surprise photo collage ---
	$('#not_over').click(function() {
		$(this).fadeOut('fast');
		$('#photo_collage').fadeIn('slow');
		startSlideshow();
		shootFireworks(); // 🎆 fireworks on collage open
	});

	// --- wish_message: heart confetti explosion ---
	$('#wish_message').click(function() {
		shootHeartConfetti();
	});

	function startSlideshow() {
		var current = 0;
		var photos = $('.collage-photo');
		if (photos.length === 0) return;

		// Build dot indicators
		var dotsContainer = $('#collage-dots');
		dotsContainer.empty();
		for (var d = 0; d < photos.length; d++) {
			dotsContainer.append('<span class="cdot' + (d === 0 ? ' active' : '') + '"></span>');
		}

		// Show captions
		function updateCaption(idx) {
			var cap = $(photos[idx]).data('caption') || '';
			$('#collage-caption-text').fadeOut(200, function() {
				$(this).text(cap).fadeIn(200);
			});
			$('#collage-dots .cdot').removeClass('active').eq(idx).addClass('active');
		}

		photos.hide();
		$(photos[0]).fadeIn('slow');
		updateCaption(0);

		setInterval(function() {
			$(photos[current]).fadeOut(600, function() {
				current = (current + 1) % photos.length;
				$(photos[current]).fadeIn(600);
				updateCaption(current);
			});
		}, 4000);
	}

	$('#close_collage').click(function() {
		$('#photo_collage').fadeOut('slow');
	});

});

// ============================================
// 💕 FLOATING HEARTS
// ============================================
function startFloatingHearts() {
	var hearts = ['❤️','💕','💗','💖','💝','🌸','✨'];
	var interval = setInterval(function() {
		var el = document.createElement('div');
		el.className = 'float-heart';
		el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
		el.style.left = Math.random() * 100 + 'vw';
		el.style.animationDuration = (3 + Math.random() * 3) + 's';
		el.style.fontSize = (16 + Math.random() * 16) + 'px';
		document.body.appendChild(el);
		setTimeout(function() { el.remove(); }, 6000);
	}, 600);
	// stop spawning after 2 mins (plenty for the experience)
	setTimeout(function() { clearInterval(interval); }, 120000);
}

// ============================================
// 🎊 HEART CONFETTI EXPLOSION
// ============================================
function shootHeartConfetti() {
	if (typeof confetti === 'undefined') return;
	var end = Date.now() + 2500;
	var colors = ['#FF6B9D','#FF4477','#FF85A1','#FFB3C8','#FF2D6B'];
	(function frame() {
		confetti({
			particleCount: 4,
			angle: 60,
			spread: 70,
			origin: { x: 0 },
			colors: colors,
			shapes: ['circle'],
			scalar: 1.2
		});
		confetti({
			particleCount: 4,
			angle: 120,
			spread: 70,
			origin: { x: 1 },
			colors: colors,
			shapes: ['circle'],
			scalar: 1.2
		});
		if (Date.now() < end) requestAnimationFrame(frame);
	}());
}

// ============================================
// 🎆 FIREWORKS
// ============================================
function shootFireworks() {
	if (typeof confetti === 'undefined') return;
	var duration = 3000;
	var end2 = Date.now() + duration;
	var colors2 = ['#FF6B9D','#FFB3C8','#fff','#FF4477','#FF85A1'];
	(function fireframe() {
		confetti({
			particleCount: 6,
			angle: Math.random() * 360,
			spread: 60,
			origin: { x: Math.random(), y: Math.random() * 0.5 },
			colors: colors2,
			startVelocity: 30,
			gravity: 0.5,
			scalar: 1.1
		});
		if (Date.now() < end2) requestAnimationFrame(fireframe);
	}());
}





//alert('hello');