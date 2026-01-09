/**
 * Guidelines page functionality
 * Handles display of study guidelines and topic navigation
 */

// Store loaded guideline data
let guidelineData = null;

/**
 * Load guidelines data from the API
 * Fetches all study materials and displays them on the guidelines page
 */
async function loadGuidelines() {
    try {
        const response = await fetch('api/load-data.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to load data');
        }
        
        // Store data and display
        guidelineData = result.data;
        displayGuidelines();
        displayTopicsOverview();
    } catch (error) {
        console.error('Error loading guidelines:', error);
        alert('Failed to load study guidelines: ' + error.message);
    }
}

/**
 * Display guidelines content on the page
 * Shows exam name, description, and study tips
 */
function displayGuidelines() {
    const guidelinesContent = document.getElementById('guidelinesContent');
    const guideline = guidelineData.guideline;
    
    // Build HTML for guidelines
    let html = `
        <div class="guideline-intro">
            <h2>${guideline.exam}</h2>
            <p class="guideline-description">${guideline.description}</p>
        </div>
    `;
    
    // Add study tips if available
    if (guideline.studyTips && guideline.studyTips.length > 0) {
        html += '<div class="study-tips"><h3>Study Tips</h3><ul>';
        guideline.studyTips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += '</ul></div>';
    }
    
    guidelinesContent.innerHTML = html;
}

/**
 * Display domains and topics overview with navigation buttons
 * Creates cards for each domain and topic with study and quiz options
 */
function displayTopicsOverview() {
    const topicsOverview = document.getElementById('topicsOverview');
    const domains = guidelineData.domains;
    
    let html = '';
    // Create cards for each domain and its topics
    domains.forEach((domain, domainIdx) => {
        // Domain header
        html += `
            <div class="domain-section">
                <h3 class="domain-title">${domain.title}</h3>
            </div>
        `;
        
        // Topics under this domain
        domain.topics.forEach((topic, topicIdx) => {
            html += `
                <div class="topic-card" data-domain-index="${domainIdx}" data-topic-index="${topicIdx}">
                    <h4>${topic.title}</h4>
                    <div class="topic-actions">
                        <button class="btn btn-primary btn-small" onclick="navigateToTopic(${domainIdx}, ${topicIdx})">Study Topic</button>
                        ${topic.quiz ? `<button class="btn btn-secondary btn-small" onclick="navigateToQuiz(${domainIdx}, ${topicIdx})">Take Quiz</button>` : ''}
                    </div>
                </div>
            `;
        });
    });
    
    topicsOverview.innerHTML = html;
}

/**
 * Navigate to a specific topic
 * @param {number} domainIdx - Domain index
 * @param {number} topicIdx - Topic index within domain
 */
function navigateToTopic(domainIdx, topicIdx) {
    window.location.href = `study.php?domain=${domainIdx}&topic=${topicIdx}&page=0`;
}

/**
 * Navigate to a specific quiz
 * @param {number} domainIdx - Domain index
 * @param {number} topicIdx - Topic index within domain
 */
function navigateToQuiz(domainIdx, topicIdx) {
    window.location.href = `study.php?domain=${domainIdx}&topic=${topicIdx}&quiz=1`;
}

/**
 * Initialize event listeners when DOM is loaded
 * Sets up button handlers for starting study or taking quizzes
 */
document.addEventListener('DOMContentLoaded', () => {
    const startStudyBtn = document.getElementById('startStudyBtn');
    const takeQuizBtn = document.getElementById('takeQuizBtn');
    
    // Start studying button - goes to first domain, first topic, first page
    if (startStudyBtn) {
        startStudyBtn.addEventListener('click', () => {
            window.location.href = 'study.php?domain=0&topic=0&page=0';
        });
    }
    
    // Take quiz button - shows available quizzes
    if (takeQuizBtn) {
        takeQuizBtn.addEventListener('click', () => {
            // Build list of available quizzes
            const domains = guidelineData ? guidelineData.domains : [];
            let quizList = 'Available Quizzes:\n\n';
            let quizCount = 0;
            const quizMap = [];
            
            domains.forEach((domain, domainIdx) => {
                domain.topics.forEach((topic, topicIdx) => {
                    if (topic.quiz) {
                        quizCount++;
                        quizList += `${quizCount}. ${domain.title} - ${topic.title}\n`;
                        quizMap.push({ domainIdx, topicIdx });
                    }
                });
            });
            
            if (quizCount > 0) {
                const quizIndex = prompt(quizList + `\nWhich quiz would you like to take? (1-${quizCount})`);
                const index = parseInt(quizIndex) - 1;
                if (index >= 0 && index < quizMap.length) {
                    const { domainIdx, topicIdx } = quizMap[index];
                    navigateToQuiz(domainIdx, topicIdx);
                }
            } else {
                alert('No quizzes available.');
            }
        });
    }
    
    // Load guidelines data
    loadGuidelines();
});
