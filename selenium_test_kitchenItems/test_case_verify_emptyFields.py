# test_case_verify_emptyFields.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Setup WebDriver using Service 
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # Navigate to the KitchenForm route 
    driver.get("http://localhost:5173/kitchenForm")

    # Immediately click Submit without filling any fields
    driver.find_element(By.ID, "submitOrder").click()

    # Wait for at least one validation error to appear
    wait = WebDriverWait(driver, 5)
    # error paragraphs have class "text-red-600"
    error_elements = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.text-red-600"))
    )

    # Assert that at least one error is shown 
    assert len(error_elements) > 0, "Expected validation errors, but none were shown."

    # Ensure the success modal did NOT appear 
    success_modals = driver.find_elements(By.ID, "orderSuccess")
    assert len(success_modals) == 0, "Success message appeared despite empty required fields."

    print("✅ Test Passed: Form did not submit with required fields empty")

finally:
    time.sleep(9)
    driver.quit()
