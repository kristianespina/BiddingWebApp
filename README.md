# Bidding Web App
An auction web app built on top of react and django

## Installation
1. Clone the repository
2. Install necessary libraries
```bash
# at the root project folder
cd frontend && yarn install
cd ../backend && pip install -r requirements.txt

# perform migrations
python manage.py makemigrations
python manage.py migrate
```

## Run the frontend server
```
cd frontend && yarn start
# Frontend should now be accessed at http://localhost:8000/
```

## Run the backend server
```
cd backend
python manage.py runserver
```

## Test Accounts

### Buyer
```
username: buyer
password: zerosix123
```

### Seller
```
username: seller
password: zerosix123
```