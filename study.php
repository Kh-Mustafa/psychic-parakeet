<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Platform - COMPTIA SECURITY+</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app-layout">
        <!-- Main Content -->
        <div class="main-content">
            <div class="container">
                <header>
                    <h1>COMPTIA SECURITY+ Study Platform</h1>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Topic 1 of 2</div>
                </header>

                <!-- Topic View -->
                <div id="topicView" class="view active">
                    <div class="content-card">
                        <div class="topic-header">
                            <h2 id="topicTitle">Topic Title</h2>
                            <span class="page-indicator">Page <span id="currentPage">1</span> of <span id="totalPages">1</span></span>
                        </div>
                        <div id="topicContent" class="topic-content">
                            <!-- Topic content will be loaded here -->
                        </div>
                        <div class="topic-navigation">
                            <button id="prevPageBtn" class="btn btn-secondary" style="display: none;">← Previous</button>
                            <button id="nextPageBtn" class="btn btn-primary">Next →</button>
                        </div>
                    </div>
                </div>

                <!-- Quiz View -->
                <div id="quizView" class="view">
                    <div class="content-card">
                        <div class="quiz-header">
                            <h2>Quiz: <span id="quizTopicName"></span></h2>
                            <div class="question-counter">
                                Question <span id="currentQuestion">1</span> of <span id="totalQuestions">5</span>
                            </div>
                        </div>
                        <div id="quizContent" class="quiz-content">
                            <div class="question-container">
                                <h3 id="questionText">Question text will appear here</h3>
                                <div id="optionsContainer" class="options-container">
                                    <!-- Options will be loaded here -->
                                </div>
                            </div>
                            <div id="explanationContainer" class="explanation-container hidden">
                                <div id="explanationText" class="explanation-text"></div>
                                <button id="nextQuestionBtn" class="btn btn-primary">Next Question</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Completion View -->
                <div id="completionView" class="view">
                    <div class="content-card">
                        <h2>Congratulations!</h2>
                        <p>You have completed all topics and quizzes.</p>
                        <div id="resultsSummary" class="results-summary"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar (Right Side) -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h2>Topics</h2>
                <button id="sidebarToggle" class="sidebar-toggle" title="Toggle Sidebar">×</button>
            </div>
            <nav class="sidebar-nav">
                <ul id="topicsList" class="topics-list">
                    <!-- Topics will be loaded here -->
                </ul>
            </nav>
            <div class="sidebar-footer">
                <button id="darkModeToggle" class="dark-mode-toggle">
                    <span id="darkModeIcon">🌙</span>
                    <span id="darkModeText">Dark Mode</span>
                </button>
            </div>
        </aside>
        <button id="sidebarToggleBtn" class="sidebar-toggle-btn" style="display: none;">☰</button>
    </div>

    <script src="app.js"></script>
</body>
</html>

