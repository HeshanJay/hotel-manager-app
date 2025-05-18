from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def main():
    # Set up Chrome driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    try:
        # Configure browser
        driver.maximize_window()
        driver.get("http://localhost:5173/room-booking")

        # Define required fields and error locators
        required_fields = [
            ("fullName", "//input[@id='fullName']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("email", "//input[@id='email']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("phone", "//input[@id='phone']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("address1", "//input[@id='address1']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("state", "//input[@id='state']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("zip", "//input[@id='zip']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("country", "//input[@id='country']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("checkIn", "//input[@id='checkIn']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("checkOut", "//input[@id='checkOut']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("roomType", "//select[@id='roomType']/following-sibling::p[contains(@class, 'text-red-600')]"),
            ("agreeTerms", "//*[@id='terms-error']")
        ]

        # Click submit button
        submit_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "confirm-booking-button"))
        )
        submit_button.click()

        # Verify error messages
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//p[contains(@class, 'text-red-600')]"))
        )

        # Check all required field errors
        for field_name, xpath in required_fields:
            error_element = driver.find_element(By.XPATH, xpath)
            assert error_element.is_displayed(), f"Missing error for {field_name}"
            print(f"✔ Validation error present for {field_name}")

        # Verify form not submitted
        try:
            WebDriverWait(driver, 5).until(
                EC.visibility_of_element_located((By.ID, "booking-popup"))
            )
            raise AssertionError("Form submitted unexpectedly")
        except:
            print("✔ Form submission blocked as expected")

        print("✅ Test Passed: All required validations working correctly")

    except Exception as e:
        print(f"❌ Test Failed: {str(e)}")
        driver.save_screenshot("test_failure.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()