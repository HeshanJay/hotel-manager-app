from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
from datetime import datetime, timedelta

def main():
    # Set up Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    try:
        driver.maximize_window()
        driver.get("http://localhost:5173/room-booking")

        # Date handling function for React
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
            time.sleep(0.3)

        # Capture initial Booking ID
        initial_booking_id = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "bookingId"))
        ).get_attribute("value")
        print(f"Initial Booking ID: {initial_booking_id}")

        # Test data with valid entries
        test_data = {
            "fullName": "John Doe",
            "email": "test@example.com",
            "phone": "0771234567",
            "address1": "123 Valid Street",
            "state": "Western",
            "zip": "12300",
            "country": "Sri Lanka",
            "checkIn": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "checkOut": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "adults": "2",
            "children": "1",
            "roomType": "deluxe",
            "numberOfRooms": "1"
        }

        # Fill all fields
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
                element.clear()
                element.send_keys(value)
            else:
                element.send_keys(value)

        # Handle terms checkbox
        terms_checkbox = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "checkbox-terms"))
        )
        if not terms_checkbox.is_selected():
            driver.execute_script("arguments[0].click();", terms_checkbox)

        # Submit form
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "confirm-booking-button"))
        )
        submit_button.click()

        # Handle success popup
        try:
            popup = WebDriverWait(driver, 15).until(
                EC.visibility_of_element_located((By.ID, "booking-popup"))
            )
            
            # Close popup
            close_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "close-popup-button"))
            )
            close_button.click()
            
            # Wait for popup to close
            WebDriverWait(driver, 10).until(
                EC.invisibility_of_element_located((By.ID, "booking-popup"))
            )

            # Small delay for DOM stabilization
            time.sleep(0.5)

            # Verify form reset
            print("\nVerifying form reset:")
            
            # Check Booking ID regeneration
            new_booking_id = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "bookingId"))
            ).get_attribute("value")
            print(f"New Booking ID: {new_booking_id}")
            assert new_booking_id != initial_booking_id, "Booking ID not regenerated"
            
            # Verify fields are reset
            fields_to_check = {
                "fullName": "",
                "email": "",
                "phone": "",
                "address1": "",
                "state": "",
                "zip": "",
                "country": "",
                "checkIn": "",
                "checkOut": "",
                "adults": "1",
                "children": "0",
                "roomType": "",
                "numberOfRooms": "1"
            }

            for field_id, expected_value in fields_to_check.items():
                element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, field_id))
                )
                current_value = element.get_attribute("value")
                
                if field_id == "roomType":
                    select = Select(element)
                    current_value = select.first_selected_option.get_attribute("value")
                
                assert current_value == expected_value, \
                    f"Field {field_id} not reset. Expected: {expected_value}, Actual: {current_value}"
                print(f"✔ {field_id} reset verified")

            # Verify terms checkbox is unchecked with fresh reference
            terms_checkbox_refreshed = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "checkbox-terms"))
            )
            assert not terms_checkbox_refreshed.is_selected(), "Terms checkbox not unchecked"
            print("✔ Terms checkbox reset verified")

            print("✅ Test Passed: Form reset successfully after submission")

        except Exception as e:
            print(f"❌ Test Failed: {str(e)}")

    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    main()