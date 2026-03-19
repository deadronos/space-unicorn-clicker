npm ru
# 🦄 Space Unicorn Clicker (React + TS + Vite + Tailwind)

Minimal idle/clicker MVP where a cosmic unicorn raids battleships with a glowing laser horn.
- Click damage + Auto-DPS + auto-buyer
- Boss every 10 levels
- Persistent save + offline progress
- Laser beam animation, impact sparks, screen shake, starfield
- Unicorn art in `/public/unicorn.jpg`

## Run
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Optional: Verify UI via Playwright (Python)

A simple verification script is included in `verification/verify_app.py` that uses Playwright to open the app and take a screenshot.

```bash
# Start the dev server in a separate terminal
npm run dev

# In another terminal (requires Python + Playwright):
python verification/verify_app.py
```

You may need to install Playwright first:

```bash
pip install playwright
playwright install chromium
```
