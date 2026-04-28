var PLAN_LIMITS = {
	'99': { images: 3, videos: 0 },
	'149': { images: 5, videos: 0 },
	'199': { images: 8, videos: 1 }
};

var VARIATIONS = {
	classic: { className: 'variation-classic', label: 'Classic Love' },
	gold: { className: 'variation-gold', label: 'Golden Glow' },
	midnight: { className: 'variation-midnight', label: 'Midnight Neon' },
	intimate: { className: 'variation-intimate', label: 'Intimate Moment' }
};

var PRODUCT_DRAFT_KEY = 'birthdayProductDraftV3';
var LINK_VALIDITY_HOURS = 72;
var firebaseApp = null;
var firestoreDb = null;
var firebaseAuth = null;
var currentAuthUser = null;
var selectedMediaFiles = [];
var selectedMediaPreviews = [];
var cloudinaryUploadEnabled = true;

function getAppConfig() {
	return window.APP_CONFIG || { cloudinary: {}, firebase: {} };
}

function parseLines(text) {
	if (!text) return [];
	return text.split('\n').map(function(line) { return line.trim(); }).filter(Boolean);
}

function slugify(input) {
	return (input || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function getQueryParam(name) {
	return new URLSearchParams(window.location.search).get(name);
}

function buildSlugLink(slug) {
	var target = new URL(window.location.href);
	target.search = '';
	target.searchParams.set('slug', slug);
	return target.toString();
}

function getFirebaseApp() {
	var appConfig = getAppConfig();
	if (!window.firebase || !appConfig.firebase || !appConfig.firebase.projectId) return null;
	if (!firebaseApp) {
		firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(appConfig.firebase);
	}
	return firebaseApp;
}

function getFirebaseDb() {
	var app = getFirebaseApp();
	if (!app) return null;
	if (!firestoreDb) firestoreDb = firebase.firestore(firebaseApp);
	return firestoreDb;
}

function getFirebaseAuth() {
	var app = getFirebaseApp();
	if (!app || !firebase.auth) return null;
	if (!firebaseAuth) firebaseAuth = firebase.auth();
	return firebaseAuth;
}

function getCurrentUser() {
	return currentAuthUser;
}

function isCloudinaryConfigured() {
	var appConfig = getAppConfig();
	if (!appConfig.cloudinary || !appConfig.cloudinary.cloudName) return false;
	return !!(appConfig.cloudinary.signatureEndpoint || appConfig.cloudinary.uploadPreset);
}

function getCloudinarySignatureEndpoint() {
	var appConfig = getAppConfig();
	if (!appConfig.cloudinary) return '/api/cloudinary/signature';
	return appConfig.cloudinary.signatureEndpoint || '/api/cloudinary/signature';
}

async function fetchCloudinarySignature(cloudName) {
	var endpoint = getCloudinarySignatureEndpoint();
	var response = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ cloudName: cloudName })
	});
	if (!response.ok) {
		var message = 'Signature server unavailable.';
		try {
			var payload = await response.json();
			if (payload && payload.error) message = payload.error;
		} catch (err) {
			message = 'Signature server unavailable (' + response.status + ').';
		}
		throw new Error(message);
	}
	var data = await response.json();
	if (!data || !data.signature || !data.timestamp || !data.apiKey) {
		throw new Error('Signature response is incomplete.');
	}
	return data;
}

function setAuthStatus(message, statusType) {
	var el = $('#auth_status');
	el.removeClass('error success');
	if (statusType === 'error' || statusType === 'success') el.addClass(statusType);
	el.text(message || '');
}

function syncAuthUi(user) {
	var signedIn = !!user;
	$('#studio_auth_create, #studio_auth_signin').toggle(!signedIn);
	$('#studio_auth_success').toggle(signedIn);
	if (signedIn) {
		$('#auth_status_create, #auth_status_signin').html('Signed in as <strong>' + (user.email || 'publisher') + '</strong>.');
	} else {
		$('#studio_auth_create').show();
		$('#studio_auth_signin').hide();
	}
}

async function assertPublisherAccess() {
	var user = getCurrentUser();
	if (!user) throw new Error('Please sign in before creating or updating slug links.');
	return user;
}

async function checkFirebaseConnection() {
	var db = getFirebaseDb();
	if (!db) return { ok: false, message: 'Firebase config missing.' };
	try {
		await db.collection('orders').limit(1).get();
		return { ok: true, message: 'Firebase connected. Firestore read is working.' };
	} catch (err) {
		return { ok: false, message: (err && err.message) ? err.message : 'Firestore connection check failed.' };
	}
}

function isVideoFile(file) {
	return !!file && file.type.indexOf('video/') === 0;
}

function getPlanLimits(planTier) {
	return PLAN_LIMITS[planTier] || PLAN_LIMITS['149'];
}

function applyVariation(variationId) {
	$('body').removeClass('variation-classic variation-gold variation-midnight variation-intimate');
	var selected = VARIATIONS[variationId] || VARIATIONS.classic;
	$('body').addClass(selected.className);
}

function renderMedia(items) {
	var container = $('#media_container');
	container.empty();
	if (!items || !items.length) {
		container.hide();
		return;
	}
	container.css('display', 'grid');
	items.forEach(function(item) {
		if (!item || !item.url) return;
		if (item.type === 'video') {
			container.append('<video class="dynamic-media-video" controls playsinline src="' + item.url + '"></video>');
		} else {
			container.append('<img class="dynamic-media-image" src="' + item.url + '" alt="customer media">');
		}
	});
}

function applyPersonalization(personalization) {
	if (!personalization) return;
	var recipient = (personalization.recipientName || '').trim();
	var sender = (personalization.senderName || '').trim();
	var wishText = (personalization.wishCta || '').trim();
	var topMessage = (personalization.topMessage || '').trim();
	var letterLines = personalization.letterLines || [];
	var mediaItems = personalization.mediaItems || [];
	var variationId = personalization.variationId || 'classic';

	// Special handling for intimate variation
	if (variationId === 'intimate') {
		if (typeof initIntimateVariation === 'function') {
			initIntimateVariation(personalization);
		}
		if (personalization.planTier) {
			$('#studio_status').text('Preview loaded for ' + (VARIATIONS[variationId].label) + ' / Rs ' + personalization.planTier + '.');
		}
		return;
	}

	applyVariation(variationId);

	if (recipient) {
		document.title = 'Happy Birthday ' + recipient;
		$('meta[name="description"]').attr('content', 'Birthday surprise for ' + recipient);
	}

	if (wishText) $('#wish_message').text('💞 ' + wishText);

	if (letterLines.length) {
		var markup = letterLines.map(function(line) { return '<p>' + $('<div>').text(line).html() + '</p>'; }).join('');
		$('.message .col-md-12').html(markup);
	}

	if (recipient) $('.collage-header h1').text('💕 ' + recipient.toLowerCase() + ' 💕');
	if (topMessage) $('.collage-sub').text(topMessage);
	if (sender) $('.collage-end').text('with love, ' + sender + ' ❤️');
	renderMedia(mediaItems);

	if (personalization.planTier) {
		$('#studio_status').text('Preview loaded for ' + (VARIATIONS[variationId || 'classic'].label) + ' / ' + (personalization.planTier ? 'Rs ' + personalization.planTier : '') + '.');
	}
}

function hydrateForm(personalization) {
	if (!personalization) return;
	$('#plan_tier').val(personalization.planTier || '149');
	$('#variation_id').val(personalization.variationId || 'classic');
	$('#order_slug').val(personalization.orderSlug || personalization.slug || '');
	$('#customer_name').val(personalization.customerName || '');
	$('#customer_whatsapp').val(personalization.customerWhatsapp || '');
	$('#recipient_name').val(personalization.recipientName || '');
	$('#sender_name').val(personalization.senderName || '');
	$('#wish_cta').val(personalization.wishCta || '');
	$('#top_message').val(personalization.topMessage || '');
	$('#letter_lines').val((personalization.letterLines || []).join('\n'));
}

function gatherFormData() {
	return {
		planTier: $('#plan_tier').val(),
		variationId: $('#variation_id').val(),
		orderSlug: $('#order_slug').val().trim(),
		customerName: $('#customer_name').val().trim(),
		customerWhatsapp: $('#customer_whatsapp').val().trim(),
		recipientName: $('#recipient_name').val().trim(),
		senderName: $('#sender_name').val().trim(),
		wishCta: $('#wish_cta').val().trim(),
		topMessage: $('#top_message').val().trim(),
		letterLines: parseLines($('#letter_lines').val()),
		mediaItems: getSelectedMediaData()
	};
}

function inferDefaults() {
	return {
		planTier: '149',
		variationId: 'classic',
		orderSlug: '',
		recipientName: 'Bini',
		senderName: '',
		wishCta: 'Happy Birthday Bini!',
		topMessage: $('.collage-sub').text().trim(),
		letterLines: $('.message .col-md-12 p').map(function() { return $(this).text().trim(); }).get(),
		mediaItems: []
	};
}

function isExpired(order) {
	return !!(order && order.expiresAt && Date.now() > order.expiresAt);
}

function showExpiredOverlay(order) {
	if ($('#expired_notice').length) return;
	var created = order && order.createdAt ? new Date(order.createdAt).toLocaleString() : 'unknown time';
	$('body').append('<div id="expired_notice" class="expired-notice"><div class="expired-card"><h3>Link Expired</h3><p>This surprise link was valid for 72 hours and is now archived.</p><p>Created: ' + created + '</p></div></div>');
}

function collectFilePreview(file, index) {
	return new Promise(function(resolve) {
		var reader = new FileReader();
		reader.onload = function() {
			resolve({
				name: file.name,
				type: isVideoFile(file) ? 'video' : 'image',
				previewUrl: reader.result,
				file: file,
				index: index
			});
		};
		reader.readAsDataURL(file);
	});
}

async function uploadMediaToCloudinary(file, slug, index) {
	var appConfig = getAppConfig();
	if (!appConfig.cloudinary || !appConfig.cloudinary.cloudName) {
		throw new Error('Cloudinary config is missing.');
	}
	var resourceType = isVideoFile(file) ? 'video' : 'image';
	var cloudName = appConfig.cloudinary.cloudName;
	var endpoint = 'https://api.cloudinary.com/v1_1/' + cloudName + '/' + resourceType + '/upload';
	var response = null;
	var usingSignedUpload = false;

	if (getCloudinarySignatureEndpoint()) {
		try {
			var signatureData = await fetchCloudinarySignature(cloudName);
			var signedFormData = new FormData();
			signedFormData.append('file', file);
			signedFormData.append('api_key', signatureData.apiKey);
			signedFormData.append('timestamp', String(signatureData.timestamp));
			signedFormData.append('signature', signatureData.signature);
			response = await fetch(endpoint, {
				method: 'POST',
				body: signedFormData
			});
			usingSignedUpload = true;
		} catch (signatureErr) {
			if (!appConfig.cloudinary.uploadPreset) {
				throw signatureErr;
			}
			console.warn('Signed upload unavailable, trying unsigned preset fallback.', signatureErr);
		}
	}

	if (!response) {
		if (!appConfig.cloudinary.uploadPreset) {
			throw new Error('Cloudinary upload is not configured: no server signature available and no unsigned upload preset set.');
		}
		var formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', appConfig.cloudinary.uploadPreset);
		response = await fetch(endpoint, {
			method: 'POST',
			body: formData
		});
	}

	if (!response.ok) {
		var errorMessage = 'Cloudinary upload failed for ' + file.name + '.';
		try {
			var responseText = await response.text();
			var errorPayload = null;
			try {
				errorPayload = JSON.parse(responseText);
			} catch (jsonErr) {
				errorPayload = null;
			}
			if (errorPayload && errorPayload.error && errorPayload.error.message) {
				errorMessage += ' ' + errorPayload.error.message;
			} else if (responseText) {
				errorMessage += ' Server response: ' + responseText.slice(0, 220);
			}
		} catch (parseErr) {
			// Ignore parse errors and keep the fallback message.
		}
		console.error('Cloudinary upload failed', {
			status: response.status,
			statusText: response.statusText,
			fileName: file && file.name ? file.name : 'unknown',
			mode: usingSignedUpload ? 'signed' : 'unsigned'
		});
		if (errorMessage.indexOf('Upload preset not found') !== -1 || errorMessage.indexOf('whitelisted for unsigned uploads') !== -1) {
			cloudinaryUploadEnabled = false;
		}
		throw new Error(errorMessage);
	}
	var data = await response.json();
	return {
		url: data.secure_url,
		type: resourceType,
		publicId: data.public_id,
		resourceType: data.resource_type || resourceType,
		name: file.name
	};
}

async function uploadSelectedMedia(files, slug, onProgress) {
	var uploaded = [];
	for (var i = 0; i < files.length; i++) {
		if (onProgress) onProgress(i + 1, files.length, files[i]);
		uploaded.push(await uploadMediaToCloudinary(files[i], slug, i + 1));
	}
	return uploaded;
}

function validateSelection(planTier, files) {
	var limits = getPlanLimits(planTier);
	var images = files.filter(function(file) { return !isVideoFile(file); });
	var videos = files.filter(function(file) { return isVideoFile(file); });
	if (images.length > limits.images) return 'Your selected plan allows only ' + limits.images + ' images.';
	if (videos.length > limits.videos) return 'Your selected plan allows only ' + limits.videos + ' video upload(s).';
	return null;
}

function getSelectedMediaData() {
	return selectedMediaPreviews.map(function(item) {
		return { type: item.type, previewUrl: item.previewUrl, name: item.name };
	});
}

async function saveOrderRecord(orderData) {
	var db = getFirebaseDb();
	if (!db) throw new Error('Firestore config is missing.');
	var ordersRef = db.collection('orders');
	await ordersRef.doc(orderData.slug).set({
		slug: orderData.slug,
		planTier: orderData.planTier,
		variationId: orderData.variationId,
		customerName: orderData.customerName,
		customerWhatsapp: orderData.customerWhatsapp,
		recipientName: orderData.recipientName,
		senderName: orderData.senderName,
		wishCta: orderData.wishCta,
		topMessage: orderData.topMessage,
		letterLines: orderData.letterLines,
		mediaItems: orderData.mediaItems,
		ownerUid: orderData.ownerUid,
		ownerEmail: orderData.ownerEmail,
		createdAt: orderData.createdAt,
		updatedAt: Date.now(),
		expiresAt: orderData.expiresAt
	}, { merge: true });
	return buildSlugLink(orderData.slug);
}

async function loadOrderFromFirestore(slug) {
	var db = getFirebaseDb();
	if (!db || !slug) return null;
	var doc = await db.collection('orders').doc(slug).get();
	if (!doc.exists) return null;
	return doc.data() || null;
}

function initProductStudio() {
	var defaults = inferDefaults();
	var personalization = defaults;
	var incomingSlug = getQueryParam('slug');
	var savedDraft = null;
	var auth = getFirebaseAuth();

	try { savedDraft = JSON.parse(localStorage.getItem(PRODUCT_DRAFT_KEY) || 'null'); } catch (err) { savedDraft = null; }
	if (savedDraft) personalization = $.extend({}, personalization, savedDraft);

	hydrateForm(personalization);
	applyPersonalization(personalization);
	$('#share_link').val(incomingSlug ? buildSlugLink(incomingSlug) : '');

	if (incomingSlug) {
		loadOrderFromFirestore(incomingSlug).then(function(order) {
			if (!order) {
				$('#studio_status').text('No order found for slug ' + incomingSlug + '.');
				return;
			}
			personalization = $.extend({}, personalization, order, { slug: order.slug, orderSlug: order.slug });
			hydrateForm(personalization);
			applyPersonalization(personalization);
			$('#share_link').val(buildSlugLink(order.slug));
			if (isExpired(order)) {
				$('#studio_status').text('This link expired after 72 hours. Update and save to reactivate.');
				showExpiredOverlay(order);
			} else {
				$('#studio_status').text('Loaded slug "' + order.slug + '".');
			}
		});
	}

	if (auth) {
		auth.onAuthStateChanged(function(user) {
			currentAuthUser = user || null;
			syncAuthUi(user || null);
		});
	} else {
		setAuthStatus('Firebase Auth unavailable. Check Firebase scripts/config.', 'error');
		$('#auth_register, #auth_signin_submit, #auth_signout').prop('disabled', true);
	}

	checkFirebaseConnection().then(function(result) {
		if (!result.ok) {
			setAuthStatus('Firebase connection issue: ' + result.message, 'error');
		}
	});

	// Toggle between Create and Sign In screens
	$('#auth_to_signin').click(function() {
		$('#studio_auth_create').hide();
		$('#studio_auth_signin').show();
		$('#auth_email_signin').focus();
	});

	$('#auth_to_create').click(function() {
		$('#studio_auth_signin').hide();
		$('#studio_auth_create').show();
		$('#auth_email_create').focus();
	});

	// Create Account Handler
	$('#auth_register').click(async function() {
		if (!auth) return;
		var email = ($('#auth_email_create').val() || '').trim();
		var password = $('#auth_password_create').val() || '';
		if (!email || !password) {
			$('#auth_status_create').html('Enter email and password to create account.').css('color', 'red');
			return;
		}
		try {
			await auth.createUserWithEmailAndPassword(email, password);
			$('#auth_status_create').html('✓ Account created! You\'re signed in.').css('color', 'green');
		} catch (err) {
			$('#auth_status_create').html(err.message || 'Account creation failed.').css('color', 'red');
		}
	});

	// Sign In Handler
	$('#auth_signin_submit').click(async function() {
		if (!auth) return;
		var email = ($('#auth_email_signin').val() || '').trim();
		var password = $('#auth_password_signin').val() || '';
		if (!email || !password) {
			$('#auth_status_signin').html('Enter email and password to sign in.').css('color', 'red');
			return;
		}
		try {
			await auth.signInWithEmailAndPassword(email, password);
			$('#auth_status_signin').html('✓ Signed in successfully.').css('color', 'green');
		} catch (err) {
			$('#auth_status_signin').html(err.message || 'Sign in failed.').css('color', 'red');
		}
	});

	$('#auth_signout').click(async function() {
		if (!auth) return;
		try {
			await auth.signOut();
			$('#auth_email_create').val('');
			$('#auth_password_create').val('');
			$('#auth_email_signin').val('');
			$('#auth_password_signin').val('');
			$('#studio_auth_create').show();
			$('#studio_auth_signin').hide();
			$('#studio_auth_success').hide();
			setAuthStatus('Signed out.', '');
		} catch (err) {
			setAuthStatus(err.message || 'Sign out failed.', 'error');
		}
	});

	// ── Payment section: update QR + WhatsApp link on plan change ──
	var OWNER_WA = '917977282697';
	var OWNER_UPI = '7977282697@superyes';
	var PLAN_LABELS = { '99': 'Mini (Rs 99)', '149': 'Classic (Rs 149)', '199': 'Signature (Rs 199)' };

	function updatePaymentSection() {
		var plan = $('#plan_tier').val() || '149';
		var recipient = $('#recipient_name').val().trim() || 'someone special';
		var amount = plan;
		var label = PLAN_LABELS[plan] || ('Rs ' + plan);

		$('#payment_amount_label').text('Rs ' + amount);

		var upiData = 'upi://pay?pa=' + encodeURIComponent(OWNER_UPI) + '&pn=Ayush&am=' + amount + '&cu=INR';
		var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(upiData);
		$('#payment_qr').attr('src', qrUrl);

		var waMsg = 'Hi! I just paid Rs ' + amount + ' for the ' + label + ' birthday surprise for ' + recipient + '. Please create my link. 🎂';
		$('#payment_whatsapp').attr('href', 'https://wa.me/' + OWNER_WA + '?text=' + encodeURIComponent(waMsg));
	}

	updatePaymentSection();
	$('#plan_tier, #recipient_name').on('change input', updatePaymentSection);

	$('#open_product_studio').click(function() {
		$('#product_studio').addClass('is-open').attr('aria-hidden', 'false');
		updatePaymentSection();
	});

	$('#close_product_studio').click(function() {
		$('#product_studio').removeClass('is-open').attr('aria-hidden', 'true');
	});

	$('#media_files').on('change', async function() {
		var files = Array.prototype.slice.call(this.files || []);
		var error = validateSelection($('#plan_tier').val(), files);
		if (error) {
			selectedMediaFiles = [];
			selectedMediaPreviews = [];
			$('#selected_media_preview').empty();
			$('#upload_status').text(error);
			this.value = '';
			return;
		}
		selectedMediaFiles = files;
		selectedMediaPreviews = [];
		$('#upload_status').text(files.length ? files.length + ' file(s) selected.' : 'Choose files to preview them here.');
		var previews = await Promise.all(files.map(function(file, index) { return collectFilePreview(file, index); }));
		selectedMediaPreviews = previews;
		var previewMarkup = previews.map(function(item) {
			if (item.type === 'video') {
				return '<div class="selected-media-card"><video controls playsinline src="' + item.previewUrl + '"></video><span>' + item.name + '</span></div>';
			}
			return '<div class="selected-media-card"><img src="' + item.previewUrl + '" alt="preview"><span>' + item.name + '</span></div>';
		}).join('');
		$('#selected_media_preview').html(previewMarkup);
	});

	$('#product_form').on('submit', function(e) {
		e.preventDefault();
		personalization = gatherFormData();
		personalization.mediaItems = getSelectedMediaData();
		applyPersonalization(personalization);
		localStorage.setItem(PRODUCT_DRAFT_KEY, JSON.stringify(personalization));
		$('#studio_status').text('Preview updated. Publish when ready.');
	});

	$('#save_order').click(async function() {
		var submitButton = $(this);
		var previewButton = $('#product_form button[type="submit"]');
		try {
			var signedInUser = await assertPublisherAccess();
			submitButton.prop('disabled', true);
			previewButton.prop('disabled', true);
			$('#upload_status').text('Uploading selected media...');
			personalization = gatherFormData();
			var baseSlug = personalization.orderSlug || personalization.recipientName || 'birthday-link';
			var slug = slugify(baseSlug);
			if (!slug) slug = 'birthday-link';
			var existingOrder = await loadOrderFromFirestore(slug);
			if (existingOrder && existingOrder.createdAt && Date.now() > existingOrder.expiresAt) {
				slug = slug + '-' + Date.now().toString().slice(-4);
			}
			var selectedFiles = Array.prototype.slice.call(selectedMediaFiles || []);
			var uploadError = validateSelection(personalization.planTier, selectedFiles);
			if (uploadError) {
				throw new Error(uploadError);
			}
			var uploadedItems = [];
			if (selectedFiles.length) {
				if (!isCloudinaryConfigured() || !cloudinaryUploadEnabled) {
					$('#upload_status').text('Cloudinary upload is disabled. Continuing with text-only publish.');
				} else {
					try {
						uploadedItems = await uploadSelectedMedia(selectedFiles, slug);
					} catch (uploadErr) {
						console.warn('Cloudinary upload failed; publishing without uploaded media.', uploadErr);
						$('#upload_status').text((uploadErr && uploadErr.message ? uploadErr.message : 'Cloudinary upload failed.') + ' Continuing with text-only publish.');
						uploadedItems = [];
					}
				}
			}
			personalization.mediaItems = uploadedItems;
			var createdAt = existingOrder && existingOrder.createdAt ? existingOrder.createdAt : Date.now();
			var orderData = {
				slug: slug,
				planTier: personalization.planTier,
				variationId: personalization.variationId,
				customerName: personalization.customerName,
				customerWhatsapp: personalization.customerWhatsapp,
				recipientName: personalization.recipientName,
				senderName: personalization.senderName,
				wishCta: personalization.wishCta,
				topMessage: personalization.topMessage,
				letterLines: personalization.letterLines,
				mediaItems: uploadedItems,
				ownerUid: signedInUser.uid,
				ownerEmail: signedInUser.email || '',
				createdAt: createdAt,
				expiresAt: createdAt + (LINK_VALIDITY_HOURS * 60 * 60 * 1000)
			};
			await saveOrderRecord(orderData);
			personalization.slug = slug;
			personalization.orderSlug = slug;
			hydrateForm(personalization);
			applyPersonalization(personalization);
			localStorage.setItem(PRODUCT_DRAFT_KEY, JSON.stringify(personalization));
			var shareLink = buildSlugLink(slug);
			$('#share_link').val(shareLink);
			$('#studio_status').text('Published slug: ' + slug + ' | valid for 72 hours.');
			$('#upload_status').text(uploadedItems.length ? uploadedItems.length + ' file(s) uploaded successfully.' : 'No media uploaded.');
		} catch (err) {
			$('#studio_status').text(err.message || 'Upload failed.');
			$('#upload_status').text(err.message || 'Upload failed.');
		} finally {
			submitButton.prop('disabled', false);
			previewButton.prop('disabled', false);
		}
	});

	$('#copy_share_link').click(function() {
		var field = document.getElementById('share_link');
		if (!field || !field.value) {
			$('#studio_status').text('No link available yet.');
			return;
		}
		field.select();
		field.setSelectionRange(0, 99999);
		navigator.clipboard.writeText(field.value).then(function() {
			$('#studio_status').text('Link copied. Send it to customer.');
		}).catch(function() {
			$('#studio_status').text('Copy failed. Copy manually from the field.');
		});
	});
}

$(window).load(function(){
	$('.loading').fadeOut('fast');
	$('.container').fadeIn('fast');
});
$('document').ready(function(){
		initProductStudio();
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