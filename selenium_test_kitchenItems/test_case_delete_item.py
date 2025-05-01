# test_case_delete_item.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import datetime
import time

# Delay Multiplier 
SLOW_DELAY = 2  

# Setup WebDriver using Service 
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    #  Navigate to the KitchenForm
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    # Select Category & Type
    Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
    time.sleep(SLOW_DELAY)
    Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
    time.sleep(SLOW_DELAY)

    #  Add 5 distinct items
    items = ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]
    for item in items:
        Select(driver.find_element(By.ID, "itemNameSelect"))\
            .select_by_visible_text(item)
        time.sleep(SLOW_DELAY * 0.5)

    # Verify 5 item-rows exist
    qty_fields = driver.find_elements(By.CSS_SELECTOR, 'input[id^="itemQty-"]')
    assert len(qty_fields) == 5, f"❌ Expected 5 items, but found {len(qty_fields)}"
    print("✅ 5 items successfully added")

    #  Delete 'Potato'
    driver.find_element(By.ID, "itemDelete-Potato").click()
    time.sleep(SLOW_DELAY)

    #  Verify deletion
    remaining = [el.get_attribute("id").split("-")[1] for el in 
                 driver.find_elements(By.CSS_SELECTOR, 'input[id^="itemQty-"]')]
    assert "Potato" not in remaining, "❌ 'Potato' was not deleted."
    assert len(remaining) == 4, f"❌ Expected 4 items after deletion, but found {len(remaining)}"
    print("✅ 'Potato' successfully deleted. 4 items remain.")


    # Dates 
    today = datetime.date.today().isoformat()
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()

    date_script = """
    const [element, value] = arguments;
    const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    """
    driver.execute_script(date_script, driver.find_element(By.ID, "orderDate"), today)
    driver.execute_script(date_script, driver.find_element(By.ID, "expectedDeliveryDate"), tomorrow)
    time.sleep(SLOW_DELAY)

    driver.find_element(By.ID, "supplierName").send_keys("Test Supplier")
    time.sleep(SLOW_DELAY * 0.5)
    driver.find_element(By.ID, "supplierContact").send_keys("1234567890")
    time.sleep(SLOW_DELAY * 0.5)

    Select(driver.find_element(By.ID, "paymentStatus")).select_by_visible_text("Paid")
    driver.find_element(By.ID, "orderedBy").send_keys("John Doe")
    driver.find_element(By.ID, "remarks").send_keys("Testing item deletion.")
    time.sleep(SLOW_DELAY)

    print("✅ Test Passed: Deletion of an added item works correctly")

finally:
    time.sleep(SLOW_DELAY * 3)
    driver.quit()
