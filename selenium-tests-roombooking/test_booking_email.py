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

        # Date handling function for React inputs
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
            time.sleep(0.2)  # Allow React state update

        # Test data with invalid email
        test_data = {
            "fullName": "John Doe",
            "email": "heshan123",  # Invalid email
            "phone": "0771234567",
            "address1": "123 Valid Street",
            "state": "Western",
            "zip": "12300",
            "country": "Sri Lanka",
            "checkIn": "2025-06-01",
            "checkOut": "2025-06-03",
            "adults": "2",
            "children": "1",
            "roomType": "deluxe",
            "numberOfRooms": "1"
        }

        # Fill all form fields
        for field_id, value in test_data.items():
            element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, field_id))
            )
            
            if field_id in ["checkIn", "checkOut"]:
                set_date(field_id, value)
            elif field_id == "roomType":
                Select(element).select_by_value(value)
            elif field_id == "numberOfRooms":
                Select(element).select_by_visible_text(value)
            elif field_id in ["adults", "children"]:
                # Clear existing values properly
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

        # Verify email validation error
        try:
            error_element = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((
                    By.XPATH,
                    "//input[@id='email']/following-sibling::p[contains(@class, 'text-red-600')]"
                ))
            )
            
            # Validate error message content
            assert "Email is invalid" in error_element.text, "Incorrect error message text"
            
            # Verify error icon visibility
            assert error_element.find_element(By.TAG_NAME, "svg").is_displayed(), "Error icon missing"
            
            print("✔ Email validation error displayed correctly")

            # Verify form submission blocked
            try:
                WebDriverWait(driver, 5).until(
                    EC.visibility_of_element_located((By.ID, "booking-popup"))
                )
                raise AssertionError("Form submitted with invalid email")
            except:
                print("✔ Form submission blocked as expected")

            print("✅ Test Passed: Email validation working correctly")

        except Exception as e:
            print(f"❌ Test Failed: {str(e)}")

    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    main()