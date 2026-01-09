# Study Platform - COMPTIA SECURITY+

A web-based study platform for exam preparation, currently configured for COMPTIA SECURITY+ certification.

## Features

- **Topic Learning Interface**: Read through topics with a clean, textbook-like presentation
- **Interactive Quizzes**: Test your knowledge with multiple-choice questions after each topic
- **Progress Tracking**: Visual progress bar showing your advancement through topics and quizzes
- **Detailed Explanations**: Learn from explanations provided after each quiz question

## Project Structure

```
SiteP/
├── index.php               # Main PHP page
├── styles.css              # Styling and layout
├── app.js                  # Application logic and navigation
├── api/
│   └── load-data.php      # PHP API endpoint to load JSON data
├── data/
│   ├── learning-guideline.json  # Study guide metadata
│   ├── topic1.json        # First topic content
│   ├── topic2.json        # Second topic content
│   ├── quiz1.json         # Quiz for topic 1 (5 questions)
│   └── quiz2.json         # Quiz for topic 2 (5 questions)
└── README.md              # This file
```

## How to Use

1. **Start the PHP server**: You must run this through a PHP server (see below)

2. **Study Flow**:
   - Start with Topic 1: Read through the content
   - Click "Proceed to Quiz" when ready
   - Answer the 5 quiz questions
   - After completing the quiz, Topic 2 will appear
   - Repeat the process for Topic 2

3. **Quiz Interaction**:
   - Click on an answer option
   - The correct answer will be highlighted in green
   - Incorrect answers will be highlighted in red
   - An explanation will appear below
   - Click "Next Question" to continue

## Running Locally

**Note**: This application requires PHP to run. You cannot simply open the file in a browser.

### Option 1: PHP Built-in Server (Recommended)
```bash
# Navigate to the project directory
cd SiteP

# Start PHP development server
php -S localhost:8000

# Then open http://localhost:8000 in your browser
```

### Option 2: XAMPP/WAMP/MAMP
1. Copy the project folder to your web server directory:
   - XAMPP: `C:\xampp\htdocs\SiteP`
   - WAMP: `C:\wamp64\www\SiteP`
   - MAMP: `/Applications/MAMP/htdocs/SiteP`
2. Start your local server
3. Open `http://localhost/SiteP` in your browser

### Option 3: Other PHP Servers
Any PHP-compatible web server (Apache, Nginx with PHP-FPM, etc.) will work. Just ensure PHP is installed and configured.

## Data Format

### Topic JSON Structure
```json
{
  "id": "topic1",
  "title": "Topic Title",
  "content": [
    {
      "type": "heading",
      "text": "Section Heading"
    },
    {
      "type": "paragraph",
      "text": "Paragraph text"
    },
    {
      "type": "list",
      "ordered": false,
      "items": ["Item 1", "Item 2"]
    }
  ]
}
```

### Quiz JSON Structure
```json
{
  "topicId": "topic1",
  "topicName": "Topic Name",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 0,
      "explanation": "Explanation of the answer"
    }
  ]
}
```

## Future Enhancements

- AI-generated study guidelines and quizzes
- Scoring system (currently tracks correct/incorrect)
- Multiple exam support
- User accounts and progress saving
- Review mode for completed topics
- Flashcard system

## Technical Details

- **Backend**: PHP serves JSON data files through an API endpoint
- **Frontend**: Vanilla JavaScript handles all UI interactions
- **Data Storage**: JSON files in the `data/` directory
- **API Endpoint**: `api/load-data.php` loads and returns all study materials

## Notes

- Currently uses hardcoded dummy data for COMPTIA SECURITY+
- All data is stored in JSON files for easy modification
- The interface is responsive and works on mobile devices
- Progress is tracked but not persisted (resets on page refresh)
- Requires PHP 7.0+ to run

