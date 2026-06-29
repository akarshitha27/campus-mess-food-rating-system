# Campus Mess Food Rating System

Campus Mess Food Rating System is a full-stack web application developed to help students rate hostel meals, submit feedback, and analyze meal quality. The system enables students to provide ratings and reviews while offering administrators valuable insights through dashboards and analytics to improve food quality and dining experience.

## Features

* Student authentication using JWT
* Rate breakfast, lunch, snacks, and dinner
* One rating per meal per day
* Submit optional meal reviews
* Dashboard displaying average ratings and total reviews
* Weekly meal rating trends
* Food leaderboard based on user ratings
* Meal quality analytics using interactive charts
* Review history with filtering options
* Responsive and user-friendly interface

## Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* Recharts

### Backend

* FastAPI
* SQLAlchemy
* Pydantic

### Database

* PostgreSQL

### Authentication

* JSON Web Token (JWT)

### Version Control

* Git
* GitHub

## Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Rate Today's Meals

![Rate Today's Meals](screenshots/rating.png)

### Analytics Dashboard

![Analytics](screenshots/analytics.png)

### Reviews

![Reviews](screenshots/Review.png)

## Project Structure

```text
Campus-Mess-Food-Rating-System
│
├── backend
│   ├── app
│   ├── models
│   ├── routers
│   ├── schemas
│   ├── database.py
│   └── main.py
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── screenshots
│   ├── dashboard.png
│   ├── rate-today.png
│   ├── analytics.png
│   └── reviews.png
│
├── README.md
├── requirements.txt
└── package.json
```

## Installation

Clone the repository.

```bash
git clone https://github.com/your-username/campus-mess-food-rating-system.git
cd campus-mess-food-rating-system
```

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```


