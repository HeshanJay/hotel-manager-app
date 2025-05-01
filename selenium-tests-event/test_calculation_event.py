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

    # Fill in the form with valid data
    driver.find_element(By.ID, "eventName").send_keys("Test Event")
    select_event_type = Select(driver.find_element(By.ID, "eventType"))
    select_event_type.select_by_value("wedding")
    driver.find_element(By.ID, "eventDate").send_keys("2025-08-01")
    driver.find_element(By.ID, "startTime").send_keys("14:00")  # 2:00 PM
    driver.find_element(By.ID, "endTime").send_keys("19:00")    # 7:00 PM (5 hours duration)
    driver.find_element(By.ID, "numberofGuests").send_keys("50")
    driver.find_element(By.ID, "contactName").send_keys("John Doe")
    driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
    driver.find_element(By.ID, "contactPhone").send_keys("1234567890")
    driver.find_element(By.ID, "specialRequests").send_keys("None")
    driver.find_element(By.ID, "agreeTerms").click()

    # Submit the form
    driver.find_element(By.ID, "createEventBookingButton").click()

    # Wait for the success popup to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "eventSuccessPopup"))
    )

    # Verify the popup content
    popup = driver.find_element(By.ID, "eventSuccessPopup")
    popup_text = popup.text

    # Assertions to verify successful submission and total cost
    assert "Event Booking Confirmed!" in popup_text, "Success message not found in popup"
    assert "Rs 390000.00" in popup_text, "Total cost not found or incorrect in popup"

    print("\033[92mTest for total cost calculation passed!\033[0m")

finally:
    # Wait briefly to ensure stability
    time.sleep(5)

    # Close the browser
    driver.quit()