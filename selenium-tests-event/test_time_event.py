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
    time.sleep(1)  # Allow page to load

    # Fill in the form with valid data but invalid time logic (startTime > endTime)
    event_name = driver.find_element(By.ID, "eventName")
    event_name.clear()
    event_name.send_keys("Test Event")

    Select(driver.find_element(By.ID, "eventType")).select_by_value("wedding")

    # Use JavaScript to set event date (in case of input event issues)
    event_date = driver.find_element(By.ID, "eventDate")
    valid_date = "2025-08-01"
    set_date_script = """
    const [element, value] = arguments;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    """
    driver.execute_script(set_date_script, event_date, valid_date)
    time.sleep(0.5)

    # Set time values
    driver.find_element(By.ID, "startTime").send_keys("16:00")  # 4:00 PM
    driver.find_element(By.ID, "endTime").send_keys("13:00")    # 1:00 PM

    driver.find_element(By.ID, "numberofGuests").send_keys("50")
    driver.find_element(By.ID, "contactName").send_keys("John Doe")
    driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
    driver.find_element(By.ID, "contactPhone").send_keys("1234567890")
    driver.find_element(By.ID, "specialRequests").send_keys("None")
    driver.find_element(By.ID, "agreeTerms").click()

    # Submit the form
    driver.find_element(By.ID, "createEventBookingButton").click()

    # Wait for the error message
    error_message = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'End time must be after start time')]"))
    )

    assert error_message.text == "End time must be after start time", \
        "Expected error message 'End time must be after start time' not displayed"

    # Ensure success popup is not shown
    try:
        driver.find_element(By.ID, "eventSuccessPopup")
        assert False, "Success popup appeared, but form should not have submitted"
    except:
        pass  # Expected behavior

    print("\033[92mTest for end time validation passed!\033[0m")

finally:
    time.sleep(2)
    driver.quit()




# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.support.ui import Select
# import time

# # Set up the Chrome WebDriver
# driver = webdriver.Chrome()

# try:
#     # Navigate to the Event Booking page
#     driver.get("http://localhost:5173/event-booking")

#     # Fill in the form with valid data, setting start time later than end time
#     driver.find_element(By.ID, "eventName").send_keysclear("Test Event")
#     select_event_type = Select(driver.find_element(By.ID, "eventType"))
#     select_event_type.select_by_value("wedding")
#     driver.find_element(By.ID, "eventDate").send_keys("2025-08-01")
#     driver.find_element(By.ID, "startTime").send_keys("16:00")  # 4:00 PM
#     driver.find_element(By.ID, "endTime").send_keys("13:00")   # 1:00 PM
#     driver.find_element(By.ID, "numberofGuests").send_keys("50")
#     driver.find_element(By.ID, "contactName").send_keys("John Doe")
#     driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
#     driver.find_element(By.ID, "contactPhone").send_keys("1234567890")
#     driver.find_element(By.ID, "specialRequests").send_keys("None")
#     driver.find_element(By.ID, "agreeTerms").click()
#     time.sleep(5)

#     # Submit the form
#     driver.find_element(By.ID, "createEventBookingButton").click()

#     # Wait for the error message to appear (under the endTime field)
#     error_message = WebDriverWait(driver, 5).until(
#         EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'End time must be after start time')]"))
#     )

#     # Verify the error message
#     assert error_message.text == "End time must be after start time", "Expected error message 'End time must be after start time' not displayed"

#     # Verify that the success popup does NOT appear
#     try:
#         driver.find_element(By.ID, "eventSuccessPopup")
#         assert False, "Success popup appeared, but form should not have submitted"
#     except:
#         # Expected behavior: success popup is not present
#         pass

#     print("\033[92mTest for end time validation passed!\033[0m")

# finally:
#     # Wait briefly to ensure stability
#     time.sleep(5)

#     # Close the browser
#     driver.quit()