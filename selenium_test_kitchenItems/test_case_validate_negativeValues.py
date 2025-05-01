#test_case_validate_negativeValues


from selenium import webdriver
from selenium.webdriver.common.by import By
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
    #  Navigate to KitchenForm
    driver.get("http://localhost:5173/kitchenForm")
    time.sleep(SLOW_DELAY)

    #  Select Category & Type
    Select(driver.find_element(By.ID, "itemCategory")).select_by_visible_text("Food")
    time.sleep(SLOW_DELAY)
    Select(driver.find_element(By.ID, "itemType")).select_by_visible_text("Vegetables")
    time.sleep(SLOW_DELAY)

    # Add 5 items
    items = ["Tomato", "Onion", "Potato", "Carrot", "Cabbage"]
    for item in items:
        Select(driver.find_element(By.ID, "itemNameSelect")).select_by_visible_text(item)
        time.sleep(SLOW_DELAY * 0.5)

    #  Enter one negative value in quantity and price
    driver.find_element(By.ID, "itemQty-Tomato").send_keys("-1")  
    driver.find_element(By.ID, "itemPrice-Tomato").send_keys("50")  
    driver.find_element(By.ID, "itemQty-Onion").send_keys("2")     
    driver.find_element(By.ID, "itemPrice-Onion").send_keys("-10") 
    time.sleep(SLOW_DELAY)

    # Fill remaining items with valid values
    for item in ["Potato", "Carrot", "Cabbage"]:
        driver.find_element(By.ID, f"itemQty-{item}").send_keys("1")
        driver.find_element(By.ID, f"itemPrice-{item}").send_keys("10")
        time.sleep(SLOW_DELAY * 0.3)

    # Set Dates using React-compatible injection
    today = datetime.date.today().isoformat()
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    date_script = """
    const [el, val] = arguments;
    const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    """
    driver.execute_script(date_script, driver.find_element(By.ID, "orderDate"), today)
    driver.execute_script(date_script, driver.find_element(By.ID, "expectedDeliveryDate"), tomorrow)
    time.sleep(SLOW_DELAY)

    # Fill Supplier Info
    driver.find_element(By.ID, "supplierName").send_keys("Test Supplier")
    driver.find_element(By.ID, "supplierContact").send_keys("0771234567")
    Select(driver.find_element(By.ID, "paymentStatus")).select_by_visible_text("Paid")
    driver.find_element(By.ID, "orderedBy").send_keys("Test User")
    driver.find_element(By.ID, "remarks").send_keys("")
    time.sleep(SLOW_DELAY)

    # Submit form
    driver.find_element(By.ID, "submitOrder").click()
    time.sleep(SLOW_DELAY)

    # Check for non-negative validation error
    wait = WebDriverWait(driver, 5)
    error_msg = wait.until(EC.visibility_of_element_located((
        By.XPATH, "//p[contains(text(),'negative values are not valid')]"
    )))
    assert "negative values are not valid" in error_msg.text
    print("✅ Test Passed: Negative values for quantity or price were correctly rejected.")

finally:
    time.sleep(SLOW_DELAY * 3)
    driver.quit()
