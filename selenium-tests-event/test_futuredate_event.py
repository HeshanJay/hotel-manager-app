from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
import time

# Set up the Chrome WebDriver
driver = webdriver.Chrome()

try:
    # Step 1: Navigate to Event Booking page
    driver.get("http://localhost:5173/event-booking")
    time.sleep(1)

    # Step 2: Fill the form except eventDate for now
    driver.find_element(By.ID, "eventName").send_keys("Test Event")
    Select(driver.find_element(By.ID, "eventType")).select_by_value("wedding")
    driver.find_element(By.ID, "startTime").send_keys("14:00")
    driver.find_element(By.ID, "endTime").send_keys("18:00")
    driver.find_element(By.ID, "numberofGuests").send_keys("50")
    driver.find_element(By.ID, "contactName").send_keys("John Doe")
    driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
    driver.find_element(By.ID, "contactPhone").send_keys("0771234567")
    driver.find_element(By.ID, "specialRequests").send_keys("None")
    driver.find_element(By.ID, "agreeTerms").click()

    # Step 3: Set a past event date using JavaScript to trigger input/change events
    event_date = driver.find_element(By.ID, "eventDate")
    past_date = "2023-01-01"

    set_date_script = """
    const [element, value] = arguments;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    """
    driver.execute_script(set_date_script, event_date, past_date)
    time.sleep(0.5)

    # Step 4: Submit the form
    driver.find_element(By.ID, "createEventBookingButton").click()

    # Step 5: Check for date error message
    error_message = WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Event date must be in the future')]"))
    )
    assert error_message.text == "Event date must be in the future", "Expected error message not displayed"

    # Step 6: Ensure success popup is NOT shown
    try:
        driver.find_element(By.ID, "eventSuccessPopup")
        assert False, "Success popup appeared — form should NOT submit"
    except:
        print("\033[92mSuccess popup not shown — form submission correctly blocked.\033[0m")

    print("\033[92mTest for future date validation passed!\033[0m")

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
#     # Step 2: Navigate to Event Booking page
#     driver.get("http://localhost:5173/event-booking")

#     # Step 3 & 4: Fill the form with a past date and valid other data
#     driver.find_element(By.ID, "eventName").send_keys("Test Event")
#     Select(driver.find_element(By.ID, "eventType")).select_by_value("wedding")
#     driver.find_element(By.ID, "eventDate").send_keys("2023-01-01")  # Past date
#     driver.find_element(By.ID, "startTime").send_keys("14:00")
#     driver.find_element(By.ID, "endTime").send_keys("18:00")
#     driver.find_element(By.ID, "numberofGuests").send_keys("50")
#     driver.find_element(By.ID, "contactName").send_keys("John Doe")
#     driver.find_element(By.ID, "contactEmail").send_keys("john.doe@example.com")
#     driver.find_element(By.ID, "contactPhone").send_keys("0771234567")
#     driver.find_element(By.ID, "specialRequests").send_keys("None")
#     driver.find_element(By.ID, "agreeTerms").click()

#     # Step 5: Submit the form
#     driver.find_element(By.ID, "createEventBookingButton").click()

#     # Expected Result 1: Check for date error message
#     error_message = WebDriverWait(driver, 5).until(
#         EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Event date must be in the future')]"))
#     )
#     assert error_message.text == "Event date must be in the future", "Expected error message not displayed"

#     # Expected Result 2: Ensure success popup is NOT shown
#     try:
#         driver.find_element(By.ID, "eventSuccessPopup")
#         assert False, "Success popup appeared — form should NOT submit"
#     except:
#         print("\033[92mSuccess popup not shown — form submission correctly blocked.\033[0m")

#     print("\033[92mTest for future date validation passed!\033[0m")

# finally:
#     time.sleep(5)
#     driver.quit()
