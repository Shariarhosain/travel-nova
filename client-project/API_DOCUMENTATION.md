# Luxury Travel App API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Authentication Endpoints

### Register
- **POST** `/auth/register`
- **Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "username": "johndoe" // optional
}
```

### Login
- **POST** `/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Google OAuth
- **GET** `/auth/google` - Initiate Google OAuth
- **GET** `/auth/google/callback` - Google OAuth callback

### Facebook OAuth
- **GET** `/auth/facebook` - Initiate Facebook OAuth
- **GET** `/auth/facebook/callback` - Facebook OAuth callback

### Get Current User
- **GET** `/auth/me` 🔒
- Returns the authenticated user's profile

---

## 👤 Profile Endpoints

### Get My Profile
- **GET** `/profile/me` 🔒

### Get Profile by Username
- **GET** `/profile/username/:username` 🔒

### Update Profile
- **PUT** `/profile/me` 🔒
- **Body:**
```json
{
  "username": "johndoe",
  "bio": "Travel enthusiast",
  "location": "New York",
  "website": "https://example.com",
  "birthday": "1990-01-01",
  "gender": "MALE",
  "countriesExplored": ["Japan", "France", "Italy"]
}
```

### Upload Profile Image
- **POST** `/profile/me/profile-image` 🔒
- **Form Data:** `file` (image file)

### Upload Cover Image
- **POST** `/profile/me/cover-image` 🔒
- **Form Data:** `file` (image file)

### Update Social Links
- **PUT** `/profile/me/social-links` 🔒
- **Body:**
```json
{
  "instagramUsername": "johndoe",
  "twitterUsername": "johndoe",
  "facebookUsername": "johndoe"
}
```

### Update Account Settings
- **PUT** `/profile/me/settings/account` 🔒
- **Body:**
```json
{
  "accountPrivate": false,
  "showActive": true,
  "showFollowers": true,
  "darkMode": true
}
```

### Update Notification Settings
- **PUT** `/profile/me/settings/notifications` 🔒
- **Body:**
```json
{
  "pushNotification": true,
  "emailNotification": false
}
```

### Update Privacy & Security Settings
- **PUT** `/profile/me/settings/privacy-security` 🔒
- **Body:**
```json
{
  "twoFactorEnabled": true,
  "enableFaceId": true
}
```

### Get Statistics
- **GET** `/profile/me/statistics` 🔒

---

## 👥 Social Endpoints

### Follow User
- **POST** `/social/follow/:userId` 🔒

### Unfollow User
- **DELETE** `/social/unfollow/:userId` 🔒

### Get Followers
- **GET** `/social/followers/:userId` 🔒
- **Query:** `skip`, `take`

### Get Following
- **GET** `/social/following/:userId` 🔒
- **Query:** `skip`, `take`

### Check if Following
- **GET** `/social/is-following/:userId` 🔒

### Get Suggested Users
- **GET** `/social/suggestions` 🔒
- **Query:** `take`

---

## 📸 Posts Endpoints

### Create Post
- **POST** `/posts` 🔒
- **Form Data:**
  - `images[]` (multiple image files)
  - `caption`
  - `details`
  - `location`
  - `visibility` (ALL, FOLLOWERS, PRIVATE)
  - `tags[]`

### Get All Posts
- **GET** `/posts`
- **Query:** `skip`, `take`

### Get Post by ID
- **GET** `/posts/:id`

### Get User's Posts
- **GET** `/posts/user/:userId`
- **Query:** `skip`, `take`

### Get Saved Posts
- **GET** `/posts/saved` 🔒
- **Query:** `skip`, `take`

### Update Post
- **PUT** `/posts/:id` 🔒

### Delete Post
- **DELETE** `/posts/:id` 🔒

### Like Post
- **POST** `/posts/:id/like` 🔒

### Unlike Post
- **DELETE** `/posts/:id/like` 🔒

### Save Post
- **POST** `/posts/:id/save` 🔒

### Unsave Post
- **DELETE** `/posts/:id/save` 🔒

### Share Post
- **POST** `/posts/:id/share` 🔒
- **Body:**
```json
{
  "sharedTo": "instagram"
}
```

### Create Comment
- **POST** `/posts/:id/comments` 🔒
- **Body:**
```json
{
  "commentText": "Great post!"
}
```

### Get Comments
- **GET** `/posts/:id/comments`
- **Query:** `skip`, `take`

### Like Comment
- **POST** `/posts/comments/:commentId/like` 🔒

### Unlike Comment
- **DELETE** `/posts/comments/:commentId/like` 🔒

### Create Reply
- **POST** `/posts/comments/:commentId/replies` 🔒
- **Body:**
```json
{
  "replyText": "Thanks!"
}
```

### Get Replies
- **GET** `/posts/comments/:commentId/replies`
- **Query:** `skip`, `take`

---

## 🗺️ Itineraries Endpoints

### Create Itinerary
- **POST** `/itineraries` 🔒
- **Form Data:**
  - `mainImage` (image file)
  - `title`
  - `description`
  - `destination`
  - `country`
  - `budget`
  - `rating`
  - `durationDays`
  - `visibility`
  - `tags[]`
  - `bestTimeToVisit[]` (JSON array)
  - `attractions[]` (JSON array)
  - `hotels[]` (JSON array)

### Get All Itineraries
- **GET** `/itineraries`
- **Query:** `skip`, `take`

### Get Itinerary by ID
- **GET** `/itineraries/:id`

### Get Saved Itineraries
- **GET** `/itineraries/saved` 🔒
- **Query:** `skip`, `take`

### Update Itinerary
- **PUT** `/itineraries/:id` 🔒

### Delete Itinerary
- **DELETE** `/itineraries/:id` 🔒

### Like Itinerary
- **POST** `/itineraries/:id/like` 🔒

### Unlike Itinerary
- **DELETE** `/itineraries/:id/like` 🔒

### Save Itinerary
- **POST** `/itineraries/:id/save` 🔒

### Unsave Itinerary
- **DELETE** `/itineraries/:id/save` 🔒

---

## 🔔 Notifications Endpoints

### Get Notifications
- **GET** `/notifications` 🔒
- **Query:** `skip`, `take`

### Mark as Read
- **PUT** `/notifications/:id/read` 🔒

### Mark All as Read
- **PUT** `/notifications/read-all` 🔒

### Delete Notification
- **DELETE** `/notifications/:id` 🔒

---

## 🔍 Discover Endpoints

### Get Trending Destinations
- **GET** `/discover/trending-destinations`
- **Query:** `take`

### Get Top Posts
- **GET** `/discover/top-posts`
- **Query:** `skip`, `take`

### Get Top Itineraries
- **GET** `/discover/top-itineraries`
- **Query:** `skip`, `take`

### Search
- **GET** `/discover/search`
- **Query:** `q` (search query), `type` (posts|itineraries|users), `skip`, `take`

### Get Posts by Tag
- **GET** `/discover/tags/:tagName`
- **Query:** `skip`, `take`

---

## 🛡️ Admin Endpoints (Admin Only)

### Get Dashboard Stats
- **GET** `/admin/dashboard` 🔒👮

### Get Users
- **GET** `/admin/users` 🔒👮
- **Query:** `skip`, `take`, `search`

### Ban User
- **PUT** `/admin/users/:userId/ban` 🔒👮

### Unban User
- **PUT** `/admin/users/:userId/unban` 🔒👮

### Get Pending Content
- **GET** `/admin/content/pending` 🔒👮
- **Query:** `type` (posts|itineraries), `skip`, `take`

### Approve Post
- **PUT** `/admin/posts/:postId/approve` 🔒👮

### Reject Post
- **DELETE** `/admin/posts/:postId/reject` 🔒👮

### Approve Itinerary
- **PUT** `/admin/itineraries/:itineraryId/approve` 🔒👮

### Delete Itinerary
- **DELETE** `/admin/itineraries/:itineraryId` 🔒👮

---

## 📤 File Upload Endpoints

### Upload Single File
- **POST** `/upload/single` 🔒
- **Form Data:** `file`

### Upload Multiple Files
- **POST** `/upload/multiple` 🔒
- **Form Data:** `files[]` (max 10 files)

---

## Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "take": 20
}
```

---

## Legend
- 🔒 = Requires authentication
- 👮 = Requires admin role

## Notes
- All image uploads support JPEG, PNG, GIF, and WebP formats (max 10MB)
- Dates should be in ISO 8601 format
- Pagination defaults: skip=0, take=20
