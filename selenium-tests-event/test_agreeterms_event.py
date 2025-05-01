from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

# Set up the Chrome WebDriver
driver = webdriver.Chrome()

try:
    # Navigate to the Event Booking page
    driver.get("http://localhost:5173/event-booking")

    # Fill in the form with valid data, leaving agreeTerms unchecked
    driver.find_element(By.ID, "eventName").send_keys("Test Event")
    select_event_type = Select(driver.find_element(By.ID, "eventType"))
    select_event_type.select_by_value("wedding")
    driver.find_element(By.ID, "eventDate").send_keys("2025-08-01")
    driver.find_element(By.ID, "startTime").send_keys("14:00")
    driver.find_element(By.ID, "endTime").send_keys("18:00")
    driver.find_element(By.ID, "numberofGuests").send_keys("50")
    driver.find_element(By.ID, "contactName").send_keys("John Doe")
    driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
    driver.find_element(By.ID, "contactPhone").send_keys("1234567890")
    driver.find_element(By.ID, "specialRequests").send_keys("None")
    # Do not check agreeTerms checkbox

    # Submit the form
    driver.find_element(By.ID, "createEventBookingButton").click()

    # Wait for the error message to appear (under the agreeTerms checkbox)
    error_message = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'You must agree to the terms and conditions')]"))
    )

    # Verify the error message
    assert error_message.text == "You must agree to the terms and conditions", "Expected error message 'You must agree to the terms and conditions' not displayed"

    # Verify that the success popup does NOT appear
    try:
        driver.find_element(By.ID, "eventSuccessPopup")
        assert False, "Success popup appeared, but form should not have submitted"
    except:
        # Expected behavior: success popup is not present
        pass

    print("\033[92mTest for agree terms checkbox validation passed!\033[0m")

finally:
    # Wait briefly to ensure stability
    time.sleep(5)

    # Close the browser
    driver.quit()