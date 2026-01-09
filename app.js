/**
 * Main application JavaScript for the Study Platform
 * Handles topic navigation, quiz functionality, and tooltip definitions
 */

// Application State - stores all current application data
let currentState = {
    currentDomainIndex: 0,     // Currently displayed domain index
    currentTopicIndex: 0,       // Currently displayed topic index (within domain)
    currentPageIndex: 0,       // Current page index (within topic)
    currentQuizIndex: null,     // Currently displayed quiz (topic-based)
    currentQuestionIndex: 0,   // Current question within a quiz
    domains: [],                // Array of all domains
    currentDomain: null,        // Currently active domain object
    currentTopic: null,         // Currently active topic object
    quizResults: {},            // Results for each quiz (keyed by domain-topic)
    guideline: null,            // Learning guideline data
    definitions: {}             // Dictionary of key term definitions
};

/**
 * Cookie management functions for tracking studied topics
 */

/**
 * Set a cookie with the given name and value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: 365)
 */
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Mark a topic page as studied in cookies
 * @param {number} domainIndex - Domain index
 * @param {number} topicIndex - Topic index within domain
 * @param {number} pageIndex - Page index within topic
 */
function markTopicAsStudied(domainIndex, topicIndex, pageIndex) {
    const cookieName = `studied_topics`;
    let studied = getCookie(cookieName);
    
    if (!studied) {
        studied = {};
    } else {
        try {
            studied = JSON.parse(studied);
        } catch (e) {
            studied = {};
        }
    }
    
    const key = `${domainIndex}-${topicIndex}`;
    if (!studied[key]) {
        studied[key] = [];
    }
    
    // Add page if not already marked
    if (!studied[key].includes(pageIndex)) {
        studied[key].push(pageIndex);
    }
    
    setCookie(cookieName, JSON.stringify(studied));
}

/**
 * Load all data files via PHP API
 * Fetches domains, topics, pages, quizzes, guidelines, and definitions from the server
 */
async function loadData() {
    try {
        const response = await fetch('api/load-data.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load data');
        }
        
        // Extract data from response
        const { guideline, domains, definitions } = result.data;
        
        // Store in application state
        currentState.guideline = guideline;
        currentState.domains = domains;
        currentState.definitions = definitions || {};
        
        // Initialize quiz results tracking (keyed by domain-topic)
        currentState.quizResults = {};
        domains.forEach((domain, domainIdx) => {
            domain.topics.forEach((topic, topicIdx) => {
                if (topic.quiz) {
                    const key = `${domainIdx}-${topicIdx}`;
                    currentState.quizResults[key] = {
                        correct: 0,
                        total: 0,
                        completed: false
                    };
                }
            });
        });

        // Populate sidebar with domains and topics
        populateSidebar();

        // Check URL parameters for navigation
        const urlParams = new URLSearchParams(window.location.search);
        const domainParam = urlParams.get('domain');
        const topicParam = urlParams.get('topic');
        const pageParam = urlParams.get('page');
        const quizParam = urlParams.get('quiz');
        
        // Navigate based on URL parameters
        if (quizParam !== null && domainParam !== null && topicParam !== null) {
            const domainIdx = parseInt(domainParam);
            const topicIdx = parseInt(topicParam);
            if (domainIdx >= 0 && domainIdx < currentState.domains.length) {
                const domain = currentState.domains[domainIdx];
                if (topicIdx >= 0 && topicIdx < domain.topics.length) {
                    showQuiz(domainIdx, topicIdx);
                } else {
                    showPage(0, 0, 0);
                }
            } else {
                showPage(0, 0, 0);
            }
        } else if (domainParam !== null && topicParam !== null) {
            const domainIdx = parseInt(domainParam);
            const topicIdx = parseInt(topicParam);
            const pageIdx = pageParam !== null ? parseInt(pageParam) : 0;
            if (domainIdx >= 0 && domainIdx < currentState.domains.length) {
                const domain = currentState.domains[domainIdx];
                if (topicIdx >= 0 && topicIdx < domain.topics.length) {
                    showPage(domainIdx, topicIdx, pageIdx);
                } else {
                    showPage(0, 0, 0);
                }
            } else {
                showPage(0, 0, 0);
            }
        } else {
            // Default: Start with first domain, first topic, first page
            showPage(0, 0, 0);
        }
        updateProgress();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load study materials: ' + error.message + '\n\nMake sure you are running this through a PHP server (e.g., php -S localhost:8000)');
    }
}

/**
 * Populate sidebar with list of all domains and topics
 * Creates hierarchical structure: Domain → Topics
 */
function populateSidebar() {
    const topicsList = document.getElementById('topicsList');
    topicsList.innerHTML = '';

    // Create structure for each domain and its topics
    currentState.domains.forEach((domain, domainIdx) => {
        // Domain header
        const domainItem = document.createElement('li');
        domainItem.className = 'domain-item';
        
        const domainLink = document.createElement('a');
        domainLink.className = 'domain-link';
        domainLink.textContent = domain.title;
        domainLink.dataset.domain = domainIdx;
        
        domainItem.appendChild(domainLink);
        topicsList.appendChild(domainItem);
        
        // Topics under this domain
        domain.topics.forEach((topic, topicIdx) => {
            const topicItem = document.createElement('li');
            topicItem.className = 'topic-item';
            
            const topicLink = document.createElement('a');
            topicLink.className = 'topic-link';
            topicLink.textContent = topic.title;
            topicLink.dataset.domain = domainIdx;
            topicLink.dataset.topic = topicIdx;
            
            // Add click handler to navigate to topic
            topicLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Only allow navigation when viewing pages or completion screen
                if (document.getElementById('topicView').classList.contains('active') || 
                    document.getElementById('completionView').classList.contains('active')) {
                    // Update URL and show first page of topic
                    window.history.pushState({}, '', `study.php?domain=${domainIdx}&topic=${topicIdx}&page=0`);
                    showPage(domainIdx, topicIdx, 0);
                }
            });
            
            topicItem.appendChild(topicLink);
            topicsList.appendChild(topicItem);
        });
    });

    updateSidebar();
}

/**
 * Update sidebar to show active and completed states
 * Highlights the current topic and marks completed topics
 */
function updateSidebar() {
    const topicLinks = document.querySelectorAll('.topic-link');
    
    topicLinks.forEach((link) => {
        link.classList.remove('active', 'completed');
        
        const domainIdx = parseInt(link.dataset.domain);
        const topicIdx = parseInt(link.dataset.topic);
        
        // Mark as active if it's the current topic being viewed
        if (domainIdx === currentState.currentDomainIndex && 
            topicIdx === currentState.currentTopicIndex &&
            document.getElementById('topicView').classList.contains('active')) {
            link.classList.add('active');
        }
        
        // Mark as completed if quiz is done
        const quizKey = `${domainIdx}-${topicIdx}`;
        if (currentState.quizResults[quizKey] && currentState.quizResults[quizKey].completed) {
            link.classList.add('completed');
        }
    });
}

/**
 * Show page view within a topic
 * Navigates through Domain → Topic → Page hierarchy
 * @param {number} domainIndex - Domain index
 * @param {number} topicIndex - Topic index within domain
 * @param {number} pageIndex - Page index within topic
 */
function showPage(domainIndex, topicIndex, pageIndex = 0) {
    // Validate indices
    if (domainIndex >= currentState.domains.length) {
        showCompletion();
        return;
    }
    
    const domain = currentState.domains[domainIndex];
    if (topicIndex >= domain.topics.length) {
        // Move to next domain, first topic
        if (domainIndex + 1 < currentState.domains.length) {
            showPage(domainIndex + 1, 0, 0);
        } else {
            showCompletion();
        }
        return;
    }
    
    const topic = domain.topics[topicIndex];
    if (pageIndex >= topic.pages.length) {
        // Move to next topic in domain, or next domain
        if (topicIndex + 1 < domain.topics.length) {
            showPage(domainIndex, topicIndex + 1, 0);
        } else if (domainIndex + 1 < currentState.domains.length) {
            showPage(domainIndex + 1, 0, 0);
        } else {
            showCompletion();
        }
        return;
    }

    // Update state
    currentState.currentDomainIndex = domainIndex;
    currentState.currentTopicIndex = topicIndex;
    currentState.currentPageIndex = pageIndex;
    currentState.currentDomain = domain;
    currentState.currentTopic = topic;

    const page = topic.pages[pageIndex];

    // Update UI elements
    document.getElementById('topicTitle').textContent = `${domain.title} - ${topic.title}`;
    document.getElementById('topicContent').innerHTML = formatTopicContent(page.blocks);
    document.getElementById('currentPage').textContent = pageIndex + 1;
    document.getElementById('totalPages').textContent = topic.pages.length;
    
    // Show/hide navigation buttons based on page position
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    prevBtn.style.display = pageIndex > 0 ? 'inline-block' : 'none';
    
    // On final page, change Next button to Quiz button (if quiz exists)
    if (pageIndex >= topic.pages.length - 1) {
        if (topic.quiz) {
            nextBtn.textContent = 'Proceed to Quiz →';
            nextBtn.className = 'btn btn-primary';
            nextBtn.onclick = () => {
                window.history.pushState({}, '', `study.php?domain=${domainIndex}&topic=${topicIndex}&quiz=1`);
                showQuiz(domainIndex, topicIndex);
            };
        } else {
            // No quiz, move to next topic
            nextBtn.textContent = 'Next Topic →';
            nextBtn.className = 'btn btn-primary';
            nextBtn.onclick = () => {
                if (topicIndex + 1 < domain.topics.length) {
                    showPage(domainIndex, topicIndex + 1, 0);
                } else if (domainIndex + 1 < currentState.domains.length) {
                    showPage(domainIndex + 1, 0, 0);
                } else {
                    showCompletion();
                }
            };
        }
    } else {
        nextBtn.textContent = 'Next →';
        nextBtn.className = 'btn btn-primary';
        nextBtn.onclick = () => {
            const newPageIndex = pageIndex + 1;
            window.history.pushState({}, '', `study.php?domain=${domainIndex}&topic=${topicIndex}&page=${newPageIndex}`);
            showPage(domainIndex, topicIndex, newPageIndex);
        };
    }
    
    // Mark page as studied in cookie
    markTopicAsStudied(domainIndex, topicIndex, pageIndex);
    
    // Show topic view, hide other views
    document.getElementById('topicView').classList.add('active');
    document.getElementById('quizView').classList.remove('active');
    document.getElementById('completionView').classList.remove('active');

    // Initialize tooltips after content is loaded
    setTimeout(() => {
        initializeTooltips();
    }, 100);

    updateProgress();
    updateSidebar();
}

// Removed splitTopicIntoPages - no longer needed with three-level hierarchy

/**
 * Format topic content blocks with support for various content types
 * Also processes text to add tooltip links for key terms
 * @param {Array} blocks - Array of content blocks to format
 * @returns {string} HTML string of formatted content
 */
function formatTopicContent(blocks) {
    if (Array.isArray(blocks)) {
        return blocks.map(block => {
            if (block.type === 'heading') {
                return `<h3>${block.text}</h3>`;
            } else if (block.type === 'paragraph') {
                // Process paragraph text to add tooltip links for key terms
                return `<p>${addTooltipLinks(block.text)}</p>`;
            } else if (block.type === 'list') {
                const listType = block.ordered ? 'ol' : 'ul';
                // Process list items to add tooltip links
                const items = block.items.map(li => `<li>${addTooltipLinks(li)}</li>`).join('');
                return `<${listType}>${items}</${listType}>`;
            } else if (block.type === 'code') {
                return `<code>${block.text}</code>`;
            }
            return `<p>${block.text || block}</p>`;
        }).join('');
    }
    return `<p>${blocks}</p>`;
}

/**
 * Add tooltip links to text by detecting key terms
 * Wraps key terms in spans with tooltip functionality
 * @param {string} text - Text to process
 * @returns {string} Text with tooltip links added
 */
function addTooltipLinks(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Get all definition keys, sorted by length (longest first) to match longer terms first
    const terms = Object.keys(currentState.definitions).sort((a, b) => b.length - a.length);
    
    let processedText = text;
    const processedIndices = new Set(); // Track which character indices have been processed
    
    // Replace each term with a tooltip link
    terms.forEach(term => {
        // Create case-insensitive regex to find the term
        // Match whole words only (not part of other words)
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        
        processedText = processedText.replace(regex, (match, offset) => {
            // Check if this position is already inside a tooltip link
            const beforeMatch = processedText.substring(0, offset);
            const afterMatch = processedText.substring(offset);
            
            // Don't replace if already inside a tooltip link span
            if (beforeMatch.includes('<span class="tooltip-link"') && 
                !beforeMatch.split('<span class="tooltip-link"').pop().includes('</span>')) {
                return match;
            }
            
            const definition = currentState.definitions[term.toLowerCase()];
            if (definition) {
                return `<span class="tooltip-link" data-term="${term.toLowerCase()}" data-definition="${escapeHtml(definition)}">${match}</span>`;
            }
            return match;
        });
    });
    
    return processedText;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize tooltip functionality for all tooltip links
 * Adds hover event listeners to show/hide tooltips
 */
function initializeTooltips() {
    // Remove existing tooltips
    const existingTooltips = document.querySelectorAll('.tooltip-popup');
    existingTooltips.forEach(tooltip => tooltip.remove());
    
    // Get all tooltip links
    const tooltipLinks = document.querySelectorAll('.tooltip-link');
    
    tooltipLinks.forEach(link => {
        // Create tooltip popup element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = link.getAttribute('data-definition');
        document.body.appendChild(tooltip);
        
        // Show tooltip on mouse enter
        link.addEventListener('mouseenter', (e) => {
            const rect = link.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) + 'px';
            tooltip.style.top = rect.top - 10 + 'px';
            tooltip.classList.add('visible');
        });
        
        // Hide tooltip on mouse leave
        link.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
    });
}

/**
 * Show quiz view for a specific topic
 * @param {number} domainIndex - Domain index
 * @param {number} topicIndex - Topic index within domain
 */
function showQuiz(domainIndex, topicIndex) {
    const domain = currentState.domains[domainIndex];
    if (!domain || topicIndex >= domain.topics.length) {
        showCompletion();
        return;
    }
    
    const topic = domain.topics[topicIndex];
    if (!topic || !topic.quiz) {
        // No quiz for this topic, move to next
        if (topicIndex + 1 < domain.topics.length) {
            showPage(domainIndex, topicIndex + 1, 0);
        } else if (domainIndex + 1 < currentState.domains.length) {
            showPage(domainIndex + 1, 0, 0);
        } else {
            showCompletion();
        }
        return;
    }

    currentState.currentDomainIndex = domainIndex;
    currentState.currentTopicIndex = topicIndex;
    currentState.currentQuizIndex = `${domainIndex}-${topicIndex}`;
    currentState.currentQuestionIndex = 0;
    const quiz = topic.quiz;

    // Update quiz UI
    document.getElementById('quizTopicName').textContent = topic.title;
    document.getElementById('totalQuestions').textContent = quiz.questions.length;

    // Show quiz view, hide other views
    document.getElementById('topicView').classList.remove('active');
    document.getElementById('quizView').classList.add('active');
    document.getElementById('completionView').classList.remove('active');

    updateSidebar();
    showQuestion(0);
}

/**
 * Show a specific question in the quiz
 * @param {number} index - Question index to display
 */
function showQuestion(index) {
    const domain = currentState.domains[currentState.currentDomainIndex];
    const topic = domain.topics[currentState.currentTopicIndex];
    const quiz = topic.quiz;
    
    // Check if quiz is complete
    if (index >= quiz.questions.length) {
        // Quiz completed
        const quizKey = currentState.currentQuizIndex;
        if (currentState.quizResults[quizKey]) {
            currentState.quizResults[quizKey].completed = true;
        }
        
        // Move to next topic after a delay
        setTimeout(() => {
            const nextTopicIdx = currentState.currentTopicIndex + 1;
            if (nextTopicIdx < domain.topics.length) {
                showPage(currentState.currentDomainIndex, nextTopicIdx, 0);
            } else {
                // Move to next domain
                const nextDomainIdx = currentState.currentDomainIndex + 1;
                if (nextDomainIdx < currentState.domains.length) {
                    showPage(nextDomainIdx, 0, 0);
                } else {
                    showCompletion();
                }
            }
        }, 2000);
        return;
    }

    currentState.currentQuestionIndex = index;
    const question = quiz.questions[index];

    // Update question counter
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('questionText').textContent = question.question;
    
    // Clear and populate options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.dataset.index = i;
        optionDiv.addEventListener('click', () => selectOption(i, question.correct));
        optionsContainer.appendChild(optionDiv);
    });

    // Hide explanation until answer is selected
    document.getElementById('explanationContainer').classList.add('hidden');
}

/**
 * Handle option selection in quiz
 * Prevents multiple selections and shows correct/incorrect feedback
 * @param {number} selectedIndex - Index of selected option
 * @param {number} correctIndex - Index of correct option
 */
function selectOption(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.option');
    
    // Check if options are already disabled (answer already selected)
    if (options[0] && options[0].classList.contains('disabled')) {
        return; // Don't allow further selections
    }
    
    // Disable all options
    options.forEach(opt => opt.classList.add('disabled'));
    
    const selectedOption = options[selectedIndex];
    const correctOption = options[correctIndex];

    selectedOption.classList.add('selected');

    // Get quiz result tracker
    const quizKey = currentState.currentQuizIndex;
    if (!currentState.quizResults[quizKey]) {
        currentState.quizResults[quizKey] = {
            correct: 0,
            total: 0,
            completed: false
        };
    }

    // Check if answer is correct
    if (selectedIndex === correctIndex) {
        selectedOption.classList.add('correct');
        currentState.quizResults[quizKey].correct++;
        currentState.quizResults[quizKey].total++;
    } else {
        selectedOption.classList.add('incorrect');
        correctOption.classList.add('correct');
        currentState.quizResults[quizKey].total++;
    }

    // Show explanation
    const domain = currentState.domains[currentState.currentDomainIndex];
    const topic = domain.topics[currentState.currentTopicIndex];
    const quiz = topic.quiz;
    const question = quiz.questions[currentState.currentQuestionIndex];
    
    const explanationContainer = document.getElementById('explanationContainer');
    const explanationText = document.getElementById('explanationText');
    
    if (question.explanation) {
        explanationText.textContent = question.explanation;
    } else {
        explanationText.textContent = selectedIndex === correctIndex 
            ? 'Correct! Well done.' 
            : `The correct answer is: ${question.options[correctIndex]}`;
    }
    
    explanationContainer.classList.remove('hidden');
    updateSidebar();
}

/**
 * Move to next question in quiz
 */
function nextQuestion() {
    showQuestion(currentState.currentQuestionIndex + 1);
}

/**
 * Show completion view with results summary
 */
function showCompletion() {
    document.getElementById('topicView').classList.remove('active');
    document.getElementById('quizView').classList.remove('active');
    document.getElementById('completionView').classList.add('active');

    const resultsSummary = document.getElementById('resultsSummary');
    let html = '<h3>Your Results</h3>';
    
    // Display results for each quiz (organized by domain and topic)
    currentState.domains.forEach((domain, domainIdx) => {
        domain.topics.forEach((topic, topicIdx) => {
            const quizKey = `${domainIdx}-${topicIdx}`;
            const result = currentState.quizResults[quizKey];
            if (result && result.total > 0) {
                const percentage = Math.round((result.correct / result.total) * 100);
                html += `<p><strong>${domain.title} - ${topic.title}:</strong> ${result.correct}/${result.total} correct (${percentage}%)</p>`;
            }
        });
    });

    resultsSummary.innerHTML = html;
    updateProgress();
    updateSidebar();
}

/**
 * Update progress bar based on current progress
 * Calculates progress through domains, topics, pages, and quizzes
 */
function updateProgress() {
    // Count total items: all pages + all quizzes
    let totalItems = 0;
    let completed = 0;
    
    currentState.domains.forEach((domain, domainIdx) => {
        domain.topics.forEach((topic, topicIdx) => {
            // Count pages
            totalItems += topic.pages.length;
            
            // Count completed pages up to current position
            if (domainIdx < currentState.currentDomainIndex || 
                (domainIdx === currentState.currentDomainIndex && topicIdx < currentState.currentTopicIndex)) {
                completed += topic.pages.length;
            } else if (domainIdx === currentState.currentDomainIndex && topicIdx === currentState.currentTopicIndex) {
                completed += currentState.currentPageIndex;
            }
            
            // Count quiz
            if (topic.quiz) {
                totalItems += 1;
                const quizKey = `${domainIdx}-${topicIdx}`;
                if (currentState.quizResults[quizKey] && currentState.quizResults[quizKey].completed) {
                    completed += 1;
                } else if (document.getElementById('quizView').classList.contains('active') &&
                          currentState.currentDomainIndex === domainIdx &&
                          currentState.currentTopicIndex === topicIdx) {
                    completed += 0.5; // Currently taking quiz
                }
            }
        });
    });

    // Update progress bar width
    const progress = totalItems > 0 ? (completed / totalItems) * 100 : 0;
    document.getElementById('progressFill').style.width = `${progress}%`;

    // Update progress text
    const currentItem = Math.floor(completed) + 1;
    document.getElementById('progressText').textContent = `Progress: ${currentItem} of ${totalItems} sections`;
}

/**
 * Initialize event listeners when DOM is loaded
 * Sets up button click handlers and loads data
 */
document.addEventListener('DOMContentLoaded', () => {
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    
    // Next question button
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', nextQuestion);
    }

    // Previous page button
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentState.currentPageIndex > 0) {
                const newPageIndex = currentState.currentPageIndex - 1;
                window.history.pushState({}, '', `study.php?domain=${currentState.currentDomainIndex}&topic=${currentState.currentTopicIndex}&page=${newPageIndex}`);
                showPage(currentState.currentDomainIndex, currentState.currentTopicIndex, newPageIndex);
            }
        });
    }
    
    // Note: Next button handler is set dynamically in showPage() function

    // Sidebar toggle functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('hidden');
            if (sidebarToggleBtn) sidebarToggleBtn.style.display = 'block';
            setCookie('sidebar_hidden', 'true', 365);
        });
    }
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.remove('hidden');
            sidebarToggleBtn.style.display = 'none';
            setCookie('sidebar_hidden', 'false', 365);
        });
        
        // Check if sidebar should be hidden from cookie
        const sidebarHidden = getCookie('sidebar_hidden');
        if (sidebarHidden === 'true') {
            sidebar.classList.add('hidden');
            sidebarToggleBtn.style.display = 'block';
        }
    }
    
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    if (darkModeToggle) {
        // Check for saved dark mode preference
        const darkMode = getCookie('dark_mode');
        if (darkMode === 'true') {
            document.body.classList.add('dark-mode');
            if (darkModeIcon) darkModeIcon.textContent = '☀️';
            if (darkModeText) darkModeText.textContent = 'Light Mode';
        }
        
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            
            if (isDark) {
                // Switch to light mode
                document.body.classList.remove('dark-mode');
                if (darkModeIcon) darkModeIcon.textContent = '🌙';
                if (darkModeText) darkModeText.textContent = 'Dark Mode';
                setCookie('dark_mode', 'false', 365);
            } else {
                // Switch to dark mode
                document.body.classList.add('dark-mode');
                if (darkModeIcon) darkModeIcon.textContent = '☀️';
                if (darkModeText) darkModeText.textContent = 'Light Mode';
                setCookie('dark_mode', 'true', 365);
            }
        });
    }

    // Only load data if we're on the study page
    if (document.getElementById('topicView')) {
        loadData();
    }
});

