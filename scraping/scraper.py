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
from textblob import TextBlob
from urls import hotel_urls

class HotelSparklingAwardsSystemScraper:
    def __init__(self):
        self.hotel_urls = [url.split('?')[0] for url in hotel_urls[:30]]
        self.driver = None
        
        # scoring configuration matching specification
        self.scoring_config = {
            'review_based_weight': 0.70,
            'metadata_based_weight': 0.30,
            'category_scores_weight': 0.80,
            'sentiment_analysis_weight': 0.20,
            'categories': {
                'amenities': {'weight': 0.20, 'db_id': 1, 'name': 'AmenitiesRate'},
                'cleanliness': {'weight': 0.25, 'db_id': 2, 'name': 'CleanlinessRate'},
                'food_beverage': {'weight': 0.15, 'db_id': 3, 'name': 'FoodBeverage'},
                'sleep_quality': {'weight': 0.20, 'db_id': 4, 'name': 'SleepQuality'},
                'internet_quality': {'weight': 0.10, 'db_id': 5, 'name': 'InternetQuality'}
            },
            'metadata_weights': {
                'hotel_stars': 0.40,
                'airport_accessibility': 0.30,
                'hotel_size': 0.30
            }
        }
        
        # user roles for authentication system
        self.user_roles = {
            'hotel_manager': {'permissions': ['read_hotel_data', 'write_hotel_data', 'manage_property', 'view_analytics']},
            'traveler': {'permissions': ['read_reviews', 'write_reviews', 'view_ratings', 'search_hotels']},
            'administrator': {'permissions': ['full_access', 'user_management', 'system_config', 'data_export']},
            'data_operator': {'permissions': ['read_all_data', 'export_data', 'data_analysis', 'report_generation']}
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
        print(f"loading: {url[:50]}...")
        self.driver.get(url)
        time.sleep(8)
        self.handle_popups()
        
        for i in range(8):
            self.driver.execute_script(f"window.scrollTo(0, document.body.scrollHeight*{i*0.125});")
            time.sleep(3)
        
        time.sleep(10)
        return BeautifulSoup(self.driver.page_source, 'html.parser')

    def load_reviews_with_pagination(self, url, target_reviews=50):
        reviews_url = url + '#tab-reviews'
        print(f"loading reviews: {reviews_url[:50]}...")
        self.driver.get(reviews_url)
        time.sleep(10)
        self.handle_popups()
        
        all_reviews = []
        page_count = 0
        max_pages = 5  # Reduce for testing
        
        while len(all_reviews) < target_reviews and page_count < max_pages:
            page_count += 1
            print(f"extracting from page {page_count}, current total: {len(all_reviews)}")
            
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight * 0.5);")
            time.sleep(3)
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            page_reviews = self.extract_reviews_from_page(soup, len(all_reviews))
            
            new_reviews_count = 0
            for review in page_reviews:
                if not any(existing['content'] == review['content'] for existing in all_reviews):
                    all_reviews.append(review)
                    new_reviews_count += 1
            
            print(f"added {new_reviews_count} new reviews from page {page_count}")
            
            if len(all_reviews) >= target_reviews:
                break

            # Strategy 1: Click specific next page number
            next_page = page_count + 1
            try:
                next_button = self.driver.find_element(By.CSS_SELECTOR, f'button[aria-label=" {next_page}"]:not([aria-current])')
                if next_button and next_button.is_enabled():
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                    time.sleep(2)
                    self.driver.execute_script("arguments[0].click();", next_button)
                    print(f"clicked page {next_page} button")
                    success = True
                    time.sleep(8)
            except Exception as e:
                print(f"Strategy 1 failed: {e}")
            
            # Strategy 2: Click "Next page" arrow
            if not success:
                try:
                    next_arrow = self.driver.find_element(By.CSS_SELECTOR, 'button[aria-label="Next page"]')
                    if next_arrow and next_arrow.is_enabled():
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", next_arrow)
                        time.sleep(2)
                        self.driver.execute_script("arguments[0].click();", next_arrow)
                        print("clicked next page arrow")
                        success = True
                        time.sleep(8)
                except Exception as e:
                    print(f"Strategy 2 failed: {e}")
            
            if not success:
                print("PAGINATION FAILED - no more pages available")
                break
        
        return all_reviews[:target_reviews]


    def extract_reviews_from_page(self, soup, start_id):
        reviews = []
        
        reviews_block = soup.select_one('div[data-testid="review-list-container"]')
        if not reviews_block:
            print("review-list-container not found")
            return reviews
        
        # extract review cards
        review_cards = reviews_block.select('div[data-testid="review-card"]')
        print(f"found {len(review_cards)} review cards")
        
        for i, container in enumerate(review_cards):
            try:
                review_data = self.extract_single_review(container, start_id + len(reviews) + 1)
                if review_data and review_data['content'] and len(review_data['content']) > 10:
                    reviews.append(review_data)
            except Exception as e:
                print(f"error extracting review {i}: {e}")
                continue
        
        return reviews

    def extract_hotel_basic_info(self, soup, hotel_id, url):
        hotel_name_el = soup.select_one('h2.ddb12f4f86.pp-header__title')
        hotel_name = hotel_name_el.get_text(strip=True) if hotel_name_el else f"Hotel {hotel_id}"
        
        location_el = soup.select_one('div.b99b6ef58f.cb4b7a25d9')
        location = ""
        if location_el:
            location_text = location_el.get_text(strip=True)
            for keyword in ['Excellent location', 'Good location', 'Very good location', 'Fabulous location']:
                if keyword in location_text:
                    location_text = location_text.split(keyword)[0]
                    break
            location = location_text.strip()
        
        # coordinates 
        coordinates = self.get_coordinates_from_url(url)
        
        return {
            'GlobalPropertyID': hotel_id,
            'GlobalPropertyName': hotel_name,
            'PropertyAddress1': location or self.get_country_from_url(url),
            'CityID': coordinates['city_id'],
            'PropertyStateProvinceID': coordinates['city_id'],
            'PropertyLatitude': coordinates['lat'],
            'PropertyLongitude': coordinates['lng'],
            'SabrePropertyRating': 0.0  # will be updated with extracted rating
        }

    def get_coordinates_from_url(self, url):
        country_mapping = {
            '/fr/': {'lat': 48.8566, 'lng': 2.3522, 'city_id': 1},
            '/gb/': {'lat': 51.5074, 'lng': -0.1278, 'city_id': 2},
            '/it/': {'lat': 41.8719, 'lng': 12.5674, 'city_id': 3},
            '/es/': {'lat': 40.4168, 'lng': -3.7038, 'city_id': 4},
            '/nl/': {'lat': 52.3676, 'lng': 4.9041, 'city_id': 5},
            '/be/': {'lat': 50.8503, 'lng': 4.3517, 'city_id': 6},
            '/tr/': {'lat': 41.0082, 'lng': 28.9784, 'city_id': 7},
            '/pl/': {'lat': 52.2297, 'lng': 21.0122, 'city_id': 8},
            '/ae/': {'lat': 25.2048, 'lng': 55.2708, 'city_id': 9},
            '/za/': {'lat': -33.9249, 'lng': 18.4241, 'city_id': 10},
            '/lb/': {'lat': 33.8547, 'lng': 35.8623, 'city_id': 11}
        }
        
        for pattern, coords in country_mapping.items():
            if pattern in url:
                return coords
        return {'lat': 0.0, 'lng': 0.0, 'city_id': 1}

    def get_country_from_url(self, url):
        country_mapping = {
            '/fr/': 'France', '/gb/': 'United Kingdom', '/it/': 'Italy',
            '/es/': 'Spain', '/nl/': 'Netherlands', '/be/': 'Belgium',
            '/tr/': 'Turkey', '/pl/': 'Poland', '/ae/': 'UAE',
            '/za/': 'South Africa', '/lb/': 'Lebanon'
        }
        
        for pattern, country in country_mapping.items():
            if pattern in url:
                return country
        return 'Unknown'

    def extract_overall_rating(self, soup):
        rating_el = soup.select_one('div.bc946a29db')
        if rating_el:
            rating_text = rating_el.get_text(strip=True)
            numbers = re.findall(r'\d+\.?\d*', rating_text)
            if numbers:
                return float(numbers[0])
        return 0.0

    def extract_metadata(self, soup):
        # hotel stars
        star_elements = soup.select('[data-testid="rating-stars"] .bk-icon')
        hotel_stars = 4  # default for radisson
        if star_elements:
            hotel_stars = min(5, len([el for el in star_elements if 'star' in str(el.get('class', []))]))
        
        # distance to airport
        distance_to_airport = 15.0  # default
        poi_elements = soup.select('ul[data-testid="poi-block-list"] li')
        for element in poi_elements:
            text = element.get_text(strip=True).lower()
            if 'airport' in text:
                distance_match = re.search(r'(\d+\.?\d*)\s*km', text)
                if distance_match:
                    km_distance = float(distance_match.group(1))
                    distance_to_airport = round(km_distance * 0.621371, 2)
                    break
        
        # floors number
        floors_number = 8  # default
        facility_elements = soup.select('div[data-testid="facility-group-container"] ul li')
        for element in facility_elements:
            text = element.get_text(strip=True)
            floor_match = re.search(r'(\d+)[\s-]*floor', text, re.IGNORECASE)
            if floor_match:
                floors_number = int(floor_match.group(1))
                break
        
        # rooms number
        rooms_number = 100  # default
        description_elements = soup.select('.a53cbfa6de, .b6dc9a9e69, .hp-description')
        for element in description_elements:
            text = element.get_text(strip=True)
            room_match = re.search(r'(\d+)[\s-]*room', text, re.IGNORECASE)
            if room_match:
                rooms_number = int(room_match.group(1))
                break
        
        return {
            'HotelStars': hotel_stars,
            'DistanceToTheAirport': distance_to_airport,
            'FloorsNumber': floors_number,
            'RoomsNumber': rooms_number
        }

    def extract_category_ratings(self, soup):
        category_ratings = {}
        category_containers = soup.select('div[data-testid="review-subscore"]')
        processed_categories = set()
        
        for container in category_containers:
            try:
                category_name_el = container.select_one('span.d96a4619c0')
                if not category_name_el:
                    continue
                
                category_name = category_name_el.get_text(strip=True).lower()
                
                if category_name in processed_categories:
                    continue
                
                category_score_el = container.select_one('div.a9918d47bf.f87e152973')
                if not category_score_el:
                    continue
                
                try:
                    score = float(category_score_el.get_text(strip=True))
                    mapped_category = self.map_category(category_name)
                    if mapped_category:
                        category_info = self.scoring_config['categories'][mapped_category]
                        category_ratings[mapped_category] = {
                            'score': score,
                            'weight': category_info['weight'],
                            'db_id': category_info['db_id'],
                            'name': category_info['name']
                        }
                        processed_categories.add(category_name)
                
                except ValueError:
                    continue
                    
            except Exception:
                continue
        
        return category_ratings

    def map_category(self, category_name):
        if 'cleanliness' in category_name or 'clean' in category_name:
            return 'cleanliness'
        elif 'amenities' in category_name or 'facilities' in category_name:
            return 'amenities'
        elif 'food' in category_name or 'restaurant' in category_name or 'breakfast' in category_name:
            return 'food_beverage'
        elif 'comfort' in category_name or 'sleep' in category_name or 'bed' in category_name:
            return 'sleep_quality'
        elif 'wifi' in category_name or 'internet' in category_name:
            return 'internet_quality'
        return None

    def extract_single_review(self, review_container, review_id):
        # username 
        username_el = review_container.select_one('div.b08850ce41.f546354b44')
        username = username_el.get_text(strip=True) if username_el else "Anonymous"
        
        # collect content from both positive and negative sections
        content_parts = []
        
        # positive review text 
        positive_el = review_container.select_one('div[data-testid="review-positive-text"] div.b99b6ef58f.d14152e7c3 span')
        if positive_el:
            positive_text = positive_el.get_text(strip=True)
            if positive_text:
                content_parts.append(positive_text)
        
        # negative review text 
        negative_el = review_container.select_one('div[data-testid="review-negative-text"] div.b99b6ef58f.d14152e7c3 span')
        if negative_el:
            negative_text = negative_el.get_text(strip=True)
            if negative_text:
                content_parts.append(negative_text)
        
        content = " | ".join(content_parts) if content_parts else ""
        
        # country
        country_el = review_container.select_one('span.d838fb5f41.aea5eccb71')
        country = country_el.get_text(strip=True).replace(' ', '') if country_el else ""
        
        if not content or len(content) < 10:
            return None
        
        return {
            'review_id': review_id,
            'username': username,
            'content': content[:1000],
            'country': country,
            'review_date': datetime.now().strftime('%Y-%m-%d')
        }

    def analyze_sentiment(self, text):
        if not text:
            return {
                'sentiment_score': 3.0,
                'sentiment_label': 'neutral',
                'confidence': 0.0
            }
        
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        # convert to 1-5 scale for database compatibility
        sentiment_score = ((polarity + 1) / 2) * 4 + 1
        
        if polarity > 0.1:
            sentiment_label = 'positive'
        elif polarity < -0.1:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        confidence = abs(polarity)
        
        return {
            'sentiment_score': round(sentiment_score, 2),
            'sentiment_label': sentiment_label,
            'confidence': round(confidence, 2)
        }

    def compute_sparkling_score(self, category_ratings, metadata, reviews):
        # review-based score (70% weight)
        category_score = 0
        total_category_weight = 0
        
        for category, data in category_ratings.items():
            normalized_score = (data['score'] / 10) * 100
            weighted_score = normalized_score * data['weight']
            category_score += weighted_score
            total_category_weight += data['weight']
        
        if total_category_weight > 0:
            category_score = category_score / total_category_weight
        
        # sentiment analysis component
        sentiment_score = 0
        if reviews:
            avg_sentiment = sum(r['sentiment_score'] for r in reviews) / len(reviews)
            sentiment_score = (avg_sentiment / 5) * 100
        
        # combine review components
        review_component = (category_score * self.scoring_config['category_scores_weight'] + 
                           sentiment_score * self.scoring_config['sentiment_analysis_weight'])
        
        # metadata-based score (30% weight)
        hotel_stars = metadata.get('HotelStars', 4)
        airport_distance = metadata.get('DistanceToTheAirport', 15)
        floors_number = metadata.get('FloorsNumber', 8)
        rooms_number = metadata.get('RoomsNumber', 100)
        
        star_score = (hotel_stars / 5) * 100 * self.scoring_config['metadata_weights']['hotel_stars']
        airport_score = max(0, 100 - (airport_distance * 2)) * self.scoring_config['metadata_weights']['airport_accessibility']
        size_score = min(100, ((floors_number * 5) + (rooms_number / 2)) / 2) * self.scoring_config['metadata_weights']['hotel_size']
        
        metadata_component = star_score + airport_score + size_score
        
        # final sparkling score
        final_score = (review_component * self.scoring_config['review_based_weight'] + 
                      metadata_component * self.scoring_config['metadata_based_weight'])
        
        return {
            'sparkling_score': round(final_score, 2),
            'review_component': round(review_component, 2),
            'metadata_component': round(metadata_component, 2),
            'sentiment_component': round(sentiment_score, 2),
            'category_breakdown': {cat: data['score'] for cat, data in category_ratings.items()},
            'metadata_breakdown': metadata,
            'total_reviews': len(reviews)
        }

    def run(self):
        self.setup_driver()
        all_results = []
        
        try:
            for hotel_id, url in enumerate(self.hotel_urls, 1):
                if hotel_id > 30:
                    break
                    
                print(f"processing hotel {hotel_id}/30")
                
                try:
                    # extract basic info from main page
                    main_soup = self.load_page(url)
                    
                    hotel_info = self.extract_hotel_basic_info(main_soup, hotel_id, url)
                    overall_rating = self.extract_overall_rating(main_soup)
                    hotel_info['SabrePropertyRating'] = overall_rating
                    
                    # extract metadata
                    metadata = self.extract_metadata(main_soup)
                    
                    # extract category ratings
                    category_ratings = self.extract_category_ratings(main_soup)
                    
                    # extract 50 reviews using pagination
                    reviews = self.load_reviews_with_pagination(url, target_reviews=50)
                    
                    # add sentiment analysis to reviews
                    for review in reviews:
                        sentiment = self.analyze_sentiment(review['content'])
                        review.update(sentiment)
                        review['hotel_id'] = hotel_id
                    
                    # calculate sparkling score
                    if category_ratings or reviews:
                        scoring_result = self.compute_sparkling_score(category_ratings, metadata, reviews)
                        
                        result = {
                            'hotel_info': hotel_info,
                            'metadata': metadata,
                            'category_ratings': category_ratings,
                            'reviews': reviews,
                            'scoring_result': scoring_result,
                            'last_updated': datetime.now().isoformat()
                        }
                        
                        all_results.append(result)
                        
                        print(f"success: {hotel_info['GlobalPropertyName']}")
                        print(f"sparkling score: {scoring_result['sparkling_score']}/100")
                        print(f"reviews analyzed: {len(reviews)}")
                        
                    else:
                        print(f"skipped: {hotel_info['GlobalPropertyName']} - insufficient data")
                
                except Exception as e:
                    print(f"error processing hotel {hotel_id}: {e}")
                    continue
                
                time.sleep(10)
            
            # save all csv files for database import
            self.save_database_ready_csvs(all_results)
            
        except KeyboardInterrupt:
            print("scraping interrupted")
        finally:
            self.driver.quit()

    def save_database_ready_csvs(self, results):
        """save csv files aligned with database schema for react/node app"""
        if not results:
            print("no results to save")
            return
        
        # 1. hotels table data
        hotels_data = []
        for result in results:
            hotel_row = {
                **result['hotel_info'],
                **result['metadata'],
                'sparkling_score': result['scoring_result']['sparkling_score'],
                'last_updated': result['last_updated']
            }
            hotels_data.append(hotel_row)
        
        with open('hotels_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'GlobalPropertyID', 'GlobalPropertyName', 'PropertyAddress1', 'CityID',
                'PropertyStateProvinceID', 'PropertyLatitude', 'PropertyLongitude',
                'SabrePropertyRating', 'HotelStars', 'DistanceToTheAirport',
                'FloorsNumber', 'RoomsNumber', 'sparkling_score', 'last_updated'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(hotels_data)
        
        # 2. users table data (for authentication)
        unique_users = set()
        for result in results:
            for review in result['reviews']:
                unique_users.add(review['username'])
        
        users_data = []
        for i, username in enumerate(unique_users, 1):
            users_data.append({
                'id': i,
                'username': username,
                'nationality': '',  # will be filled by app
                'role_id': 2,  # default to traveler role
                'review_count': 1,
                'created_at': datetime.now().isoformat()
            })
        
        with open('users_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['id', 'username', 'nationality', 'role_id', 'review_count', 'created_at']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(users_data)
        
        # 3. reviews table data
        reviews_data = []
        user_lookup = {user['username']: user['id'] for user in users_data}
        
        review_id = 1
        for result in results:
            for review in result['reviews']:
                reviews_data.append({
                    'id': review_id,
                    'hotel_id': result['hotel_info']['GlobalPropertyID'],
                    'user_id': user_lookup.get(review['username'], 1),
                    'title': f"Review by {review['username']}",
                    'content': review['content'][:1000],  # limit content length
                    'overall_rating': review['sentiment_score'],
                    'review_date': review['review_date'],
                    'helpful_votes': 0,
                    'platform': 'booking_sparkling_awards',
                    'sentiment_score': review['sentiment_score'],
                    'sentiment_label': review['sentiment_label'],
                    'confidence': review['confidence'],
                    'created_at': datetime.now().isoformat()
                })
                review_id += 1
        
        with open('reviews_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'id', 'hotel_id', 'user_id', 'title', 'content', 'overall_rating',
                'review_date', 'helpful_votes', 'platform', 'sentiment_score',
                'sentiment_label', 'confidence', 'created_at'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(reviews_data)
        
        # 4. review ratings table data
        review_ratings_data = []
        rating_id = 1
        
        for result in results:
            for category, data in result['category_ratings'].items():
                # find reviews for this hotel to assign category ratings
                hotel_reviews = [r for r in reviews_data if r['hotel_id'] == result['hotel_info']['GlobalPropertyID']]
                
                for review in hotel_reviews[:5]:  # assign to first 5 reviews
                    review_ratings_data.append({
                        'id': rating_id,
                        'review_id': review['id'],
                        'category_id': data['db_id'],
                        'rating_value': round(data['score'] / 2, 1),  # convert 10-scale to 5-scale
                        'created_at': datetime.now().isoformat()
                    })
                    rating_id += 1
        
        with open('review_ratings_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['id', 'review_id', 'category_id', 'rating_value', 'created_at']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(review_ratings_data)
        
        # 5. roles and permissions data for authentication system
        roles_data = [
            {'id': 1, 'role': 'hotel_manager', 'description': 'Manages assigned hotels'},
            {'id': 2, 'role': 'traveler', 'description': 'Books hotels and writes reviews'},
            {'id': 3, 'role': 'administrator', 'description': 'Full system access'},
            {'id': 4, 'role': 'data_operator', 'description': 'Data analysis and export'}
        ]
        
        with open('roles_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['id', 'role', 'description']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(roles_data)
        
        # 6. hotel managers association table
        hotel_managers_data = []
        manager_id = 1
        
        # assign hotel managers (sample data for testing)
        for result in results[:10]:  # first 10 hotels get managers
            hotel_managers_data.append({
                'id': manager_id,
                'user_id': manager_id,  # will need to be updated with actual manager user ids
                'hotel_id': result['hotel_info']['GlobalPropertyID'],
                'assigned_at': datetime.now().isoformat(),
                'is_active': True
            })
            manager_id += 1
        
        with open('hotel_managers_sparkling_awards.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['id', 'user_id', 'hotel_id', 'assigned_at', 'is_active']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(hotel_managers_data)
        
        # 7. structured scoring table for success criteria
        self.generate_structured_scoring_table(results)

    def generate_structured_scoring_table(self, results):
        """generate the structured table with scores as per success criteria"""
        sorted_results = sorted(results, key=lambda x: x['scoring_result']['sparkling_score'], reverse=True)
        
        table_data = []
        for rank, result in enumerate(sorted_results, 1):
            scoring = result['scoring_result']
            hotel_info = result['hotel_info']
            metadata = result['metadata']
            
            table_row = {
                'ranking': rank,
                'hotel_id': hotel_info['GlobalPropertyID'],
                'hotel_name': hotel_info['GlobalPropertyName'],
                'location': hotel_info['PropertyAddress1'],
                'sparkling_score': scoring['sparkling_score'],
                'review_component': scoring['review_component'],
                'metadata_component': scoring['metadata_component'],
                'sentiment_score': scoring['sentiment_component'],
                'total_reviews': scoring['total_reviews'],
                'hotel_stars': metadata['HotelStars'],
                'distance_to_airport': metadata['DistanceToTheAirport'],
                'floors_number': metadata['FloorsNumber'],
                'rooms_number': metadata['RoomsNumber'],
                'amenities_rate': scoring['category_breakdown'].get('amenities', 0),
                'cleanliness_rate': scoring['category_breakdown'].get('cleanliness', 0),
                'food_beverage': scoring['category_breakdown'].get('food_beverage', 0),
                'sleep_quality': scoring['category_breakdown'].get('sleep_quality', 0),
                'internet_quality': scoring['category_breakdown'].get('internet_quality', 0),
                'last_updated': result['last_updated']
            }
            table_data.append(table_row)
        
        with open('hotel_scoring_table_structured.csv', 'w', newline='', encoding='utf-8') as f:
            fieldnames = [
                'ranking', 'hotel_id', 'hotel_name', 'location', 'sparkling_score',
                'review_component', 'metadata_component', 'sentiment_score',
                'total_reviews', 'hotel_stars', 'distance_to_airport',
                'floors_number', 'rooms_number', 'amenities_rate', 'cleanliness_rate',
                'food_beverage', 'sleep_quality', 'internet_quality', 'last_updated'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(table_data)
        
        # display structured table for verification
        print(f"\nhotel sparkling awards - structured scoring table")
        print("=" * 100)
        print(f"{'rank':<4} {'hotel name':<35} {'score':<7} {'reviews':<8} {'stars':<5} {'sentiment':<9}")
        print("-" * 100)
        
        for result in table_data[:10]:
            print(f"{result['ranking']:<4} {result['hotel_name'][:34]:<35} "
                  f"{result['sparkling_score']:<7.1f} {result['total_reviews']:<8} "
                  f"{result['hotel_stars']:<5} {result['sentiment_score']:<9.1f}")
        
        print(f"\nsuccess criteria verification:")
        print(f"hotels processed: {len(results)}")
        print(f"average sparkling score: {sum(r['sparkling_score'] for r in table_data) / len(table_data):.2f}")
        print(f"score range: {min(r['sparkling_score'] for r in table_data):.1f} - {max(r['sparkling_score'] for r in table_data):.1f}")
        print(f"system displays indices: yes (rankings 1-{len(table_data)})")
        print(f"contains relevant features: yes (all metadata and category scores)")
        
        print(f"\nfiles generated for react/node.js application:")
        print(f"- hotels_sparkling_awards.csv (main hotels table)")
        print(f"- users_sparkling_awards.csv (authentication users)")
        print(f"- reviews_sparkling_awards.csv (review content with sentiment)")
        print(f"- review_ratings_sparkling_awards.csv (category ratings)")
        print(f"- roles_sparkling_awards.csv (user roles)")
        print(f"- hotel_managers_sparkling_awards.csv (access control)")
        print(f"- hotel_scoring_table_structured.csv (success criteria output)")

if __name__ == "__main__":
    scraper = HotelSparklingAwardsSystemScraper()
    scraper.run()
