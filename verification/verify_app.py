from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local dev server
            page.goto("http://localhost:5173/space-unicorn-clicker/")

            # Wait for the application to load (e.g., check for a specific element)
            # Use a more reliable selector for the title
            page.wait_for_selector("h1:has-text('Space Unicorn Clicker')", timeout=20000)

            # Take a screenshot
            page.screenshot(path="./verification/verification.png", full_page=True)
            print("Screenshot saved to ./verification/verification.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Take a screenshot anyway to see what's wrong
            page.screenshot(path="./verification/error.png", full_page=True)
            print("Error screenshot saved to ./verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
