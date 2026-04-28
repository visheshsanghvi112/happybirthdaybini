Birthday Website Generator (Template 1)

This repo is a one-template product engine. You are not creating a new website for every order. You save data, then the template renders that data.

Core principle

- Same template, different data.
- Slug decides what record loads.
- No per-order code edits or deployments.

Current MVP architecture

- Stack: HTML + CSS + jQuery
- Template: current birthday experience (Template 1 / Classic)
- Media uploads: Cloudinary unsigned frontend upload
- Order storage: Firestore
- Delivery URL format: `?slug=your-slug`
- Validity model: 72 hours from creation
- Variations: Classic Love, Golden Glow, Midnight Neon, Intimate Moment

Config files

- [config.js](config.js) contains Cloudinary and Firestore placeholders.
- Cloudinary values already included:
	- cloud name: `dwfcnnt0x`
	- upload preset: `birthday_unsigned`

Run locally

1. Install dependencies:

```bash
npm install
```

2. Configure Cloudinary server env:

```bash
cp .env.example .env
```

Set `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`.

3. Start server:

```bash
npm run server-node
```

If port 8081 is busy, set `PORT` in `.env`.

Optional static-only mode (no signed upload API):

```bash
npm run server-static
```

3. Open the app in browser.

How to use the create flow

1. Click Launch Product Studio.
2. Choose plan and variation.
3. Fill recipient, sender, and message.
4. Upload photos or one video.
5. Preview selected media instantly.
6. Click Preview to apply text changes.
7. Click Create/Update Slug Link.
8. Share the generated slug link.

Cloudinary behavior

- Primary path: signed uploads via local API endpoint `/api/cloudinary/signature`.
- Fallback path: unsigned preset upload (if `uploadPreset` is configured).
- Files upload to the account default destination unless your Cloudinary upload settings route them elsewhere.
- Upload failures stop the publish flow.
- Selected media preview uses local file previews before upload.

Plan limits used in code

- Rs 99: 3 images, no video
- Rs 149: 5 images, no video
- Rs 199: 8 images, 1 video

You can change these limits in [effect.js](effect.js).

72-hour policy

- Each slug record is valid for 72 hours from creation.
- Expired links show an archive notice.
- Re-saving the order can reactivate the link.

Firestore record shape

```json
{
	"slug": "bini-birthday",
	"planTier": "149",
	"variationId": "classic",
	"customerName": "...",
	"customerWhatsapp": "...",
	"recipientName": "Bini",
	"senderName": "...",
	"wishCta": "Happy Birthday Bini",
	"topMessage": "...",
	"letterLines": ["..."],
	"mediaItems": [
		{ "type": "image", "url": "..." },
		{ "type": "video", "url": "..." }
	],
	"createdAt": 0,
	"updatedAt": 0,
	"expiresAt": 0
}
```

Important production note

- This repo uses the `?slug=` pattern in static HTML.
- If you want clean `/create` and `/<slug>` routes later, move this exact data model into Next.js or another routed app.

Recommended next step

1. Add the Firestore config values in [config.js](config.js).
2. Test one image-only order.
3. Test one 199 plan order with a video.

