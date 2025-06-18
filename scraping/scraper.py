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
        
        # scoring configuration for sparkling awards system
        self.scoring_config = {
            'review_based_weight': 0.70,
            'metadata_based_weight': 0.30,
            'categories': {
                'amenities': {'weight': 0.20, 'db_id': 1},
                'cleanliness': {'weight': 0.25, 'db_id': 2},
                'food_beverage': {'weight': 0.15, 'db_id': 3},
                'sleep_quality': {'weight': 0.20, 'db_id': 4},
                'internet_quality': {'weight': 0.10, 'db_id': 5}
            }
        }
        
        # country mapping for coordinates
        self.country_data = {
            '/fr/': {'lat': 48.8566, 'lng': 2.3522, 'city_id': 1, 'country': 'France'},
            '/gb/': {'lat': 51.5074, 'lng': -0.1278, 'city_id': 2, 'country': 'United Kingdom'},
            '/it/': {'lat': 41.8719, 'lng': 12.5674, 'city_id': 3, 'country': 'Italy'},
            '/es/': {'lat': 40.4168, 'lng': -3.7038, 'city_id': 4, 'country': 'Spain'},
            '/nl/': {'lat': 52.3676, 'lng': 4.9041, 'city_id': 5, 'country': 'Netherlands'},
            '/be/': {'lat': 50.8503, 'lng': 4.3517, 'city_id': 6, 'country': 'Belgium'},
            '/tr/': {'lat': 41.0082, 'lng': 28.9784, 'city_id': 7, 'country': 'Turkey'},
            '/pl/': {'lat': 52.2297, 'lng': 21.0122, 'city_id': 8, 'country': 'Poland'},
            '/ae/': {'lat': 25.2048, 'lng': 55.2708, 'city_id': 9, 'country': 'UAE'},
            '/za/': {'lat': -33.9249, 'lng': 18.4241, 'city_id': 10, 'country': 'South Africa'},
            '/lb/': {'lat': 33.8547, 'lng': 35.8623, 'city_id': 11, 'country': 'Lebanon'}
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
        max_pages = 10
        
        while len(all_reviews) < target_reviews and page_count < max_pages:
            page_count += 1
            print(f"extracting from page {page_count}, current total: {len(all_reviews)}")
            
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight * 0.5);")
            time.sleep(5)
            
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
            
            # navigate to next page
            try:
                next_page_num = page_count + 1
                next_button = self.driver.find_element(By.CSS_SELECTOR, f'button[aria-label=" {next_page_num}"]:not([aria-current])')
                if next_button and next_button.is_enabled():
                    self.driver.execute_script("arguments[0].scrollIntoView(true);", next_button)
                    time.sleep(3)
                    self.driver.execute_script("arguments[0].click();", next_button)
                    print(f"clicked page {next_page_num} button")
                    time.sleep(12)
                else:
                    break
            except Exception as e:
                print(f"could not find page {next_page_num}: {e}")
                break
        
        return all_reviews[:target_reviews]

    def extract_reviews_from_page(self, soup, start_id):
        reviews = []
        reviews_block = soup.select_one('div[data-testid="review-list-container"]')
        if not reviews_block:
            return reviews
        
        review_cards = reviews_block.select('div[data-testid="review-card"]')
        
        for i, container in enumerate(review_cards):
            try:
                review_data = self.extract_single_review(container, start_id + len(reviews) + 1)
                if review_data and review_data['content'] and len(review_data['content']) > 10:
                    reviews.append(review_data)
            except Exception:
                continue
        
        return reviews

    def extract_single_review(self, review_container, review_id):
        # extract username
        username_el = review_container.select_one('div.b08850ce41.f546354b44')
        username = username_el.get_text(strip=True) if username_el else "Anonymous"
        
        # extract review content from positive and negative sections
        content_parts = []
        
        positive_el = review_container.select_one('div[data-testid="review-positive-text"] div.b99b6ef58f.d14152e7c3 span')
        if positive_el:
            positive_text = positive_el.get_text(strip=True)
            if positive_text:
                content_parts.append(positive_text)
        
        negative_el = review_container.select_one('div[data-testid="review-negative-text"] div.b99b6ef58f.d14152e7c3 span')
        if negative_el:
            negative_text = negative_el.get_text(strip=True)
            if negative_text:
                content_parts.append(negative_text)
        
        content = " | ".join(content_parts) if content_parts else ""
        
        # extract country
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

    def extract_hotel_name(self, soup):
        name_el = soup.select_one('h2.ddb12f4f86.pp-header__title')
        if name_el:
            return name_el.get_text(strip=True)
        return ""

    def extract_location(self, soup, url):
        location_el = soup.select_one('div.b99b6ef58f.cb4b7a25d9')
        if location_el:
            location_text = location_el.get_text(strip=True)
            # remove location rating text
            for keyword in ['Excellent location', 'Good location', 'Very good location', 'Fabulous location']:
                if keyword in location_text:
                    location_text = location_text.split(keyword)[0]
                    break
            return location_text.strip()
        
        # fallback to country from url
        for pattern, data in self.country_data.items():
            if pattern in url:
                return data['country']
        return ""

    def extract_overall_rating(self, soup):
        rating_el = soup.select_one('div.bc946a29db')
        if rating_el:
            rating_text = rating_el.get_text(strip=True)
            numbers = re.findall(r'\d+\.?\d*', rating_text)
            if numbers:
                return float(numbers[0])
        return 0.0

    def extract_metadata(self, soup):
        # extract hotel stars rating
        star_elements = soup.select('[data-testid="rating-stars"] .bk-icon')
        hotel_stars = 4  # default for radisson blu
        if star_elements:
            hotel_stars = min(5, len([el for el in star_elements if 'star' in str(el.get('class', []))]))
        
        # extract distance to airport in miles
        distance_to_airport = 15.0  # default distance
        poi_elements = soup.select('ul[data-testid="poi-block-list"] li')
        for element in poi_elements:
            text = element.get_text(strip=True).lower()
            if 'airport' in text:
                distance_match = re.search(r'(\d+\.?\d*)\s*km', text)
                if distance_match:
                    km_distance = float(distance_match.group(1))
                    distance_to_airport = round(km_distance * 0.621371, 2)
                    break
        
        # extract number of floors
        floors_number = 8  # default
        facility_elements = soup.select('div[data-testid="facility-group-container"] ul li')
        for element in facility_elements:
            text = element.get_text(strip=True)
            floor_match = re.search(r'(\d+)[\s-]*floor', text, re.IGNORECASE)
            if floor_match:
                floors_number = int(floor_match.group(1))
                break
        
        # extract number of rooms
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
                # extract category name
                category_name_el = container.select_one('span.d96a4619c0')
                if not category_name_el:
                    continue
                
                category_name = category_name_el.get_text(strip=True).lower()
                
                if category_name in processed_categories:
                    continue
                
                # extract category score
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
                            'db_id': category_info['db_id']
                        }
                        processed_categories.add(category_name)
                
                except ValueError:
                    continue
                    
            except Exception:
                continue
        
        return category_ratings

    def map_category(self, category_name):
        # map booking.com categories
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

    def analyze_sentiment(self, text):
        # perform sentiment analysis using textblob
        if not text:
            return {'sentiment_score': 3.0, 'sentiment_label': 'neutral', 'confidence': 0.0}
        
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        # convert polarity to 1-5 scale
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
        # calculate review-based score (70% weight)
        category_score = 0
        total_category_weight = 0
        
        for category, data in category_ratings.items():
            normalized_score = (data['score'] / 10) * 100
            weighted_score = normalized_score * data['weight']
            category_score += weighted_score
            total_category_weight += data['weight']
        
        if total_category_weight > 0:
            category_score = category_score / total_category_weight
        
        # calculate sentiment component
        sentiment_score = 0
        if reviews:
            avg_sentiment = sum(r['sentiment_score'] for r in reviews) / len(reviews)
            sentiment_score = (avg_sentiment / 5) * 100
        
        # combine review components (80% categories + 20% sentiment)
        review_component = (category_score * 0.8) + (sentiment_score * 0.2)
        
        # calculate metadata-based score (30% weight)
        hotel_stars = metadata.get('HotelStars', 4)
        airport_distance = metadata.get('DistanceToTheAirport', 15)
        floors_number = metadata.get('FloorsNumber', 8)
        rooms_number = metadata.get('RoomsNumber', 100)
        
        # metadata scoring components
        star_score = (hotel_stars / 5) * 100 * 0.4
        airport_score = max(0, 100 - (airport_distance * 2)) * 0.3
        size_score = min(100, ((floors_number * 5) + (rooms_number / 2)) / 2) * 0.3
        
        metadata_component = star_score + airport_score + size_score
        
        # final sparkling score calculation
        final_score = (review_component * self.scoring_config['review_based_weight'] + 
                      metadata_component * self.scoring_config['metadata_based_weight'])
        
        return {
            'sparkling_score': round(final_score, 2),
            'review_component': round(review_component, 2),
            'metadata_component': round(metadata_component, 2),
            'sentiment_component': round(sentiment_score, 2),
            'category_breakdown': {cat: data['score'] for cat, data in category_ratings.items()},
            'total_reviews': len(reviews)
        }

    def get_coordinates_from_url(self, url):
        # extract coordinates based on country in url
        for pattern, data in self.country_data.items():
            if pattern in url:
                return data
        return {'lat': 0.0, 'lng': 0.0, 'city_id': 1}

    def run(self):
        # main execution method
        self.setup_driver()
        all_results = []
        
        try:
            for hotel_id, url in enumerate(self.hotel_urls, 1):
                if hotel_id > 30:
                    break
                    
                print(f"processing hotel {hotel_id}/30")
                
                try:
                    # extract basic hotel information
                    main_soup = self.load_page(url)
                    coordinates = self.get_coordinates_from_url(url)
                    
                    hotel_info = {
                        'GlobalPropertyID': hotel_id,
                        'GlobalPropertyName': self.extract_hotel_name(main_soup) or f"Hotel {hotel_id}",
                        'PropertyAddress1': self.extract_location(main_soup, url),
                        'CityID': coordinates['city_id'],
                        'PropertyStateProvinceID': coordinates['city_id'],
                        'PropertyLatitude': coordinates['lat'],
                        'PropertyLongitude': coordinates['lng'],
                        'SabrePropertyRating': self.extract_overall_rating(main_soup)
                    }
                    
                    # extract hotel metadata
                    metadata = self.extract_metadata(main_soup)
                    
                    # extract category ratings from review subscores
                    category_ratings = self.extract_category_ratings(main_soup)
                    
                    # extract 50 reviews using pagination
                    reviews = self.load_reviews_with_pagination(url, target_reviews=50)
                    
                    # add sentiment analysis to each review
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
            
            # save all data to csv files for database import
            self.save_database_csvs(all_results)
            
        except KeyboardInterrupt:
            print("scraping interrupted")
        finally:
            self.driver.quit()

    def save_database_csvs(self, results):
        # save csv files matching database schema
        if not results:
            print("no results to save")
            return
        
        # generate hotels data
        hotels_data = []
        for result in results:
            hotel_row = {
                **result['hotel_info'],
                **result['metadata'],
                'sparkling_score': result['scoring_result']['sparkling_score'],
                'last_updated': result['last_updated']
            }
            hotels_data.append(hotel_row)
        
        self.save_csv('hotels_sparkling_awards.csv', hotels_data, [
            'GlobalPropertyID', 'GlobalPropertyName', 'PropertyAddress1', 'CityID',
            'PropertyStateProvinceID', 'PropertyLatitude', 'PropertyLongitude',
            'SabrePropertyRating', 'HotelStars', 'DistanceToTheAirport',
            'FloorsNumber', 'RoomsNumber', 'sparkling_score', 'last_updated'
        ])
        
        # generate users data with all 4 required roles
        unique_users = set()
        for result in results:
            for review in result['reviews']:
                unique_users.add(review['username'])
        
        users_data = []
        
        # phase 1: reviewers as travelers (role_id = 2)
        for i, username in enumerate(unique_users, 1):
            users_data.append({
                'id': i,
                'username': username,
                'email': f"{username.lower().replace(' ', '')}@example.com",
                'password_hash': 'temp_hash',
                'first_name': username.split()[0] if ' ' in username else username,
                'last_name': username.split()[-1] if ' ' in username else '',
                'nationality': '',
                'role_id': 2,  # traveler role
                'account_status': 'active',
                'email_verified': False,
                'review_count': 1,
                'created_at': datetime.now().isoformat()
            })
        
        # phase 2: hotel managers (role_id = 1)
        for i in range(1, 46):
            users_data.append({
                'id': len(users_data) + 1,
                'username': f"manager{i}",
                'email': f"manager{i}@radisson.com",
                'password_hash': 'temp_hash',
                'first_name': f"Manager",
                'last_name': f"{i}",
                'nationality': '',
                'role_id': 1,  # hotel manager role
                'account_status': 'active',
                'email_verified': True,
                'review_count': 0,
                'created_at': datetime.now().isoformat()
            })
        
        # phase 3: administrators (role_id = 3)
        for i in range(1, 7): 
            users_data.append({
                'id': len(users_data) + 1,
                'username': f"admin{i}",
                'email': f"admin{i}@sparklingawards.com",
                'password_hash': 'temp_hash',
                'first_name': f"Administrator",
                'last_name': f"{i}",
                'nationality': '',
                'role_id': 3,  # administrator role
                'account_status': 'active',
                'email_verified': True,
                'review_count': 0,
                'created_at': datetime.now().isoformat()
            })
        
        # phase 4: data operators (role_id = 4)
        for i in range(1, 6): 
            users_data.append({
                'id': len(users_data) + 1,
                'username': f"dataop{i}",
                'email': f"dataop{i}@sparklingawards.com",
                'password_hash': 'temp_hash',
                'first_name': f"Data",
                'last_name': f"Operator{i}",
                'nationality': '',
                'role_id': 4,  # data operator role
                'account_status': 'active',
                'email_verified': True,
                'review_count': 0,
                'created_at': datetime.now().isoformat()
            })
        
        # save users csv with all 4 roles
        self.save_csv('users_sparkling_awards.csv', users_data, [
            'id', 'username', 'email', 'password_hash', 'first_name', 'last_name',
            'nationality', 'role_id', 'account_status', 'email_verified', 
            'review_count', 'created_at'
        ])
        
        # generate reviews data with sentiment analysis
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
                    'content': review['content'],
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
        
        self.save_csv('reviews_sparkling_awards.csv', reviews_data, [
            'id', 'hotel_id', 'user_id', 'title', 'content', 'overall_rating',
            'review_date', 'helpful_votes', 'platform', 'sentiment_score',
            'sentiment_label', 'confidence', 'created_at'
        ])
        
        # generate review ratings for categories
        review_ratings_data = []
        rating_id = 1
        
        for result in results:
            for category, data in result['category_ratings'].items():
                hotel_reviews = [r for r in reviews_data if r['hotel_id'] == result['hotel_info']['GlobalPropertyID']]
                
                for review in hotel_reviews[:5]:  # assign to first 5 reviews per category
                    # convert 10-scale to 5-scale rating
                    rating_value = max(1.0, min(5.0, (data['score'] / 10) * 4 + 1))
                    
                    review_ratings_data.append({
                        'id': rating_id,
                        'review_id': review['id'],
                        'category_id': data['db_id'],
                        'rating_value': round(rating_value, 1),
                        'created_at': datetime.now().isoformat()
                    })
                    rating_id += 1
        
        self.save_csv('review_ratings_sparkling_awards.csv', review_ratings_data, [
            'id', 'review_id', 'category_id', 'rating_value', 'created_at'
        ])
        
        # generate roles data
        roles_data = [
            {'id': 1, 'role_name': 'hotel_manager', 'description': 'Manages assigned hotels'},
            {'id': 2, 'role_name': 'traveler', 'description': 'Books hotels and writes reviews'},
            {'id': 3, 'role_name': 'administrator', 'description': 'Full system access'},
            {'id': 4, 'role_name': 'data_operator', 'description': 'Data analysis and export'}
        ]
        
        self.save_csv('roles_sparkling_awards.csv', roles_data, [
            'id', 'role_name', 'description'
        ])
        
        # generate hotel managers association data
        hotel_managers_data = []
        for i, result in enumerate(results[:10], 1):  # assign managers to first 10 hotels
            manager_user_id = len(unique_users) + i
            
            hotel_managers_data.append({
                'id': i,
                'user_id': manager_user_id,
                'hotel_id': result['hotel_info']['GlobalPropertyID'],
                'assigned_by': len(unique_users) + 1,
                'assigned_at': datetime.now().isoformat(),
                'is_active': True
            })
        
        self.save_csv('hotel_managers_sparkling_awards.csv', hotel_managers_data, [
            'id', 'user_id', 'hotel_id', 'assigned_by', 'assigned_at', 'is_active'
        ])
        
        # generate structured scoring table for success criteria
        self.generate_scoring_table(results)

    def save_csv(self, filename, data, fieldnames):
        # utility method to save csv files
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(data)

    def generate_scoring_table(self, results):
        # generate final structured table with hotel rankings
        sorted_results = sorted(results, key=lambda x: x['scoring_result']['sparkling_score'], reverse=True)
        
        table_data = []
        for rank, result in enumerate(sorted_results, 1):
            scoring = result['scoring_result']
            hotel_info = result['hotel_info']
            metadata = result['metadata']
            
            table_data.append({
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
            })
        
        self.save_csv('hotel_scoring_table_structured.csv', table_data, [
            'ranking', 'hotel_id', 'hotel_name', 'location', 'sparkling_score',
            'review_component', 'metadata_component', 'sentiment_score',
            'total_reviews', 'hotel_stars', 'distance_to_airport',
            'floors_number', 'rooms_number', 'amenities_rate', 'cleanliness_rate',
            'food_beverage', 'sleep_quality', 'internet_quality', 'last_updated'
        ])
        
        # display results summary
        print(f"\nhotel sparkling awards system completed")
        print(f"hotels processed: {len(results)}")
        print(f"total reviews: {sum(len(r['reviews']) for r in results)}")
        print(f"average sparkling score: {sum(r['sparkling_score'] for r in table_data) / len(table_data):.2f}")
        
        print(f"\nfiles generated for react/node.js application:")
        print(f"- hotels_sparkling_awards.csv")
        print(f"- users_sparkling_awards.csv")
        print(f"- reviews_sparkling_awards.csv")
        print(f"- review_ratings_sparkling_awards.csv")
        print(f"- roles_sparkling_awards.csv")
        print(f"- hotel_managers_sparkling_awards.csv")
        print(f"- hotel_scoring_table_structured.csv")
        
        print(f"\ntop 5 hotels by sparkling score:")
        for i, hotel in enumerate(table_data[:5]):
            print(f"{i+1}. {hotel['hotel_name']} - {hotel['sparkling_score']}/100")

if __name__ == "__main__":
    scraper = HotelSparklingAwardsSystemScraper()
    scraper.run()
