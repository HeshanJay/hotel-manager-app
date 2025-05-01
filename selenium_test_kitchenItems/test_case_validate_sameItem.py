#test_case_validate_sameItem.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Speed Control
SLOW_DELAY = 2

# Setup WebDriver 
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # Navigate to the form
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    # Select Category & Type
    Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
    time.sleep(SLOW_DELAY)
    Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
    time.sleep(SLOW_DELAY)

    # Try selecting the same item twice
    select_item = Select(driver.find_element(By.ID, "itemNameSelect"))
    select_item.select_by_visible_text("Tomato")
    time.sleep(SLOW_DELAY * 0.5)
    select_item.select_by_visible_text("Tomato")  # Attempt duplicate
    time.sleep(SLOW_DELAY)

    # Validate duplicate item error appears
    wait = WebDriverWait(driver, 5)
    error = wait.until(EC.visibility_of_element_located((
        By.XPATH, "//p[contains(text(), 'Tomato is already selected.')]"
    )))
    assert "Tomato is already selected." in error.text
    print("✅ Test Passed: Duplicate item selection correctly blocked with validation message.")

finally:
    time.sleep(SLOW_DELAY * 2)
    driver.quit()
