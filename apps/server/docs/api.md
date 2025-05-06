# API Documentation

## Bookings

### GET /api/bookings
- Description: Retrieve all bookings for the authenticated user.
- Authentication: Bearer token required.
- Response:
  - 200 OK
  - Body: `{ bookings: Booking[] }`

### GET /api/bookings/:id
- Description: Retrieve a single booking by ID (owner only).
- Authentication: Bearer token required.
- Response:
  - 200 OK with booking object
  - 404 Not Found if booking does not exist or is not owned by user

### POST /api/bookings
- Description: Create a new booking.
- Authentication: Bearer token required.
- Request Body:
  - `serviceId` (string)
  - `appointmentDate` (ISO date string)
  - `duration` (number, minutes)
  - `specialRequests?` (string)
- Response:
  - 201 Created with `{ booking }`

### PATCH /api/bookings/:id/status
- Description: Update the status of an existing booking.
- Authentication: Bearer token required.
- Request Body:
  - `status` (string)
- Response:
  - 200 OK with updated `{ booking }`

### DELETE /api/bookings/:id
- Description: Delete a booking.
- Authentication: Bearer token required.
- Response:
  - 200 OK with `{ success: true }`

## Skin Analysis

### POST /api/skin-analysis
- Description: Analyze an uploaded skin photo and receive metrics on hydration, oiliness, and spots.
- Authentication: None (public endpoint).
- Request:
  - Method: POST
  - URL: `/api/skin-analysis`
  - Headers:
    - `Content-Type`: `multipart/form-data`
  - Body (form-data):
    - `photo` (file): The image file to analyze.
- Response:
  - Status: 200 OK
  - Body:
    ```json
    {
      "results": {
        "hydration": 80,
        "oiliness": 40,
        "spots": 2
      }
    }
    ```
  - Field Descriptions:
    - `results.hydration` (number): Skin hydration percentage.
    - `results.oiliness` (number): Skin oiliness percentage.
    - `results.spots` (number): Number of detected spots.
- Errors:
  - 400 Bad Request: No file uploaded.
  - 500 Internal Server Error: Analysis failed.

## Analytics

### GET /api/analytics/metrics/revenue
- Description: Retrieve total, payment, and subscription revenue sums within an optional date range.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
- Response:
  - 200 OK
  - Body:
    ```json
    {
      "total": 12345,
      "payment": 10000,
      "subscription": 2345
    }
    ```

### GET /api/analytics/metrics/clients
- Description: Retrieve new vs returning user counts within an optional date range.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
- Response:
  - 200 OK
  - Body:
    ```json
    {
      "newUsers": 10,
      "returningUsers": 5
    }
    ```

### GET /api/analytics/metrics/services
- Description: Retrieve usage count per service within an optional date range.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
- Response:
  - 200 OK
  - Body:
    ```json
    {
      "services": [
        { "serviceId": "srv_1", "name": "Haircut", "count": 50 },
        { "serviceId": "srv_2", "name": "Facial", "count": 30 }
      ]
    }
    ```

### GET /api/analytics/metrics/subscription-churn
- Description: Retrieve subscription cancellation count, total subscriptions, and churn rate.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
- Response:
  - 200 OK
  - Body:
    ```json
    {
      "cancellations": 2,
      "totalSubs": 20,
      "churnRate": 0.1
    }
    ```

### GET /api/analytics/metrics/revenue-breakdown
- Description: Retrieve daily revenue totals within an optional date range.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
- Response:
  - 200 OK
  - Body:
    ```json
    [
      { "date": "2025-04-01", "total": 500 },
      { "date": "2025-04-02", "total": 700 }
    ]
    ```

### CSV Export Endpoints
- GET `/api/analytics/metrics/revenue/export`, `/clients/export`, `/services/export`, `/subscription-churn/export`
- Description: Download CSV reports for each metrics endpoint.
- Authentication: Bearer token required.
- Query Params:
  - `startDate` (ISO date string, optional)
  - `endDate` (ISO date string, optional)
  - CSV headers and attachment with appropriate filename.

## Staff Schedules
- Authentication: Bearer token required.

### GET /api/staff-schedules
- Description: Retrieve all staff schedules including staff details.
- Response:
  - 200 OK
  - Body: `{ schedules: StaffSchedule[] }`

### GET /api/staff-schedules/:id
- Description: Retrieve a staff schedule by ID.
- Response:
  - 200 OK
  - Body: `StaffSchedule`
- Errors:
  - 404 Not Found if the schedule does not exist.

### POST /api/staff-schedules
- Description: Create a new staff schedule.
- Request Body:
  - `staffId` (string)
  - `date` (ISO date string)
  - `startTime` (ISO date-time string)
  - `endTime` (ISO date-time string)
- Response:
  - 200 OK
  - Body: `StaffSchedule`

### PUT /api/staff-schedules/:id
- Description: Update an existing staff schedule by ID.
- Request Body:
  - `date` (ISO date string)
  - `startTime` (ISO date-time string)
  - `endTime` (ISO date-time string)
- Response:
  - 200 OK
  - Body: `StaffSchedule`

### DELETE /api/staff-schedules/:id
- Description: Delete a staff schedule by ID.
- Response:
  - 200 OK
  - Body: `{ success: true }`

## Attendance
- Authentication: Bearer token required.

### GET /api/attendance
- Description: Retrieve all attendance records.
- Response:
  - 200 OK
  - Body: `{ records: AttendanceRecord[] }`

### GET /api/attendance/schedule/:scheduleId
- Description: Retrieve attendance records for a specific schedule.
- Response:
  - 200 OK
  - Body: `{ records: AttendanceRecord[] }`

### POST /api/attendance
- Description: Create an attendance record (clock-in or clock-out).
- Request Body:
  - `scheduleId` (string)
  - `status` (string: 'clock-in' | 'clock-out')
- Response:
  - 200 OK
  - Body: `AttendanceRecord`

### DELETE /api/attendance/:id
- Description: Delete an attendance record by ID.
- Response:
  - 200 OK
  - Body: `{ success: true }`

## Training Modules
- Authentication: Bearer token required.

### GET /api/training-modules
- Description: List all training modules.
- Response:
  - 200 OK
  - Body: `{ modules: TrainingModule[] }`

### GET /api/training-modules/:id
- Description: Retrieve a training module by ID.
- Response:
  - 200 OK
  - Body: `TrainingModule`
- Errors:
  - 404 Not Found if the module does not exist.

### POST /api/training-modules
- Description: Create a new training module.
- Request Body:
  - `title` (string)
  - `description` (string)
  - `contentUrl` (string)
- Response:
  - 200 OK
  - Body: `TrainingModule`

### PUT /api/training-modules/:id
- Description: Update an existing training module by ID.
- Request Body:
  - `title` (string)
  - `description` (string)
  - `contentUrl` (string)
- Response:
  - 200 OK
  - Body: `TrainingModule`

### DELETE /api/training-modules/:id
- Description: Delete a training module by ID.
- Response:
  - 200 OK
  - Body: `{ success: true }`

## Training Progress
- Authentication: Bearer token required.

### GET /api/training-progress
- Description: Retrieve training progress for the authenticated user.
- Response:
  - 200 OK
  - Body: `{ progress: TrainingProgress[] }`

### POST /api/training-progress
- Description: Mark a training module as completed.
- Request Body:
  - `moduleId` (string)
- Response:
  - 200 OK
  - Body: `TrainingProgress`
