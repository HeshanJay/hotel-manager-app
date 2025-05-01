# test_case_verify_order_number.py

from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# Set up WebDriver
driver = webdriver.Chrome()
driver.get("http://localhost:5173/kitchenForm") 
driver.maximize_window()
time.sleep(20)

# Check Auto-generated Order ID 
order_id_field = driver.find_element(By.ID, "orderId")
order_id_value = order_id_field.get_attribute("value")

assert order_id_value.startswith("ORD-"), "❌ Order ID is not auto-generated correctly"
assert order_id_field.get_attribute("readonly") == 'true', "❌ Order ID field is not read-only"

print(f"✅ Order ID auto-generated: {order_id_value}")

# Check other key fields are visible and enabled 
fields_to_check = [
    "itemCategory", "orderDate", "expectedDeliveryDate",
    "supplierName", "supplierContact", "paymentStatus", "orderedBy"
]

for field_id in fields_to_check:
    field = driver.find_element(By.ID, field_id)
    assert field.is_displayed(), f"❌ Field '{field_id}' is not visible"
    assert field.is_enabled(), f"❌ Field '{field_id}' is not enabled"
    print(f"✅ Field '{field_id}' is visible and enabled")

# Close browser
driver.quit()
