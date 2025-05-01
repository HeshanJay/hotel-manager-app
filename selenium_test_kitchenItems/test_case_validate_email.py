from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import datetime
import time

# Speed Control 
SLOW_DELAY = 2

# Setup WebDriver 
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.maximize_window()

try:
    # Open the KitchenForm page
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    #  Select item category and type
    Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
    time.sleep(SLOW_DELAY)
    Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
    time.sleep(SLOW_DELAY)

    # Add 5 items with quantity and price
    items = ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]
    for item in items:
        Select(driver.find_element(By.ID, "itemNameSelect")).select_by_visible_text(item)
        time.sleep(SLOW_DELAY * 0.5)
        driver.find_element(By.ID, f"itemQty-{item}").send_keys("1")
        driver.find_element(By.ID, f"itemPrice-{item}").send_keys("10")
        time.sleep(SLOW_DELAY * 0.3)

    # Set orderDate and expectedDeliveryDate
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
    time.sleep(SLOW_DELAY)

    # Fill supplier name and invalid email
    driver.find_element(By.ID, "supplierName").send_keys("Test Supplier")
    supplier_contact = driver.find_element(By.ID, "supplierContact")
    supplier_contact.send_keys("invalidemail.com")  
    supplier_contact.send_keys(Keys.TAB)  
    time.sleep(SLOW_DELAY)

    # Wait for email validation error
    wait = WebDriverWait(driver, 5)
    error = wait.until(EC.visibility_of_element_located((
        By.XPATH,
        "//input[@id='supplierContact']/following-sibling::p[contains(text(),'Enter the valid email')]"
    )))
    msg = error.text.strip()
    print("🔍 Validation message shown:", msg)
    assert "Enter the valid email" in msg
    print("✅ Test Passed: Invalid email format correctly showed validation message.")

finally:
    time.sleep(SLOW_DELAY * 2)
    driver.quit()
