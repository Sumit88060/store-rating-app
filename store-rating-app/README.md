# Store rating app

so this is a full stack project where users can rate stores from 1 to 5 stars. nothing too fancy but works fine.
built using node + express + postgres + react 

---

## roles (basic idea)

* admin → can manage users + stores + see stats
* user → can see stores and rate them
* owner → can check ratings of their stores

---

## tech used

backend:

* node js
* express
* postgres (pg lib)
* jwt for auth
* bcrypt (password hashing)

frontend:

* react (v18)
* react router
* axios
* context api

---

## project structure (rough)

```
store-rating-app/
  backend/
    config/
    controllers/
    middleware/
    routes/
    services/
    server.js

  frontend/
    src/
      components/
      pages/
      context/
```

not writing everything again coz its already clear in folder names 

---

## how to run this thing

### 1. need this first

* node (v18 )
* postgres installed
* npm or yarn

---

### 2. db setup

run this:

```
psql -U postgres -c "CREATE DATABASE store_rating_db;"
```

then:

```
psql -U postgres -d store_rating_db -f backend/config/schema.sql
```

this will create tables + add default admin

email: [admin@storerating.com](mailto:admin@storerating.com)
pass: password

(change later pls lol)

---

### 3. backend

```
cd backend
npm install
cp .env.example .env
```

edit .env (important, dont skip)

then run:

```
npm run dev
```

server should start at http://localhost:5000

---

### 4. frontend

```
cd frontend
npm install
npm start
```

runs on http://localhost:3000

---

## api (just main ones)

auth:

* POST /api/auth/register
* POST /api/auth/login
* GET /api/auth/me

admin:

* GET /api/admin/dashboard
* GET /api/admin/users
* POST /api/admin/users
* DELETE /api/admin/users/:id

stores:

* GET /api/stores
* POST /api/stores/:id/rate

owner:

* GET /api/stores/my-stores
* GET /api/stores/my-stores/:id/ratings

 

---

## some rules (validation stuff)

* name should be like 20–60 chars
* password 8–16 (with uppercase + special char)
* rating = 1 to 5 only
* email should be valid 

---

## env example

```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/store_rating_db
JWT_SECRET=some_secret_key
```

---

## random notes

* one user can rate a store only once (it updates if they rate again)
* auth + roles handled in backend middleware
* frontend also blocks routes 
* proxy is used for api calls during dev

---

thats it i guess. not perfect but works 
