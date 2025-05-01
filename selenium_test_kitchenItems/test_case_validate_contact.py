# test_case_validate_contact.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# === Speed Control ===
SLOW_DELAY = 2

# --- Setup WebDriver ---
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # 1. Open the KitchenForm page
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    # 2. Locate the supplierContact input field
    supplier_contact = driver.find_element(By.ID, "supplierContact")

    # 3. Enter an invalid value (not a valid phone or email)
    supplier_contact.send_keys("123abc")  # invalid contact
    supplier_contact.send_keys("\t")      # Trigger blur
    time.sleep(SLOW_DELAY)

    # 4. Wait for the validation message to appear
    wait = WebDriverWait(driver, 5)
    error = wait.until(EC.visibility_of_element_located((
        By.XPATH,
        "//input[@id='supplierContact']/following-sibling::p[contains(text(),'Enter the valid')]"
    )))

    # 5. Print and validate message (supports both email or contact error messages)
    msg = error.text.strip()
    print("🔍 Validation message shown:", msg)
    assert "Enter the valid" in msg
    print("✅ Test Passed: Validation message was displayed for an invalid supplier contact.")

finally:
    time.sleep(SLOW_DELAY * 2)
    driver.quit()
