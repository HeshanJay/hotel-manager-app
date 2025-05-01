# test_case_ItemsOrdering.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time

# Speed Control 
SLOW_DELAY = 2  

# Set up WebDriver
driver = webdriver.Chrome()
driver.get("http://localhost:5173/kitchenForm")  
driver.maximize_window()
time.sleep(SLOW_DELAY)

# Select Item Category 
Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
time.sleep(SLOW_DELAY)

# Select Item Type 
Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
time.sleep(SLOW_DELAY)

# Add 5 Items 
for item in ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]:
    Select(driver.find_element(By.ID, "itemNameSelect")).select_by_visible_text(item)
    time.sleep(SLOW_DELAY)

# Fill Qty and Price 
for item in ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]:
    qty = driver.find_element(By.ID, f"itemQty-{item}")
    price = driver.find_element(By.ID, f"itemPrice-{item}")
    qty.clear()
    qty.send_keys("2")
    price.clear()
    price.send_keys("50")
    time.sleep(SLOW_DELAY * 0.5)

# Fill Dates using native JS setter for React 
order_date = driver.find_element(By.ID, "orderDate")
delivery_date = driver.find_element(By.ID, "expectedDeliveryDate")
today = time.strftime("%Y-%m-%d")

set_date_script = """
const [element, value] = arguments;
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value').set;
nativeInputValueSetter.call(element, value);
element.dispatchEvent(new Event('input', { bubbles: true }));
element.dispatchEvent(new Event('change', { bubbles: true }));
"""

driver.execute_script(set_date_script, order_date, today)
driver.execute_script(set_date_script, delivery_date, today)
time.sleep(SLOW_DELAY)

# Fill Supplier Name and Contact 
driver.find_element(By.ID, "supplierName").send_keys("Best Supplier Co.")
time.sleep(SLOW_DELAY * 0.5)
driver.find_element(By.ID, "supplierContact").send_keys("0771234567")
time.sleep(SLOW_DELAY * 0.5)

# Select Payment Status 
Select(driver.find_element(By.ID, "paymentStatus")).select_by_visible_text("Paid")
time.sleep(SLOW_DELAY)

# Ordered By and Remarks 
driver.find_element(By.ID, "orderedBy").send_keys("Herath H.M.R.M.K")
driver.find_element(By.ID, "remarks").send_keys("Deliver before 5 PM")
time.sleep(SLOW_DELAY)

# Submit the Form 
driver.find_element(By.ID, "submitOrder").click()
time.sleep(SLOW_DELAY * 3)

# Validate Confirmation Popup 
confirmation_msg = driver.find_element(By.ID, "orderSuccess").text
assert "Your order has been placed" in confirmation_msg
print("✅ Test Passed: Form successfully submitted and confirmation received.")

# Close browser
driver.quit()
