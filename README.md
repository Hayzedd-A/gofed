# GoFed Product Finder

Next.js 15.5 App Router app to search a MongoDB products catalog using OpenAI Vision + user form input. Includes an admin CRUD UI and API.

## Setup

1) Clone and install

```
npm install
```

2) Configure environment

Create `.env.local` and fill in:

```
MONGODB_URI=
OPENAI_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MARKETING_WEBHOOK_URL=https://hook.us2.make.com/naut5o6pqb67b9igrav3fwtkoggncxkd
ADMIN_TOKEN=your_secret_token
NEXT_PUBLIC_ADMIN_TOKEN=your_secret_token
PORT=3300
```

3) Seed sample data

```
npm run seed
```

4) Start dev server

```
npm run dev
```

App runs at http://localhost:3000

## Product Schema
See models/product.js. Fields include productName, imageUrl, brandName, application, keywords[], colorPalette[], productUrl, ...

## APIs

- POST /api/products/search (multipart/form-data)
  - Fields: email, projectname, sector, budgetTier, keywords, image
  - Saves image to public/uploads temporarily, calls OpenAI to extract criteria, queries MongoDB, forwards marketing payload, deletes image.

- /api/products/manage (requires header `x-admin-token: ADMIN_TOKEN`)
  - GET: list (page, limit)
  - POST: create
  - PUT: update by ?id
  - DELETE: delete by ?id

- POST /api/marketing (forwards body to MARKETING_WEBHOOK_URL)

## OpenAI Vision
- Uses Chat Completions with `gpt-4o` and image_url input.
- Ensure NEXT_PUBLIC_BASE_URL is reachable for uploaded images locally.

## Local vs Production
- For dev, NEXT_PUBLIC_BASE_URL should be http://localhost:3000
- In production, set it to your site URL so uploaded image URLs are public for OpenAI.

## Admin UI
- Visit /admin
- Uses NEXT_PUBLIC_ADMIN_TOKEN on the client to include header. For production, protect further behind auth.

## Styling
- Tailwind CSS + Futura PT
- Theme color #2b3a55

## Notes
- Uploaded images are deleted after each search request.
- Add more fields and validations as needed.
