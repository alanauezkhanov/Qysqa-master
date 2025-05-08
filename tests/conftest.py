import pytest
from unittest.mock import patch
import os
from tests.config import TEST_CONFIG

@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment before each test"""
    # Create test uploads directory
    os.makedirs(TEST_CONFIG['UPLOAD_FOLDER'], exist_ok=True)
    yield
    # Cleanup after tests
    if os.path.exists(TEST_CONFIG['UPLOAD_FOLDER']):
        for file in os.listdir(TEST_CONFIG['UPLOAD_FOLDER']):
            os.remove(os.path.join(TEST_CONFIG['UPLOAD_FOLDER'], file))
        os.rmdir(TEST_CONFIG['UPLOAD_FOLDER'])

@pytest.fixture(autouse=True)
def mock_gemini():
    """Mock Gemini API responses for all tests"""
    with patch('google.generativeai.GenerativeModel.generate_content') as mock_generate:
        def mock_response(*args, **kwargs):
            # Create a mock response object
            class MockResponse:
                def __init__(self, text):
                    self.text = text
            # Check if this is a test generation request
            if 'multiple-choice test' in str(args[0]).lower():
                return MockResponse("""
Question 1: What is the main topic of the test content?
A. Test Generation
B. Content Analysis
C. Question Formatting
D. Source Management
Correct Answer: A
Explanation: The main topic is test generation as indicated in the content.
Source: Test Source

Question 2: How does the test content relate to the subject?
A. It provides examples
B. It explains concepts
C. It generates questions
D. It analyzes data
Correct Answer: C
Explanation: The content is specifically about generating test questions.
Source: Test Source

Question 3: What are the key points discussed?
A. Question types and formats
B. Content analysis methods
C. Test generation process
D. Source management
Correct Answer: C
Explanation: The content focuses on the process of generating test questions.
Source: Test Source

Question 4: What are the implications of the content?
A. Better test quality
B. Improved learning
C. Efficient question generation
D. All of the above
Correct Answer: D
Explanation: The content suggests multiple benefits including better test quality, improved learning, and efficient question generation.
Source: Test Source

Question 5: How can the content be applied in practice?
A. Manual question creation
B. Automated test generation
C. Content analysis
D. Source management
Correct Answer: B
Explanation: The content is designed for automated test generation from source materials.
Source: Test Source
""")
            # Default response for other requests
            return MockResponse("This is a mock response from Gemini AI")
        
        mock_generate.side_effect = mock_response
        yield mock_generate

@pytest.fixture
def test_source():
    """Create a test source for test generation"""
    return {
        "id": "test-source-1",
        "name": "Test Source",
        "content": "This is test content for generating questions.",
        "type": "text",
        "subject": "Test Subject",
        "created_at": "2024-03-20T00:00:00Z"
    } 