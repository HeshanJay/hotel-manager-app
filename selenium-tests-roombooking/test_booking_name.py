from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import time

def main():
    # Set up Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    try:
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
            time.sleep(0.2)  # Short pause for React state update

        # Test data
        invalid_name = "Nimsara123 Perera"
        valid_data = {
            "email": "test@example.com",
            "phone": "0771234567",
            "address1": "123 Valid Street",
            "state": "Western",
            "zip": "12300",
            "country": "Sri Lanka",
            "checkIn": "2025-06-01",  # Updated to 2025
            "checkOut": "2025-06-03",  # Updated to 2025
            "adults": "2",
            "children": "1",
            "roomType": "deluxe",
            "numberOfRooms": "1"
        }

        # Enter invalid full name
        name_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "fullName"))
        )
        name_field.send_keys(invalid_name)

        # Set dates using dedicated function
        set_date("checkIn", valid_data["checkIn"])
        set_date("checkOut", valid_data["checkOut"])

        # Fill other valid fields
        for field_id, value in valid_data.items():
            # Skip already handled fields
            if field_id in ["checkIn", "checkOut"]:
                continue
                
            element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, field_id))
            )
            
            if field_id == "roomType":
                Select(element).select_by_value(value)
            elif field_id == "numberOfRooms":
                Select(element).select_by_visible_text(value)
            elif field_id in ["adults", "children"]:
                element.send_keys(Keys.BACKSPACE * len(element.get_attribute('value')))
                element.send_keys(value)
            else:
                element.send_keys(value)

        # Handle terms checkbox
        terms_checkbox = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "checkbox-terms"))
        )
        if not terms_checkbox.is_selected():
            terms_checkbox.click()
        # Submit form
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "confirm-booking-button"))
        )
        submit_button.click()

        # Verify validation error
        error_element = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((
                By.XPATH,
                "//input[@id='fullName']/following-sibling::p[contains(@class, 'text-red-600')]"
            ))
        )
        
        assert "Only letters and spaces allowed" in error_element.text
        assert error_element.find_element(By.TAG_NAME, "svg").is_displayed()
        print("✔ Full name validation error displayed correctly")  # New checkmark

        # Verify no submission
        try:
            WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.ID, "booking-popup"))
            )
            raise AssertionError("Form submitted unexpectedly")
        except:
            print("✔ Form submission blocked as expected")  # Updated message

        print("✅ Test Passed: Full name validation working correctly")  # Final message

    except Exception as e:
        print(f"❌ Test Failed: {str(e)}")
        driver.save_screenshot("test_failure.png")
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    main()