from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask import session as flask_session

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base

from werkzeug.security import generate_password_hash, check_password_hash
import pymysql
app = Flask(__name__)

app.config['SECRET_KEY'] = 'csci400_random_string_as_secret_key'

# Configure the database URI for SQLAlchemy
# Define the database URI with placeholders for username and password

username = 't3'  # Replace with actual username
password = 'Hav0nBDwD4uyvcZt'  # Replace with actual password

# Define the MariaDB engine using MariaDB Connector/Python
engine = sqlalchemy.create_engine( f"mysql+pymysql://{username}:{password}@34.125.69.91/f24_housing_db" , connect_args={'ssl': {'disabled': True}})

Base = declarative_base()
class User(Base):
   __tablename__ = 'user'
   id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
   

   username = sqlalchemy.Column(sqlalchemy.String(length=150))
   password = sqlalchemy.Column(sqlalchemy.String(length=150))
   firstname = sqlalchemy.Column(sqlalchemy.String(length=100))
   lastname = sqlalchemy.Column(sqlalchemy.String(length=100))
   active = sqlalchemy.Column(sqlalchemy.Boolean, default=True)
   
Base.metadata.create_all(engine)

# Create a session
Session = sqlalchemy.orm.sessionmaker()
Session.configure(bind=engine)
session = Session()

def addUser(userName,passWord, firstName, lastName):
   newUser = User(username=userName, 
                  password=passWord, 
                  firstname=firstName, 
                  lastname=lastName, 
                  active=True)
   session.add(newUser)
   session.commit()

def selectAll():
   users = session.query(User).all()
   for user in users:
       print(" - " + user.username + ' ' + user.active + user.firstname + ' ' + user.lastname )

def selectByStatus(isActive):
   users = session.query(User).filter_by(active=isActive)
   for user in users:
       print(" - " + user.firstname + ' ' + user.lastname)

def updateUserStatus(id, isActive):
   user = session.query(User).get(id)
   user.active = isActive
   session.commit()

def deleteUser(id):
   session.query(User).filter(User.id == id).delete()
   session.commit()
   

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = session.query(User).filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            flask_session['user_id'] = user.id
            return redirect(url_for('pick_a_path'))
        else:
            flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/create_account', methods=['GET', 'POST'])
def create_account():
    if request.method == 'POST':
        username = request.form['username']
        password = generate_password_hash(request.form['password'], method='pbkdf2:sha256')
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        
        addUser(username, password, firstname, lastname)
        
        
        flash('Account created successfully', 'success')
        return redirect(url_for('login'))
    return render_template('create_account.html')

@app.route('/pick_a_path')
def pick_a_path():
    return render_template('pick_a_path.html')

@app.route('/scenario1')
def scenario1():
    return render_template('scenario1.html')

@app.route('/scenario2')
def scenario2():
    return render_template('scenario2.html')

@app.route('/article1')
def article1():
    return render_template('article1.html')

if __name__ == '__main__':
    app.run(debug=True)
