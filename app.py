from flask import Flask, request, jsonify, session, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weather_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app, supports_credentials=True)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    temperature_unit = db.Column(db.String(10), default='celsius')
    favorite_cities = db.relationship('FavoriteCity', backref='user', lazy=True, cascade='all, delete-orphan')

class FavoriteCity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    city_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def home():
    return render_template('index.html')
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    session['user_id'] = user.id
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'temperature_unit': user.temperature_unit
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'temperature_unit': user.temperature_unit
            }
        }), 200
    
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/user', methods=['GET'])
def get_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'temperature_unit': user.temperature_unit
        }
    }), 200

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'temperature_unit' in data:
        user.temperature_unit = data['temperature_unit']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Settings updated successfully',
        'temperature_unit': user.temperature_unit
    }), 200

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    favorites = FavoriteCity.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'favorites': [
            {
                'id': fav.id,
                'city_name': fav.city_name,
                'latitude': fav.latitude,
                'longitude': fav.longitude,
                'added_at': fav.added_at.isoformat()
            }
            for fav in favorites
        ]
    }), 200

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json()
    
    if not data or not data.get('city_name'):
        return jsonify({'error': 'City name is required'}), 400
    
    # Check if city is already in favorites
    existing = FavoriteCity.query.filter_by(
        user_id=user_id, 
        city_name=data['city_name']
    ).first()
    
    if existing:
        return jsonify({'error': 'City already in favorites'}), 400
    
    favorite = FavoriteCity(
        user_id=user_id,
        city_name=data['city_name'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude')
    )
    
    db.session.add(favorite)
    db.session.commit()
    
    return jsonify({
        'message': 'City added to favorites',
        'favorite': {
            'id': favorite.id,
            'city_name': favorite.city_name,
            'latitude': favorite.latitude,
            'longitude': favorite.longitude,
            'added_at': favorite.added_at.isoformat()
        }
    }), 201

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
def remove_favorite(favorite_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    favorite = FavoriteCity.query.filter_by(
        id=favorite_id, 
        user_id=user_id
    ).first()
    
    if not favorite:
        return jsonify({'error': 'Favorite not found'}), 404
    
    db.session.delete(favorite)
    db.session.commit()
    
    return jsonify({'message': 'City removed from favorites'}), 200

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False}), 200
    
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        return jsonify({'authenticated': False}), 200
    
    return jsonify({
        'authenticated': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'temperature_unit': user.temperature_unit
        }
    }), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
