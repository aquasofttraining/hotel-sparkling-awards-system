import csv
import time
import re
import hashlib
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

class HotelSparklingAwardsScraper:
    def __init__(self, hotel_urls):
        self.hotel_urls = [url.split('#tab-reviews')[0] for url in hotel_urls]
        self.driver = None

        # Scoring weights
        self.scoring_weights = {
            'review_based': 0.65,
            'metadata_based': 0.35,
            'review_components': {
                'overall_metrics': 0.30,
                'category_ratings': 0.70
            },
            'category_weights': {
                'staff': 0.15,
                'facilities': 0.20,
                'cleanliness': 0.25,
                'comfort': 0.20,
                'value_for_money': 0.10,
                'location': 0.10,
                'free_wifi': 0.05
            }
        }

    def setup_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(
            service=webdriver.chrome.service.Service(ChromeDriverManager().install()),
            options=chrome_options
        )
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.set_page_load_timeout(60)

    def handle_popups(self):
        try:
            cookie_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            cookie_button.click()
            time.sleep(2)
        except:
            pass

    def load_page(self, url):
        print(f"Loading: {url[:50]}...")
        self.driver.get(url)
        time.sleep(8)
        self.handle_popups()
        
        # Scroll to load content
        for i in range(6):
            self.driver.execute_script(f"window.scrollTo(0, document.body.scrollHeight*{i*0.16});")
            time.sleep(3)
        
        time.sleep(8)
        return BeautifulSoup(self.driver.page_source, 'html.parser')

    def extract_hotel_basic_info(self, soup, hotel_id, url):
        """Extract hotel basic information"""
        hotel_data = {}
        
        # Property ID
        hotel_data['GlobalPropertyID'] = hotel_id
        hotel_data['property_hash'] = hashlib.md5(url.encode()).hexdigest()[:12]
        
        # Hotel name
        name_selectors = [
            'h2.ddb12f4f86.pp-header__title',
            'h1[data-testid="title"]',
            'h2[data-testid="title"]'
        ]
        
        for selector in name_selectors:
            name_el = soup.select_one(selector)
            if name_el:
                hotel_data['GlobalPropertyName'] = name_el.get_text(strip=True)
                print(f"Hotel: {hotel_data['GlobalPropertyName']}")
                break
        else:
            hotel_data['GlobalPropertyName'] = f"Hotel {hotel_id}"
        
        # Location
        location_el = soup.select_one('div.b99b6ef58f.cb4b7a25d9')
        if location_el:
            location_text = location_el.get_text(strip=True)
            for keyword in ['Excellent location', 'Good location', 'Very good location', 'Fabulous location']:
                if keyword in location_text:
                    location_text = location_text.split(keyword)[0]
                    break
            hotel_data['PropertyAddress1'] = location_text.strip()
        else:
            # Fallback based on URL
            if '/ro/' in url:
                hotel_data['PropertyAddress1'] = "Bucharest, Romania"
                hotel_data['CityID'] = 1
            elif '/fr/' in url:
                hotel_data['PropertyAddress1'] = "Paris, France"
                hotel_data['CityID'] = 2
            elif '/cn/' in url:
                hotel_data['PropertyAddress1'] = "Beijing, China"
                hotel_data['CityID'] = 3
        
        # Coordinates
        if '/ro/' in url:
            hotel_data['PropertyLatitude'] = 44.4268
            hotel_data['PropertyLongitude'] = 26.1025
        elif '/fr/' in url:
            hotel_data['PropertyLatitude'] = 48.8566
            hotel_data['PropertyLongitude'] = 2.3522
        elif '/cn/' in url:
            hotel_data['PropertyLatitude'] = 39.9042
            hotel_data['PropertyLongitude'] = 116.4074
        
        return hotel_data

    def extract_review_based_features(self, soup):
        """Extract review-based features"""
        review_features = {
            'overall_metrics': {},
            'category_ratings': {}
        }
        
        print("Extracting review features...")
        
        # Overall rating
        rating_el = soup.select_one('div.bc946a29db')
        if rating_el:
            rating_text = rating_el.get_text(strip=True)
            numbers = re.findall(r'\d+\.?\d*', rating_text)
            if numbers:
                score = float(numbers[0])
                review_features['overall_metrics']['overall_rating'] = score
                print(f"Extracted overall rating: {score}")
        
        # Review count
        review_count_el = soup.select_one('span.f63b14ab7a.fb14de7f14.eaa8455879')
        if review_count_el:
            count_text = review_count_el.get_text(strip=True)
            numbers = re.findall(r'\d+', count_text.replace(',', ''))
            if numbers:
                review_features['overall_metrics']['review_count'] = int(numbers[0])
                print(f"Extracted review count: {numbers[0]}")
        
        return review_features

    def run_basic_test(self):
        self.setup_driver()
        try:
            for hotel_id, url in enumerate(self.hotel_urls[:2], 1): 
                soup = self.load_page(url)
                hotel_data = self.extract_hotel_basic_info(soup, hotel_id, url)
                print(f"Extracted: {hotel_data['GlobalPropertyName']}")
                time.sleep(5)
        finally:
            self.driver.quit()


if __name__ == "__main__":
    hotel_urls = [
        "https://www.booking.com/hotel/ro/sofitel-bucharest.en-gb.html",
        "https://www.booking.com/hotel/ro/love-room.html"
    ]
    
    scraper = HotelSparklingAwardsScraper(hotel_urls)
