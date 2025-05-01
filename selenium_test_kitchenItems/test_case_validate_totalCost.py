# test_case_validate_totalCost.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import datetime
import time

# === Speed Control ===
SLOW_DELAY = 1  # Reduced for faster execution

# --- Setup WebDriver ---
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # Navigate to KitchenForm
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    # Select Category & Type
    Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
    time.sleep(SLOW_DELAY)
    Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
    time.sleep(SLOW_DELAY)

    # Add 5 items with quantity and price
    items = [
        ("Tomato", 2, 5),
        ("Onion", 3, 4),
        ("Potato", 1, 10),
        ("Carrot", 5, 2),
        ("Cabbage", 2, 8),
    ]
    total_expected = 0
    for name, qty_val, price_val in items:
        Select(driver.find_element(By.ID, "itemNameSelect")).select_by_visible_text(name)
        time.sleep(SLOW_DELAY * 0.5)
        driver.find_element(By.ID, f"itemQty-{name}").send_keys(str(qty_val))
        driver.find_element(By.ID, f"itemPrice-{name}").send_keys(str(price_val))
        total_expected += qty_val * price_val
        time.sleep(SLOW_DELAY * 0.2)

    # Fill other required fields
    today = datetime.date.today().isoformat()
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    set_date_script = """
    const [el, val] = arguments;
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    """
    driver.execute_script(set_date_script, driver.find_element(By.ID, "orderDate"), today)
    driver.execute_script(set_date_script, driver.find_element(By.ID, "expectedDeliveryDate"), tomorrow)

    driver.find_element(By.ID, "supplierName").send_keys("Test Supplier")
    driver.find_element(By.ID, "supplierContact").send_keys("1234567890")
    Select(driver.find_element(By.ID, "paymentStatus")).select_by_visible_text("Paid")
    driver.find_element(By.ID, "orderedBy").send_keys("John Doe")
    driver.find_element(By.ID, "remarks").send_keys("Calculating total cost.")

    # Submit form
    driver.find_element(By.ID, "submitOrder").click()

    # Validate Grand Total
    wait = WebDriverWait(driver, 10)
    total_p = wait.until(EC.visibility_of_element_located((
        By.XPATH, "//p[strong[text()='Grand Total:']]"
    )))
    popup_text = total_p.text
    displayed = float(popup_text.split("Rs.")[1].strip())

    assert abs(displayed - total_expected) < 0.01, (
        f"❌ Mismatch in total: Expected {total_expected}, Got {displayed}"
    )
    print(f"✅ Test Passed: Total cost correctly calculated ({displayed} Rs)")

finally:
    time.sleep(SLOW_DELAY * 3)
    driver.quit()
