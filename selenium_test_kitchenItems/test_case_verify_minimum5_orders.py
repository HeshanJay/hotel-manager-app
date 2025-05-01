# test_case_verify_minimum5_orders.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import datetime
import time

# Setup WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # Navigate to the KitchenForm route
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(2)

    # Select Category & Type
    Select(driver.find_element(By.ID, "itemCategory")) \
        .select_by_visible_text("Food")
    time.sleep(1)
    Select(driver.find_element(By.ID, "itemType")) \
        .select_by_visible_text("Vegetables")
    time.sleep(1)

    # Add only 3 items (fewer than required)
    items = ["Tomato", "Onion", "Potato"]
    for item in items:
        Select(driver.find_element(By.ID, "itemNameSelect")) \
            .select_by_visible_text(item)
        time.sleep(0.5)

    # Fill the rest of the required fields correctly
    today = datetime.date.today().isoformat()
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

    # Set React-controlled date fields via native setter + change event
    set_date_script = """
    const [element, value] = arguments;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    """
    order_date = driver.find_element(By.ID, "orderDate")
    delivery_date = driver.find_element(By.ID, "expectedDeliveryDate")
    driver.execute_script(set_date_script, order_date, today)
    driver.execute_script(set_date_script, delivery_date, tomorrow)

    driver.find_element(By.ID, "supplierName").send_keys("Test Supplier")
    driver.find_element(By.ID, "supplierContact").send_keys("1234567890")
    Select(driver.find_element(By.ID, "paymentStatus")) \
        .select_by_visible_text("Paid")
    driver.find_element(By.ID, "orderedBy").send_keys("John Doe")

    # Attempt to submit the form
    driver.find_element(By.ID, "submitOrder").click()

    # Wait for and check the validation error
    wait = WebDriverWait(driver, 5)
    error_elem = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(text(), 'Minimum 5 items should be selected.')]")
        )
    )
    assert "Minimum 5 items should be selected." in error_elem.text, \
        "❌ Minimum items validation message not displayed."

    # Confirm no success message is displayed
    assert not driver.find_elements(By.ID, "orderSuccess"), \
        "❌ Success message appeared despite too few items."

    print("✅ Test Passed: Validation message displayed for selecting less than 5 items.")

finally:
    time.sleep(15)
    driver.quit()
