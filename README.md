# Study Platform — CompTIA Security+

A web-based study platform for the CompTIA Security+ certification. The site delivers structured learning content followed by quizzes, with progress tracking across domains, topics, and pages.

---

## Features

- **Domain → Topic → Page learning flow**: Content is organized by exam domain, then topic, then multi-page lessons
- **Inline definitions (hover tooltips)**: Key terms display short definitions sourced from a central glossary file
- **Interactive quizzes after each topic**: Coverage-based multiple-choice questions with explanations
- **Progress tracking**: Visual progress indicators as you move through pages and quizzes
- **Textbook-style presentation**: Paragraph-based instructional content rather than bullet-only summaries

---

## Project Structure

```
SiteP/
├── index.php                 # Main PHP page
├── styles.css                # Styling and layout
├── app.js                    # Frontend logic and navigation
├── api/
│   └── load-data.php         # PHP API endpoint to load JSON data
├── data/
│   ├── learning-guideline.json   # High-level study plan and domain order
│   ├── definitions.json          # Central glossary for hover definitions
│   └── domains/
│       ├── General Security Concepts/
│       │   ├── outline.json
│       │   └── <topic>/
│       │       ├── outline.json
│       │       └── <page>/
│       │           └── content.json
│       └── Threats, Vulnerabilities, and Mitigations/
│           ├── outline.json
│           └── <topic>/
│               ├── outline.json
│               ├── <page>/content.json
│               └── quiz.json
└── README.md
```

### Data Hierarchy

- **Domain outline**: `data/domains/<Domain>/outline.json`
- **Topic outline**: `data/domains/<Domain>/<Topic>/outline.json`
- **Lesson pages**: `data/domains/<Domain>/<Topic>/<Page>/content.json`
- **Topic quiz**: `data/domains/<Domain>/<Topic>/quiz.json`
- **Glossary**: `data/definitions.json`

---

## How to Use

1. **Start the PHP server** (see below)

2. **Study Flow**
   - Select a domain
   - Read through topic pages in order
   - After the last page, the topic quiz begins
   - After the quiz, the next topic loads automatically

3. **Quiz Interaction**
   - Click an answer option to submit
   - Correct and incorrect choices are visually indicated
   - Explanations clarify why answers are right or wrong
   - Click "Next" to proceed

4. **Definitions**
   - Hover over highlighted terms to see short glossary definitions
   - Definitions are sourced from `data/definitions.json`

---

## Running Locally

**Note:** This application must be served by PHP. Opening `index.php` directly in a browser will not work.

### Option 1 — PHP Built‑in Server (Recommended)

```bash
cd SiteP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 2 — Local Web Server Stack

Place the project in your web server directory:

- XAMPP: `C:\xampp\htdocs\SiteP`
- WAMP: `C:\wamp64\www\SiteP`
- MAMP: `/Applications/MAMP/htdocs/SiteP`

Then open: `http://localhost/SiteP`

### Option 3 — Other Servers

Any server capable of running PHP (Apache, Nginx + PHP-FPM, etc.) can host the project.

---

## Data Format

### Page Content JSON

```json
{
  "title": "Page Title",
  "blocks": [
    { "type": "heading", "text": "Section Heading" },
    { "type": "paragraph", "text": "Paragraph text" },
    { "type": "list", "ordered": false, "items": ["Item 1", "Item 2"] }
  ]
}
```

### Topic Outline JSON

```json
{
  "topic": "Topic Name",
  "pages": [
    { "id": "page-id", "title": "Page Title" }
  ]
}
```

### Domain Outline JSON

```json
{
  "domain": "Domain Name",
  "topics": [
    { "id": "topic-id", "title": "Topic Title" }
  ]
}
```

### Quiz JSON

```json
{
  "topicId": "topic-id",
  "topicName": "Topic Name",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 1,
      "explanation": "Why the correct option is correct and others are not"
    }
  ]
}
```

### Definitions JSON

```json
{
  "definitions": {
    "term": "Short explanation",
    "another term": "Another explanation"
  }
}
```

---

## Current Scope

- Single exam: CompTIA Security+
- Content is hardcoded in JSON files
- Progress is tracked in-session (not persisted across refresh)

---

## Planned Enhancements

- Persistent user progress
- Scoring and weak‑topic analysis
- Multiple exam support
- AI‑generated study plans and quizzes
- Review and flashcard modes

---

## Technical Notes

- Backend: PHP loads JSON files and exposes them via an API
- Frontend: Vanilla JavaScript renders content and manages navigation
- No database is currently used

---

## Notes

- All learning content lives in `data/` and can be edited without touching code
- The site expects valid JSON — malformed files will break loading
- Domain and topic order are controlled entirely by outline files

