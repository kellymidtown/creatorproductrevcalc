# Creator Digital Product Revenue Calculator

Quick-start React (Vite) project for hosting the calculator and deploying on Vercel.

## Local Dev
```bash
npm install
npm run dev
```
Then open http://localhost:5173

## Build
```bash
npm run build
```

## Deploy to Vercel
1) Push this folder to a GitHub repo.
2) In Vercel, click **New Project**, choose the repo.
3) Framework: **Vite** (auto-detected), Build: `npm run build`, Output: `dist`.
4) Deploy. Your app will be live at `https://<project>.vercel.app`.

## Notes
- Tailwind styles are provided via the Play CDN in `index.html` for simplicity.
- Replace presets/labels as needed for your creators.
