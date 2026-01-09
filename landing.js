/**
 * Landing page functionality
 * Handles exam selection and navigation to guidelines page
 */

/**
 * Initialize event listeners when DOM is loaded
 * Sets up click handlers for exam cards
 */
document.addEventListener('DOMContentLoaded', () => {
    const examCard = document.querySelector('.exam-card');
    
    // Add click handler to exam card
    if (examCard) {
        examCard.addEventListener('click', (e) => {
            // Only trigger if clicking the card itself or the button
            if (e.target.classList.contains('exam-card') || e.target.classList.contains('btn-select')) {
                // Navigate to guidelines page for selected exam
                window.location.href = 'guidelines.php?exam=security-plus';
            }
        });
    }
});
