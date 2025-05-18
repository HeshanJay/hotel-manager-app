from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
import time
import traceback

def main():
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    
    # Disable logging
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    # Set up Chrome driver with options
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"⚠️ Error setting up WebDriver: {str(e)}")
        # Try alternative method if the ChromeDriverManager fails
        try:
            driver = webdriver.Chrome(options=chrome_options)
            print("✅ Successfully created WebDriver with alternative method")
        except Exception as e:
            print(f"❌ Failed to create WebDriver: {str(e)}")
            return
    try:
        # Configure browser
        driver.maximize_window()
        driver.get("http://localhost:5173/room-booking")

        # Date handling function
        def set_date(field_id, date_str):
            driver.execute_script(f"""
                const input = document.getElementById('{field_id}');
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                ).set;
                nativeInputValueSetter.call(input, '{date_str}');
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
                input.dispatchEvent(new Event('change', {{ bubbles: true }}));
            """)
            time.sleep(0.5)

        # Fill personal information
        personal_info = {
            "fullName": "John Doe",
            "email": "john@example.com",
            "phone": "0771234567",
            "address1": "123 Main Street",
            "state": "Western Province",
            "zip": "12300",
            "country": "Sri Lanka"
        }

        for field_id, value in personal_info.items():
            element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, field_id))
            )
            element.send_keys(value)

        # Set dates as per requirements
        set_date("checkIn", "2025-06-10")
        set_date("checkOut", "2025-06-15")

        # Fill guest numbers with better error handling
        try:
            adults_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "adults"))
            )
            adults_field.clear()
            adults_field.send_keys("2")
            
            children_field = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "children"))
            )
            children_field.clear()
            children_field.send_keys("0")
        except Exception as e:
            print(f"⚠️ Error setting guest numbers: {str(e)}")
            
        # Select room type as Standard Room
        try:
            room_dropdown = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "roomType"))
            )
            room_dropdown.send_keys("Standard Room")
        except Exception as e:
            print(f"⚠️ Error selecting room type: {str(e)}")

        # Select number of rooms to 1 with better error handling
        try:
            # Try using a different approach for the number of rooms dropdown
            # First check if it's a select element
            try:
                rooms_dropdown = Select(WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "numberOfRooms"))
                ))
                rooms_dropdown.select_by_visible_text("1")
                # Removed the success message about selecting number of rooms
            except Exception as e:
                # If Select doesn't work, try JavaScript approach
                print(f"⚠️ Select approach failed, trying JavaScript: {str(e)}")
                driver.execute_script("""
                    const dropdown = document.getElementById('numberOfRooms');
                    if (dropdown) {
                        dropdown.value = "1";
                        dropdown.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                """)
                print("✅ Set number of rooms using JavaScript")
        except Exception as e:
            print(f"⚠️ Error setting number of rooms: {str(e)}")

        # Select additional services - Breakfast and Golf
        services = ["breakfast", "golf"]
        for service in services:
            try:
                checkbox = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((
                        By.XPATH,
                        f"//label[@id='service-{service}']//input[@type='checkbox']"
                    ))
                )
                if not checkbox.is_selected():
                    checkbox.click()
            except Exception as e:
                print(f"⚠️ Failed to select {service} service: {str(e)}")

        # Wait a bit for the form to calculate totals
        print("Waiting for the form to calculate total cost...")
        time.sleep(3)
        
        # Verify preliminary total cost on form - try multiple approaches
        try:
            # Try different element locators for the total cost display
            locators = [
                (By.ID, "total-cost-display"),
                (By.CLASS_NAME, "total-price"),
                (By.XPATH, "//div[contains(@class, 'total') or contains(text(), 'Total')]"),
                (By.XPATH, "//div[contains(text(), 'Rs') and contains(text(), '270,000')]"),
                (By.XPATH, "//span[contains(text(), 'Total') or contains(text(), 'Cost')]/following-sibling::*")
            ]
            
            total_cost_element = None
            for locator_type, locator_value in locators:
                try:
                    # Removed the "Trying to locate" messages
                    total_cost_element = WebDriverWait(driver, 2).until(
                        EC.presence_of_element_located((locator_type, locator_value))
                    )
                    if total_cost_element:
                        break
                except:
                    continue
            
            if total_cost_element:
                form_total_cost = total_cost_element.text.strip()
                # Removed "Found total cost element with text" messages
                
                # Check for various formats of the expected cost
                expected_formats = ["Rs. 270,000.00", "Rs. 270000", "270,000", "270000", "Rs.270,000"]
                cost_verified = any(expected_format in form_total_cost for expected_format in expected_formats)
                
                if cost_verified:
                    # Removed the success message about preliminary total cost
                    pass
                else:
                    print(f"⚠️ Preliminary total cost may be different. Got: {form_total_cost}")
            else:
                # Try using JavaScript to find total on the page
                print("Trying JavaScript approach to find total cost...")
                js_result = driver.execute_script("""
                    // Try to find any element with text containing the total cost
                    const elements = Array.from(document.querySelectorAll('*'));
                    const totalElement = elements.find(el => 
                        el.textContent && (
                            el.textContent.includes('270,000') || 
                            el.textContent.includes('270000') ||
                            (el.textContent.includes('Rs') && el.textContent.includes('270'))
                        )
                    );
                    return totalElement ? totalElement.textContent : null;
                """)
                
                if js_result:
                    print(f"✅ Found total cost using JavaScript: {js_result}")
                else:
                    print("⚠️ Could not find preliminary total cost, but will continue with test")
        except Exception as e:
            print(f"⚠️ Couldn't verify preliminary total cost, but continuing test: {str(e)}")
            # Continue with the test even if we can't verify the preliminary total

        # Agree to terms
        terms_checkbox = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "checkbox-terms"))
        )
        if not terms_checkbox.is_selected():
            terms_checkbox.click()

        # Submit form
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "confirm-booking-button"))
        )
        submit_button.click()

        # Wait to observe the result
        time.sleep(3)

        # Verify success popup
        try:
            popup = WebDriverWait(driver, 15).until(
                EC.visibility_of_element_located((By.ID, "booking-popup"))
            )
            
            # Verify booking ID format
            booking_id = driver.find_element(
                By.XPATH, "//div[@id='popup-summary']/p[1]").text
            assert "BK-" in booking_id, "Invalid booking ID format"
            
            # Verify total cost in popup
            popup_total_cost = driver.find_element(By.ID, "total-cost-amount").text
            expected_popup_cost = "270000.00"
            
            if expected_popup_cost in popup_total_cost:
                # Removed the popup total cost verification message
                pass
            else:
                print(f"❌ Popup total cost incorrect. Expected: {expected_popup_cost}, Got: {popup_total_cost}")
            
            # Calculate and verify cost components
            nights = 5  # 2025-06-10 to 2025-06-15 = 5 nights
            room_cost = nights * 1 * 30000  # 5 nights × 1 standard room × 30,000
            breakfast_cost = 2 * nights * 3000  # 2 adults × 5 nights × 3,000
            golf_cost = 2 * nights * 9000  # 2 adults × 5 nights × 9,000
            total_expected = room_cost + breakfast_cost + golf_cost  # Should be 270,000
            
            print("\n--- Cost Calculation Breakdown ---")
            print(f"Room Cost: Rs. {room_cost} (5 nights × 1 standard room × 30,000)")
            print(f"Breakfast Cost: Rs. {breakfast_cost} (2 adults × 5 nights × 3,000)")
            print(f"Golf Cost: Rs. {golf_cost} (2 adults × 5 nights × 9,000)")
            print(f"Total Expected: Rs. {total_expected}")
            
            # Overall test result
            if expected_popup_cost in popup_total_cost:
                print("\n✅ TEST PASSED: Total cost calculation is accurate")
                driver.save_screenshot("cost_calculation_passed.png")
            else:
                print("\n❌ TEST FAILED: Total cost calculation is incorrect")
                driver.save_screenshot("cost_calculation_failed.png")
            
            # Close popup
            driver.find_element(By.ID, "close-popup-button").click()
            WebDriverWait(driver, 5).until(
                EC.invisibility_of_element_located((By.ID, "booking-popup"))
            )

        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            print("Stacktrace:")
            traceback.print_exc()
            try:
                errors = driver.find_elements(By.CSS_SELECTOR, ".text-red-600")
                if errors:
                    print("Validation errors:")
                    for error in errors:
                        print(f" - {error.text}")
                driver.save_screenshot("cost_calculation_test_failure.png")
            except:
                print("Could not capture additional error information")

    finally:
        try:
            driver.quit()
        except Exception as e:
            print(f"⚠️ Error while closing driver: {str(e)}")

if __name__ == "__main__":
    main()