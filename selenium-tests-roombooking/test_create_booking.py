from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def main():
    # Set up Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
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

        # Set dates
        set_date("checkIn", "2025-06-01")
        set_date("checkOut", "2025-06-03")

        # Fill guest numbers
        driver.find_element(By.ID, "adults").clear()
        driver.find_element(By.ID, "adults").send_keys("2")
        driver.find_element(By.ID, "children").clear()
        driver.find_element(By.ID, "children").send_keys("1")

        # Select room type
        room_dropdown = driver.find_element(By.ID, "roomType")
        room_dropdown.send_keys("Deluxe Room")

        # Select number of rooms
        rooms_dropdown = driver.find_element(By.ID, "numberOfRooms")
        rooms_dropdown.send_keys("2")

        # Select additional services
        services = ["breakfast", "airport-transfer"]
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
        time.sleep(5)

        # Verify success popup
        try:
            popup = WebDriverWait(driver, 15).until(
                EC.visibility_of_element_located((By.ID, "booking-popup"))
            )
            print("✔ Form submission success as expected")  # First success message
            
            # Verify booking ID format
            booking_id = driver.find_element(
                By.XPATH, "//div[@id='popup-summary']/p[1]").text
            assert "BK-" in booking_id, "Invalid booking ID format"
            
            # Verify total cost
            total_cost = driver.find_element(By.ID, "total-cost-amount").text
            assert "207000.00" in total_cost, "Incorrect total cost calculation"
            
            print("✅ Test Passed: Booking successfully created")  # Second success message
            
            # Close popup
            driver.find_element(By.ID, "close-popup-button").click()
            WebDriverWait(driver, 5).until(
                EC.invisibility_of_element_located((By.ID, "booking-popup"))
            )

        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            errors = driver.find_elements(By.CSS_SELECTOR, ".text-red-600")
            if errors:
                print("Validation errors:")
                for error in errors:
                    print(f" - {error.text}")

    finally:
        driver.quit()

if __name__ == "__main__":
    main()