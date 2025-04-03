from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker, relationship
from sqlalchemy import create_engine, Column, String, Boolean, Integer, Float, ForeignKey, Table, func
from flask_login import UserMixin
import os
from config import DATABASE_CONFIG

# Database Configuration
db_config = DATABASE_CONFIG


# Initialize database engine
engine = create_engine(
    f"mysql+pymysql://{db_config['username']}:{db_config['password']}@{db_config['db_host']}/{db_config['db_name']}",
    connect_args={'ssl': {'disabled': True}}
)

# Base Model
Base = declarative_base()

# Create a new session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Scoped session (thread-safe)
session = scoped_session(SessionLocal)

# Ensure tables exist
def init_db():
    Base.metadata.create_all(bind=engine)

# Define Many-to-Many Relationship Table for Property and Accessibility
property_accessibility_table = Table(
    'property_accessibility',
    Base.metadata,
    Column('propertyID', Integer, ForeignKey('property.id', ondelete="CASCADE"), primary_key=True),
    Column('accessibilityID', Integer, ForeignKey('accessibility.accessibilityID', ondelete="CASCADE"), primary_key=True)
)

# Models

class Accessibility(Base):
    __tablename__ = 'accessibility'
    accessibilityID = Column(Integer, primary_key=True, autoincrement=True)
    accessibilityType = Column(String(255), nullable=False, unique=True)
    properties = relationship(
        'Property',
        secondary=property_accessibility_table,
        back_populates='accessibilities'
    )

class User(UserMixin, Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(150), unique=True)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(15), nullable=True)
    password = Column(String(170))
    firstname = Column(String(100))
    lastname = Column(String(100))
    active = Column(Boolean, default=True)
    role = Column(String(50), default="tenant")  # Role: 'tenant' or 'landlord'
    businessName = Column(String(200), nullable=True)  # Only for landlords
    profile_picture = Column(String(255), nullable=True)
    properties = relationship("Property", back_populates="user", cascade="all, delete-orphan")

    #Relationship back to Match
    matches = relationship("Match", back_populates="user", cascade="all, delete-orphan")

class Property(Base):
    __tablename__ = 'property'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    size_sqft = Column(Float)
    price = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    street_address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    accessibilities = relationship(
        'Accessibility',
        secondary=property_accessibility_table,
        back_populates='properties'
    )

    # Relationship back to Match
    matches = relationship("Match", back_populates="property", cascade="all, delete-orphan")

class PropertyImage(Base):
    __tablename__ = 'property_images'
    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey('property.id', ondelete='CASCADE'))
    image_url = Column(String, nullable=False)
    property = relationship("Property", back_populates="images")

class Match(Base):
    __tablename__ = 'match'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    property_id = Column(Integer, ForeignKey('property.id'))
    timestamp = Column(String, default=func.now())


    #Relationship fields
    user = relationship("User", back_populates="matches")
    property = relationship("Property", back_populates="matches")

class Voucher(Base):
    __tablename__ = 'voucher'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    expiration_date = Column(String, nullable=True) 
    price_limit = Column(Integer, nullable=True)
    housing_type = Column(String(50), nullable=True)
    family_members = Column(Integer, nullable=True)
    user = relationship("User", backref="vouchers")


class Preferences(Base):
    __tablename__ = 'preferences'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    size_sqft = Column(Integer, nullable=True)
    price = Column(Float(10, 2), nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float(3, 1), nullable=True)
    user = relationship("User", backref="preferences")



# Function to create database tables
def init_db():
    Base.metadata.create_all(engine)
