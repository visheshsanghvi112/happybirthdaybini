// Intimate Moment variation — applies personalization and sets the intimate theme
function initIntimateVariation(personalization) {
	if (!personalization) return;

	// Apply body class
	document.body.classList.remove('variation-classic','variation-gold','variation-midnight','variation-intimate');
	document.body.classList.add('variation-intimate');

	var recipient = (personalization.recipientName || '').trim();
	var sender    = (personalization.senderName    || '').trim();
	var wishText  = (personalization.wishCta       || '').trim();
	var topMsg    = (personalization.topMessage    || '').trim();
	var lines     = personalization.letterLines    || [];
	var media     = personalization.mediaItems     || [];

	if (recipient) {
		document.title = 'For you, ' + recipient + ' 💕';
	}
	if (wishText && document.getElementById('wish_message')) {
		document.getElementById('wish_message').textContent = '💞 ' + wishText;
	}
	if (lines.length) {
		var col = document.querySelector('.message .col-md-12');
		if (col) {
			col.innerHTML = lines.map(function(l) {
				return '<p>' + l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p>';
			}).join('');
		}
	}
	var h1 = document.querySelector('.collage-header h1');
	if (h1 && recipient) h1.textContent = '💕 ' + recipient.toLowerCase() + ' 💕';

	var sub = document.querySelector('.collage-sub');
	if (sub && topMsg) sub.textContent = topMsg;

	var end = document.querySelector('.collage-end');
	if (end && sender) end.textContent = 'with love, ' + sender + ' ❤️';

	// render media if any
	if (typeof renderMedia === 'function') renderMedia(media);
}
