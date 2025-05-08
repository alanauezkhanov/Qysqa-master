import pytest
from app import app, users_data
import io
from tests.config import TEST_CONFIG
import os

@pytest.fixture
def client():
    app.config.update(TEST_CONFIG)
    with app.test_client() as client:
        # Set up a test session
        with client.session_transaction() as session:
            session['user_id'] = 'test-user-123'
        yield client

def test_home_page(client):
    """Test that the home page loads successfully"""
    response = client.get('/')
    assert response.status_code == 200

def test_chat_endpoint(client):
    """Test that the chat endpoint is accessible"""
    response = client.post('/api/chat', 
                          json={
                              'message': 'Hello',
                              'user_id': 'test-user-123'
                          })
    assert response.status_code == 200

def test_notes_endpoint(client):
    """Test that the sources endpoint is accessible"""
    response = client.get('/api/sources')
    assert response.status_code == 200

def test_test_endpoint(client, test_source):
    """Test that the test generation endpoint is accessible"""
    # Initialize user data
    user_id = 'test-user-123'
    if user_id not in users_data:
        users_data[user_id] = {
            "sources": [],
            "chat_history": []
        }
    
    # Add test source to user data
    users_data[user_id]["sources"].append(test_source)
    
    # First add a test source to session
    with client.session_transaction() as session:
        if 'user_id' not in session:
            session['user_id'] = user_id
        if 'sources' not in session:
            session['sources'] = []
        session['sources'].append(test_source)

    # Print session data for debugging
    with client.session_transaction() as session:
        print("Session sources:", session.get('sources'))
    print("User data sources:", users_data[user_id]["sources"])

    response = client.post('/api/generate-test', 
                          json={
                              'sources': [test_source['id']],
                              'num_closed_questions': 5,
                              'num_open_questions': 0,
                              'difficulty': 'medium',
                              'user_id': user_id,
                              'subject': 'Test Subject'
                          })
    
    # Print response data for debugging
    print("Response status:", response.status_code)
    print("Response data:", response.get_data(as_text=True))
    
    assert response.status_code == 200

def test_upload_file(client):
    """Test file upload functionality"""
    # Create a test file
    test_file = (io.BytesIO(b'Test file content'), 'test.txt')
    
    # Ensure the upload directory exists
    os.makedirs(TEST_CONFIG['UPLOAD_FOLDER'], exist_ok=True)
    
    response = client.post('/api/upload',
                          data={
                              'file': test_file,
                              'user_id': 'test-user-123'
                          },
                          content_type='multipart/form-data')
    assert response.status_code in [200, 302]  # Either success or redirect 