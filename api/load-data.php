<?php
/**
 * API endpoint to load all study materials
 * Loads data from the three-level hierarchy:
 * - data/domains/{domainName}/outline.json (domain structure with topics)
 * - data/domains/{domainName}/{topicName}/outline.json (topic structure with pages)
 * - data/domains/{domainName}/{topicName}/{pageId}/content.json (page content)
 * - data/domains/{domainName}/{topicName}/quiz.json (topic quiz)
 * - data/definitions.json (key term definitions)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Base directory for data files
$dataDir = __DIR__ . '/../data/';

/**
 * Safely load and decode a JSON file
 * @param string $filepath Path to JSON file
 * @return array Decoded JSON data
 * @throws Exception If file doesn't exist, can't be read, or contains invalid JSON
 */
function loadJsonFile($filepath) {
    if (!file_exists($filepath)) {
        throw new Exception("File not found: $filepath");
    }
    
    $content = file_get_contents($filepath);
    if ($content === false) {
        throw new Exception("Failed to read file: $filepath");
    }
    
    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON in file: $filepath - " . json_last_error_msg());
    }
    
    return $data;
}

/**
 * Load all pages for a given topic
 * @param string $topicDir Directory path for the topic
 * @param array $outline Topic outline with page order
 * @return array Array of page content
 */
function loadTopicPages($topicDir, $outline) {
    $pages = [];
    
    // Load each page
    foreach ($outline['pages'] as $page) {
        $pagePath = $topicDir . '/' . $page['id'] . '/content.json';
        if (file_exists($pagePath)) {
            $content = loadJsonFile($pagePath);
            $pages[] = [
                'id' => $page['id'],
                'title' => $page['title'],
                'blocks' => $content['blocks'] ?? []
            ];
        }
    }
    
    return $pages;
}

/**
 * Load all topics for a given domain
 * @param string $domainDir Directory path for the domain
 * @param array $outline Domain outline with topic order
 * @return array Array of topic data with pages
 */
function loadDomainTopics($domainDir, $outline) {
    $topics = [];
    
    // Load each topic
    foreach ($outline['topics'] as $topicInfo) {
        $topicId = $topicInfo['id'];
        $topicDir = $domainDir . '/' . $topicId;
        
        if (is_dir($topicDir)) {
            // Load topic outline
            $topicOutlinePath = $topicDir . '/outline.json';
            if (file_exists($topicOutlinePath)) {
                $topicOutline = loadJsonFile($topicOutlinePath);
                
                // Load all pages for this topic
                $pages = loadTopicPages($topicDir, $topicOutline);
                
                // Load quiz if it exists
                $quiz = null;
                $quizPath = $topicDir . '/quiz.json';
                if (file_exists($quizPath)) {
                    $quiz = loadJsonFile($quizPath);
                }
                
                // Create topic object
                $topic = [
                    'id' => $topicId,
                    'title' => $topicInfo['title'],
                    'domain' => $outline['domain'],
                    'pages' => $pages,
                    'quiz' => $quiz
                ];
                
                $topics[] = $topic;
            }
        }
    }
    
    return $topics;
}

try {
    // Load definitions file
    $definitions = loadJsonFile($dataDir . 'definitions.json');
    
    // Load learning guideline
    $guideline = loadJsonFile($dataDir . 'learning-guideline.json');
    
    // Load domains from folder structure
    $domains = [];
    $domainsDir = $dataDir . 'domains/';
    
    // Get all domains from guideline
    if (isset($guideline['domains'])) {
        foreach ($guideline['domains'] as $domainInfo) {
            $domainId = $domainInfo['id'];
            $domainDir = $domainsDir . $domainId;
            
            if (is_dir($domainDir)) {
                // Load domain outline
                $domainOutlinePath = $domainDir . '/outline.json';
                if (file_exists($domainOutlinePath)) {
                    $domainOutline = loadJsonFile($domainOutlinePath);
                    
                    // Load all topics for this domain
                    $topics = loadDomainTopics($domainDir, $domainOutline);
                    
                    // Create domain object
                    $domain = [
                        'id' => $domainId,
                        'title' => $domainInfo['title'],
                        'order' => $domainInfo['order'] ?? 999,
                        'topics' => $topics
                    ];
                    
                    $domains[] = $domain;
                }
            }
        }
    }
    
    // Sort domains by order
    usort($domains, function($a, $b) {
        return $a['order'] - $b['order'];
    });
    
    // Return all data as a single JSON object
    $response = [
        'success' => true,
        'data' => [
            'guideline' => $guideline,
            'domains' => $domains,
            'definitions' => $definitions['definitions']
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
