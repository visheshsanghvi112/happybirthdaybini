$(window).load(function(){
	$('.loading').fadeOut('fast');
	$('.container').fadeIn('fast');
});
$('document').ready(function(){
		var vw;
		$(window).resize(function(){
			 vw = $(window).width()/2;
			 var gap = Math.min(100, Math.floor(vw * 0.27));
			$('#b1,#b2,#b3,#b4,#b5,#b6,#b7').stop();
			$('#b11').animate({top:240, left: vw-3*gap},500);
			$('#b22').animate({top:240, left: vw-2*gap},500);
			$('#b33').animate({top:240, left: vw-gap},500);
			$('#b44').animate({top:240, left: vw},500);
			$('#b55').animate({top:240, left: vw+gap},500);
			$('#b66').animate({top:240, left: vw+2*gap},500);
			$('#b77').animate({top:240, left: vw+3*gap},500);
		});

	$('#turn_on').click(function(e){
		e.preventDefault();
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
	$('#play').click(function(e){
		e.preventDefault();
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

	$('#bannar_coming').click(function(e){
		e.preventDefault();
		$('.bannar').addClass('bannar-come');
		$(this).fadeOut('slow').delay(6000).promise().done(function(){
			$('#balloons_flying').fadeIn('slow');
		});
	});

	function loopOne() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b1').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b1++;
			if (balloonLoopCounts.b1 < MAX_BALLOON_LOOPS) {
				loopOne();
			}
		});
	}
	function loopTwo() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b2').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b2++;
			if (balloonLoopCounts.b2 < MAX_BALLOON_LOOPS) {
				loopTwo();
			}
		});
	}
	function loopThree() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b3').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b3++;
			if (balloonLoopCounts.b3 < MAX_BALLOON_LOOPS) {
				loopThree();
			}
		});
	}
	function loopFour() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b4').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b4++;
			if (balloonLoopCounts.b4 < MAX_BALLOON_LOOPS) {
				loopFour();
			}
		});
	}
	function loopFive() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b5').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b5++;
			if (balloonLoopCounts.b5 < MAX_BALLOON_LOOPS) {
				loopFive();
			}
		});
	}

	function loopSix() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
		$('#b6').animate({left:randleft,bottom:randtop},10000,function(){
			balloonLoopCounts.b6++;
			if (balloonLoopCounts.b6 < MAX_BALLOON_LOOPS) {
				loopSix();
			}
		});
	}
	function loopSeven() {
		var randleft = ($(window).width()-80)*Math.random();
		var randtop = 300*Math.random();
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

	$('#balloons_flying').click(function(e){
		e.preventDefault();
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

	$('#cake_fadein').click(function(e){
		e.preventDefault();
		$('.cake').fadeIn('slow');
		$(this).fadeOut('slow').delay(3000).promise().done(function(){
			$('#light_candle').fadeIn('slow');
		});
	});

	$('#light_candle').click(function(e){
		e.preventDefault();
		$('.fuego').fadeIn('slow');
		$(this).fadeOut('slow').promise().done(function(){
			$('#wish_message').fadeIn('slow');
		});
	});

		
	$('#wish_message').click(function(e){
		e.preventDefault();
		if ($(this).data('clicked')) return;
		$(this).data('clicked', true);
		// 📱 Screen shake + phone vibration
		$('body').addClass('shake-it');
		setTimeout(function(){ $('body').removeClass('shake-it'); }, 700);
		if (navigator.vibrate) { navigator.vibrate([120, 60, 120, 60, 200]); }
		shootHeartConfetti();

		 vw = $(window).width()/2;
		 var gap = Math.min(100, Math.floor(vw * 0.27));
		$('#b1,#b2,#b3,#b4,#b5,#b6,#b7').stop();
		$('#b1').attr('id','b11');
		$('#b2').attr('id','b22')
		$('#b3').attr('id','b33')
		$('#b4').attr('id','b44')
		$('#b5').attr('id','b55')
		$('#b6').attr('id','b66')
		$('#b7').attr('id','b77')
		$('#b11').animate({top:240, left: vw-3*gap},500);
		$('#b22').animate({top:240, left: vw-2*gap},500);
		$('#b33').animate({top:240, left: vw-gap},500);
		$('#b44').animate({top:240, left: vw},500);
		$('#b55').animate({top:240, left: vw+gap},500);
		$('#b66').animate({top:240, left: vw+2*gap},500);
		$('#b77').animate({top:240, left: vw+3*gap},500);
		$('.balloons').css('opacity','0.9');
		// ✨ Glitch reveal on balloon letters
		$('.balloons h2').show().addClass('glitch-reveal');
		setTimeout(function(){ $('.balloons h2').removeClass('glitch-reveal'); }, 1200);
		$(this).fadeOut('slow').delay(2000).promise().done(function(){
			$('#story').fadeIn('slow');
		});
	});
	
	$('#story').click(function(e){
		e.preventDefault();
		$(this).fadeOut('slow');
		$('.cake').fadeOut('fast').promise().done(function(){
			$('.message').fadeIn('fast');
			var paragraphs = $('.message .col-md-12 p').toArray();
			typewriterLoop(0, paragraphs);
		});
	});

	// --- Surprise photo collage ---
	$('#not_over').click(function(e) {
		e.preventDefault();
		$(this).fadeOut('fast');

		// 🌌 THE GALAXY ORCHESTRA (INTERACTIVE)
		$('#hype_overlay').fadeIn(1000);
		var bursts = 0;
		var maxBursts = 5;

		$('#hype_overlay').on('mousedown touchstart', function(e) {
			if (bursts >= maxBursts) return;
			
			var x = e.pageX || (e.originalEvent.touches ? e.originalEvent.touches[0].pageX : 0);
			var y = e.pageY || (e.originalEvent.touches ? e.originalEvent.touches[0].pageY : 0);
			
			if (x === 0 && y === 0) return; // fail safe

			bursts++;
			$('#burst_num').text(bursts);

			// Celestial Explosion
			confetti({
				particleCount: 80,
				spread: 100,
				origin: { x: x / window.innerWidth, y: y / window.innerHeight },
				colors: ['#FF6B9D', '#FFD1E1', '#fff', '#FFB3C8', '#B39DDB'],
				shapes: ['circle'],
				scalar: 1.2
			});

			if (bursts === 2) {
				$('#magic_hint').fadeOut(500, function() {
					$(this).text("Beautiful... just like you 🥺").fadeIn(500);
				});
			}

			if (bursts === maxBursts) {
				$('#magic_hint').fadeOut(500, function() {
					$(this).text("Now, the real gift...").fadeIn(500);
				});
				$('#open_heart_btn').delay(800).fadeIn(1000);
			}
		});

		$('#open_heart_btn').click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			$(this).fadeOut(400);
			$('#magic_hint, #magic_counter').fadeOut(400);

			// 🚀 HYPER-SPEED TUNNEL EFFECT
			$('#tunnel_effect').show().animate({opacity: 1}, 800);
			if (navigator.vibrate) { navigator.vibrate([100, 50, 100, 50, 400]); }

			setTimeout(function() {
				$('#hype_overlay').fadeOut(1000);
				$('#photo_collage').fadeIn(1500);
				
				setTimeout(function() {
					startSlideshow();
					shootFireworks();
					setTimeout(shootFireworks, 500);
				}, 500);
			}, 1200);
		});
	});



	var slideshowInterval;
	function startSlideshow() {
		if (slideshowInterval) clearInterval(slideshowInterval);
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

		// Set random rotation on each photo (polaroid feel)
		photos.each(function() {
			var rot = (Math.random() * 10 - 5).toFixed(1);
			$(this).css('--photo-rot', rot + 'deg');
		});

		function showPhoto(idx) {
			var $photo = $(photos[idx]);
			$photo.css({ transform: 'rotate(var(--photo-rot)) translateY(-80px)', opacity: 0, display: 'block' });
			$photo.animate({ opacity: 1 }, { duration: 500, step: function(now) {
				$(this).css('transform', 'rotate(var(--photo-rot)) translateY(' + (-80 + 80*(1-now)) + 'px)');
			}});
			updateCaption(idx);
		}

		photos.hide();
		showPhoto(0);

		slideshowInterval = setInterval(function() {
			$(photos[current]).fadeOut(400, function() {
				current = (current + 1) % photos.length;
				showPhoto(current);
			});
		}, 4000);
	}

	$('#close_collage').click(function(e) {
		e.preventDefault();
		if (slideshowInterval) clearInterval(slideshowInterval);
		$('#photo_collage').fadeOut('slow');
	});

});

// ============================================
// ⌨️ TYPEWRITER LETTER
// ============================================
function typewriterLoop(i, paragraphs) {
	if (i >= paragraphs.length) {
		$('.message').fadeOut(600, function() {
			$('.cake').fadeIn('fast').promise().done(function() {
				setTimeout(function() {
					$('#not_over').fadeIn('slow');
				}, 2000);
			});
		});
		return;
	}
	var $p = $(paragraphs[i]);
	var fullText = $p.data('original') || $p.text().trim();
	if (!$p.data('original')) $p.data('original', fullText);
	var chars = [...fullText]; // handles emoji as single char
	$p.html('<span class="typed-chars"></span><span class="type-cursor">|</span>').show();
	var $typed = $p.find('.typed-chars');
	var $cursor = $p.find('.type-cursor');
	var idx = 0;
	var speed = Math.max(20, Math.min(40, 1200 / chars.length)); // auto-speed: short lines slower, long lines faster
	var timer = setInterval(function() {
		if (idx < chars.length) {
			$typed.text($typed.text() + chars[idx]);
			idx++;
		} else {
			clearInterval(timer);
			setTimeout(function() {
				$cursor.fadeOut(200);
				$p.fadeOut(300, function() {
					typewriterLoop(i + 1, paragraphs);
				});
			}, 500);
		}
	}, speed);
}

function startFloatingHearts() {
	var symbols = ['🌸','🌹','🌷','🌺','💕','❤️','✨','💖','⭐','🌸'];
	// Layer 1: bigger, slower
	var slow = setInterval(function() {
		var el = document.createElement('div');
		el.className = 'float-heart';
		el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
		el.style.left = Math.random() * 100 + 'vw';
		p_dur = (5 + Math.random() * 4) + 's';
		el.style.animationDuration = p_dur;
		el.style.fontSize = (20 + Math.random() * 14) + 'px';
		el.style.opacity = '0.8';
		document.body.appendChild(el);
		setTimeout(function() { el.remove(); }, 9000);
	}, 700);
	// Layer 2: smaller, faster
	var fast = setInterval(function() {
		var el = document.createElement('div');
		el.className = 'float-heart';
		el.textContent = ['💕','✨','🌸'][Math.floor(Math.random()*3)];
		el.style.left = Math.random() * 100 + 'vw';
		el.style.animationDuration = (2.5 + Math.random() * 2) + 's';
		el.style.fontSize = (12 + Math.random() * 10) + 'px';
		document.body.appendChild(el);
		setTimeout(function() { el.remove(); }, 4500);
	}, 350);
	setTimeout(function() { clearInterval(slow); clearInterval(fast); }, 120000);
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