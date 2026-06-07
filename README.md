# Reverie API

Vercel TypeScript backend for generating Reverie dream images with the OpenAI Images API.

## Requirements

- Node.js 18+
- Vercel CLI, installed through this project's dev dependencies
- OpenAI API key

## Environment

Create a local `.env` file:

```sh
OPENAI_API_KEY=your_openai_api_key
```

Do not commit `.env` files or expose `OPENAI_API_KEY` to clients.

## Scripts

```sh
npm run dev
npm run build
npm run typecheck
```

## Endpoints

### `GET /api/health`

Returns:

```json
{
  "ok": true
}
```

### `POST /api/generate-dream-image`

Request:

```json
{
  "prompt": "A detailed dream prompt with at least twenty characters.",
  "mode": "surreal"
}
```

Validation:

- `prompt` is required.
- `prompt` must be at least 20 characters after trimming.
- `mode`, when provided, must be a string.

Returns:

```json
{
  "imageBase64": "..."
}
```

The endpoint uses OpenAI `gpt-image-1` to generate a `1024x1792` portrait image and returns the base64 image data.

## CORS

Both API routes set permissive CORS headers and respond to `OPTIONS` preflight requests.
