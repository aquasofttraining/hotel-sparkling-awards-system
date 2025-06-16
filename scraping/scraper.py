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
            
        # Category ratings
        print("Extracting category ratings...")

        processed_categories = set()
        category_containers = soup.select('div[data-testid="review-subscore"]')

        print(f"Found {len(category_containers)} category containers")

        for container in category_containers:
            try:
                category_name_el = container.select_one('span.d96a4619c0')
                if not category_name_el:
                    continue
                
                category_name = category_name_el.get_text(strip=True).lower().replace(' ', '_')
                
                if category_name in processed_categories:
                    continue
                
                category_score_el = container.select_one('div.a9918d47bf.f87e152973')
                if not category_score_el:
                    continue
                
                try:
                    score = float(category_score_el.get_text(strip=True))
                    print(f"Processing category: {category_name} with score: {score}")
                    
                    # Maping
                    category_mapping = {
                        'staff': (1, self.scoring_weights['category_weights']['staff']),
                        'facilities': (2, self.scoring_weights['category_weights']['facilities']),
                        'cleanliness': (3, self.scoring_weights['category_weights']['cleanliness']),
                        'comfort': (4, self.scoring_weights['category_weights']['comfort']),
                        'value_for_money': (5, self.scoring_weights['category_weights']['value_for_money']),
                        'location': (6, self.scoring_weights['category_weights']['location']),
                        'free_wifi': (7, self.scoring_weights['category_weights']['free_wifi'])
                    }
                    
                    for standard_category, (category_id, weight) in category_mapping.items():
                        if (standard_category == category_name or 
                            standard_category in category_name or 
                            category_name.startswith(standard_category.split('_')[0])):
                            
                            review_features['category_ratings'][standard_category] = {
                                'score': score,
                                'category_id': category_id,
                                'weight': weight
                            }
                            processed_categories.add(category_name)
                            print(f"Mapped {category_name} -> {standard_category}")
                            break
                            
                except ValueError:
                    continue
                
            except Exception as e:
                print(f"Error processing category: {e}")
                continue

        print(f"Final extracted categories: {list(review_features['category_ratings'].keys())}")

    def extract_metadata_features(self, soup):
        """Extract metadata features for scoring algorithm"""
        metadata = {
            'accommodation_metrics': {},
            'location_quality': {},
            'facility_metrics': {}
        }
        
        # Accommodation type
        accommodation_el = soup.select_one('table.cdd0659f86 tbody tr th span')
        if accommodation_el:
            metadata['accommodation_metrics']['room_type'] = accommodation_el.get_text(strip=True)
        
        # Guest capacity
        capacity_el = soup.select_one('div.f3e8df388a.aa7d246d7d')
        if capacity_el:
            capacity_text = capacity_el.get_text(strip=True)
            numbers = re.findall(r'\d+', capacity_text)
            metadata['accommodation_metrics']['max_occupancy'] = int(numbers[0]) if numbers else 2
        
        # Facilities count
        facility_elements = soup.select('div[data-testid="facility-group-container"] ul li .f6b6d2a959')
        facilities = [el.get_text(strip=True) for el in facility_elements]
        metadata['facility_metrics']['total_amenities'] = len(facilities)
        metadata['facility_metrics']['facilities_list'] = facilities
        
        # Booking.com quality rating
        quality_rating_el = soup.select_one('div[data-testid="rating-tiles"]')
        if quality_rating_el:
            metadata['facility_metrics']['has_quality_rating'] = True
            quality_text = soup.select_one('div.b99b6ef58f.f9b1b69a8a')
            if quality_text:
                quality_desc = quality_text.get_text(strip=True)
                numbers = re.findall(r'(\d+)\s*out\s*of\s*(\d+)', quality_desc)
                if numbers:
                    score, max_score = numbers[0]
                    metadata['facility_metrics']['booking_quality_score'] = int(score)
                    metadata['facility_metrics']['booking_quality_max'] = int(max_score)
        
        # Management score
        host_score_el = soup.select_one('span[data-testid="host-review-score"]')
        if host_score_el:
            score_text = host_score_el.get_text(strip=True)
            numbers = re.findall(r'\d+', score_text)
            if numbers:
                metadata['facility_metrics']['management_score'] = int(numbers[0])
        
        # Location quality indicators
        nearby_attractions = soup.select('ul[data-testid="poi-block-list"] li .d1bc97eb82')
        metadata['location_quality']['nearby_attractions'] = len(nearby_attractions)
        
        transport_elements = soup.select('ul[data-testid="poi-block-list"] li')
        transport_count = 0
        for element in transport_elements:
            text = element.get_text(strip=True).lower()
            if any(keyword in text for keyword in ['metro', 'train', 'bus', 'station']):
                transport_count += 1
        metadata['location_quality']['transport_accessibility'] = transport_count
        
        return metadata

    def extract_reviews(self, soup):
        """Extract featured reviews from the page"""
        reviews = []
        
        reviews_block = soup.select_one('div[data-testid="PropertyReviewsRegionBlock"]')
        if not reviews_block:
            print("PropertyReviewsRegionBlock not found")
            return reviews
        
        print("Found PropertyReviewsRegionBlock")
        
        featured_reviews = reviews_block.select('div[data-testid="featuredreview"]')
        print(f"Found {len(featured_reviews)} featured reviews")
        
        for i, review_container in enumerate(featured_reviews):
            try:
                review_data = self.extract_single_featured_review(review_container)
                if review_data and review_data['content'] and len(review_data['content']) > 10:
                    reviews.append(review_data)
                    print(f"Featured review {i+1} extracted: {review_data['username']}")
                    
            except Exception as e:
                print(f"Error extracting featured review {i+1}: {e}")
                continue
        
        return reviews

    def extract_single_featured_review(self, review_container):
        """Extract data from a featured review"""
        # Reviewer name
        username_el = review_container.select_one('div.b08850ce41.f546354b44')
        username = username_el.get_text(strip=True) if username_el else "Anonymous"
        
        # Review content
        content_el = review_container.select_one('div[data-testid="featuredreview-text"] .b99b6ef58f.d14152e7c3')
        if content_el:
            content = content_el.get_text(strip=True).strip('"')
        else:
            content = ""
        
        # Country information
        country_el = review_container.select_one('span.d838fb5f41.aea5eccb71')
        country = country_el.get_text(strip=True) if country_el else ""
        
        return {
            'username': username,
            'title': f"Review by {username}",
            'content': content,
            'overall_rating': 4.0,  # Default for featured reviews
            'country': country,
            'category_ratings': []  # Featured reviews don't have category breakdowns
        }

    def test_reviews_extraction(self):
        self.setup_driver()
        try:
            soup = self.load_page(self.hotel_urls[0])
            hotel_data = self.extract_hotel_basic_info(soup, 1, self.hotel_urls[0])
            reviews = self.extract_reviews(soup)
            
            print(f"\nReviews for {hotel_data['GlobalPropertyName']}:")
            print(f"Total Reviews Found: {len(reviews)}")
            for i, review in enumerate(reviews[:2], 1):  # Show first 2
                print(f"\nReview {i}:")
                print(f"  User: {review['username']} ({review['country']})")
                print(f"  Content: {review['content'][:100]}...")
        finally:
            self.driver.quit()

    def calculate_sparkling_awards_score(self, review_features, metadata_features=None):
        """Calculate Hotel Sparkling Awards score"""
        if metadata_features is None:
            metadata_features = {'accommodation_metrics': {}, 'location_quality': {}, 'facility_metrics': {}}
        
        # Review-based component (65% weight)
        review_score = 0
        
        # Overall metrics (30% of review component)
        overall_rating = review_features.get('overall_metrics', {}).get('overall_rating', 0)
        review_count = review_features.get('overall_metrics', {}).get('review_count', 0)
        
        if overall_rating > 0:
            overall_score = (overall_rating / 10) * 100
            review_count_score = min(100, review_count * 0.5) 
            
            overall_metrics_score = (overall_score * 0.70 + review_count_score * 0.30) * self.scoring_weights['review_components']['overall_metrics']
        else:
            overall_metrics_score = 0
        
        # Category ratings (70% of review component)
        category_score = 0
        total_weight = 0
        
        for category, data in review_features.get('category_ratings', {}).items():
            if isinstance(data, dict) and 'score' in data and 'weight' in data:
                normalized_score = (data['score'] / 10) * 100
                category_score += normalized_score * data['weight']
                total_weight += data['weight']
        
        if total_weight > 0:
            category_score = (category_score / total_weight) * self.scoring_weights['review_components']['category_ratings']
        
        review_component = overall_metrics_score + category_score
        
        # Metadata-based component (35% weight)
        facility_count = metadata_features.get('facility_metrics', {}).get('total_amenities', 0)
        management_score = metadata_features.get('facility_metrics', {}).get('management_score', 0)
        booking_quality = metadata_features.get('facility_metrics', {}).get('booking_quality_score', 0)
        nearby_attractions = metadata_features.get('location_quality', {}).get('nearby_attractions', 0)
        transport_access = metadata_features.get('location_quality', {}).get('transport_accessibility', 0)
        
        facility_score = min(100, facility_count * 2)
        management_component = min(100, management_score * 10) if management_score > 0 else 50
        quality_component = min(100, booking_quality * 20) if booking_quality > 0 else 50
        location_component = min(100, (nearby_attractions * 5) + (transport_access * 10))
        
        metadata_score = (
            facility_score * 0.30 +
            location_component * 0.30 +
            management_component * 0.20 +
            quality_component * 0.20
        )
        
        # Final score
        composite_score = (
            review_component * self.scoring_weights['review_based'] +
            metadata_score * self.scoring_weights['metadata_based']
        )
        
        return {
            'sparkling_score': round(composite_score, 2),
            'review_component': round(review_component, 2),
            'metadata_component': round(metadata_score, 2),
            'breakdown': {
                'overall_metrics_score': round(overall_metrics_score, 2),
                'category_score': round(category_score, 2),
                'facility_count': facility_count,
                'management_score': management_score,
                'booking_quality': booking_quality,
                'location_component': round(location_component, 2)
            }
        }

    def test_metadata_extraction(self):
        self.setup_driver()
        try:
            soup = self.load_page(self.hotel_urls[0])
            hotel_data = self.extract_hotel_basic_info(soup, 1, self.hotel_urls[0])
            metadata = self.extract_metadata_features(soup)
            
            print(f"\nMetadata for {hotel_data['GlobalPropertyName']}:")
            print(f"Room Type: {metadata['accommodation_metrics'].get('room_type', 'Not found')}")
            print(f"Max Occupancy: {metadata['accommodation_metrics'].get('max_occupancy', 'Not found')}")
            print(f"Total Amenities: {metadata['facility_metrics'].get('total_amenities', 0)}")
            print(f"Nearby Attractions: {metadata['location_quality'].get('nearby_attractions', 0)}")
            print(f"Transport Access: {metadata['location_quality'].get('transport_accessibility', 0)}")
            if metadata['facility_metrics'].get('facilities_list'):
                print(f"Sample Facilities: {metadata['facility_metrics']['facilities_list'][:3]}")
        finally:
            self.driver.quit()


    def test_review_extraction(self):
        self.setup_driver()
        try:
            soup = self.load_page(self.hotel_urls[0])
            hotel_data = self.extract_hotel_basic_info(soup, 1, self.hotel_urls[0])
            review_features = self.extract_review_based_features(soup)
            
            print(f"\nResults for {hotel_data['GlobalPropertyName']}:")
            print(f"Overall Rating: {review_features['overall_metrics'].get('overall_rating', 'Not found')}")
            print(f"Review Count: {review_features['overall_metrics'].get('review_count', 'Not found')}")
        finally:
            self.driver.quit()


if __name__ == "__main__":
    hotel_urls = [
        "https://www.booking.com/hotel/ro/sofitel-bucharest.en-gb.html",
        "https://www.booking.com/hotel/ro/love-room.html"
    ]
    
    scraper = HotelSparklingAwardsScraper(hotel_urls)
    scraper.test_review_extraction()
    scraper.test_metadata_extraction()
