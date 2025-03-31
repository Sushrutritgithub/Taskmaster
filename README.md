# TaskMaster  

A simple, responsive to-do list web app with user authentication.  

## Features  
- Secure user registration and login  
- Each user can manage their own tasks  
- Add, edit, and delete tasks in real-time  
- Works on desktop, tablet, and mobile  
- Clean and modern design  

## Technologies Used  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT  

## Installation  

1. Clone the repository:  
   ```sh
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```  
2. Install dependencies:  
   ```sh
   npm install
   ```  
3. Create a `.env` file and add:  
   ```env
   JWT_SECRET=your_secret_key_here
   MONGODB_URI=mongodb://127.0.0.1:27017/todo
   PORT=5000
   ```  
4. Start the server:  
   ```sh
   npm start
   ```  
5. Open the app in your browser at `http://localhost:5000`  

## API Endpoints  

**User Authentication:**  
- `POST /register` - Register a new user  
- `POST /login` - Login and get a token  

**Task Management:**  
- `GET /tasks` - Get all tasks for the logged-in user  
- `POST /tasks` - Add a new task  
- `PUT /tasks/:id` - Update a task  
- `DELETE /tasks/:id` - Delete a task  

## Usage  

1. Register an account  
2. Login to access your personal tasks  
3. Add a new task  
4. Edit a task inline  
5. Delete a task  
6. Logout when done  

## Security  
- Passwords are hashed with bcrypt  
- JWT authentication for secure access  
- Users can only access their own tasks  

## Future Improvements  
- Task categories and due dates  
- Dark mode  
- Task sorting and filtering  

## Contributing  
Contributions are welcome! Feel free to submit a pull request.
