from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

# Set up the Chrome WebDriver
driver = webdriver.Chrome()

try:
    # Step 2: Navigate to Event Booking page
    driver.get("http://localhost:5173/event-booking")

    # Step 3 & 4: Fill in the form with invalid email but valid other details
    driver.find_element(By.ID, "eventName").send_keys("Test Event")
    Select(driver.find_element(By.ID, "eventType")).select_by_value("wedding")
    driver.find_element(By.ID, "eventDate").send_keys("2025-08-01")
    driver.find_element(By.ID, "startTime").send_keys("14:00")
    driver.find_element(By.ID, "endTime").send_keys("18:00")
    driver.find_element(By.ID, "numberofGuests").send_keys("50")
    driver.find_element(By.ID, "contactName").send_keys("John Doe")
    driver.find_element(By.ID, "contactEmail").send_keys("examplegmail.com")  # Invalid email
    driver.find_element(By.ID, "contactPhone").send_keys("0771234567")  # Valid phone
    driver.find_element(By.ID, "specialRequests").send_keys("None")
    driver.find_element(By.ID, "agreeTerms").click()

    # Step 5: Submit the form
    driver.find_element(By.ID, "createEventBookingButton").click()

    # Expected Result 1: Check for email error message
    try:
        error_message = WebDriverWait(driver, 5).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Valid email is required')]"))
        )
        assert error_message.text == "Valid email is required", "Incorrect or missing email validation message"
        print("\033[92mValidation error message displayed as expected.\033[0m")
    except:
        print("\033[91mExpected error message not shown — test FAIL.\033[0m")

    # Expected Result 2: Check that success popup does NOT appear
    # try:
    #     driver.find_element(By.ID, "eventSuccessPopup")
    #     assert False, "No success popup appear and form should NOT submit"
    # except:
    #     print("\033[91mSuccess popup not shown — form submission correctly blocked.\033[0m")

finally:
    time.sleep(5)
    driver.quit()
