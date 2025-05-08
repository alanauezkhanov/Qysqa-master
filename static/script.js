document.addEventListener('DOMContentLoaded', function() {
    // Configure Marked.js for Markdown rendering
    marked.setOptions({
        breaks: true,  // Enable line breaks
        gfm: true,     // GitHub Flavored Markdown
        headerIds: false, // Disable header IDs to avoid conflicts
        mangle: false, // Disable mangling of header IDs
        sanitize: false // Note: Client must be careful with XSS
    });
    
    // UI Elements
    const addSourceBtn = document.getElementById('add-source-btn');
    const addSourceEmptyBtn = document.getElementById('add-source-empty-btn');
    const generateTestBtn = document.getElementById('generate-test-btn');
    const fileModal = document.getElementById('add-file-modal');
    const testModal = document.getElementById('generate-test-modal');
    const modalClose = document.getElementById('modal-close');
    const testModalClose = document.getElementById('test-modal-close');
    const fileInput = document.getElementById('file-input');
    const fileUploadArea = document.getElementById('file-upload-area');
    const sourcesContainer = document.getElementById('sources-container');
    const sourcesCount = document.getElementById('sources-count');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const selectedSourcesCount = document.getElementById('selected-sources-count');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-container');
    const initialContent = document.getElementById('initial-content');
    const emptyState = document.getElementById('empty-state');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const generateSummaryBtn = document.getElementById('generate-summary-btn');
    const summaryContent = document.getElementById('summary-content');
    const createTestBtn = document.getElementById('create-test-btn');
    const createTestConfirmBtn = document.getElementById('create-test-confirm');
    const numQuestionsInput = document.getElementById('num-questions');
    const difficultySelect = document.getElementById('difficulty');
    const testContent = document.getElementById('test-content');
    const sourceTabs = document.querySelectorAll('.source-tab');
    const sourceTabContents = document.querySelectorAll('.source-tab-content');
    const youtubeUrlInput = document.getElementById('youtube-url-input');
    const addYoutubeBtn = document.getElementById('add-youtube-btn');

    // Clipboard text handling
    const clipboardTextInput = document.getElementById('clipboard-text-input');
    const addClipboardBtn = document.getElementById('add-clipboard-btn');
    const pasteTextBtn = document.getElementById('paste-text-btn');
    
    // App state
    let sources = [];
    let selectedSources = [];
    let chatHistory = [];
    let allSourcesSelected = false;

    // Initialize app
    loadSources();

    // Event listeners
    addSourceBtn.addEventListener('click', () => {
        fileModal.style.display = 'block';
    });

    addSourceEmptyBtn.addEventListener('click', () => {
        fileModal.style.display = 'block';
    });

    modalClose.addEventListener('click', () => {
        fileModal.style.display = 'none';
    });

    testModalClose.addEventListener('click', () => {
        testModal.style.display = 'none';
    });

    generateTestBtn.addEventListener('click', () => {
        if (sources.length > 0) {
            testModal.style.display = 'block';
        } else {
            alert('Добавьте материалы перед созданием теста');
        }
    });

    createTestBtn.addEventListener('click', () => {
        if (sources.length > 0) {
            testModal.style.display = 'block';
        } else {
            alert('Добавьте материалы перед созданием теста');
        }
    });

    createTestConfirmBtn.addEventListener('click', () => {
        const numQuestionsTotal = parseInt(numQuestionsInput.value, 10);
        const numClosedQuestions = parseInt(document.getElementById('closed-questions').value, 10);
        const numOpenQuestions = parseInt(document.getElementById('open-questions').value, 10);
        const difficulty = difficultySelect.value;
        
        // Validate total questions count
        if (numClosedQuestions + numOpenQuestions !== numQuestionsTotal) {
            // Update total to match sum
            numQuestionsInput.value = numClosedQuestions + numOpenQuestions;
        }
        
        generateTest(numClosedQuestions, numOpenQuestions, difficulty);
        testModal.style.display = 'none';
    });

    fileInput.addEventListener('change', handleFileUpload);

    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--accent-blue)';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.borderColor = 'var(--border-color)';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload();
        }
    });

    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    selectAllCheckbox.addEventListener('click', toggleSelectAll);

    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    generateSummaryBtn.addEventListener('click', generateSummary);

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Tab navigation for source types in modal
    sourceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            sourceTabs.forEach(t => {
                t.classList.remove('active');
            });
            
            sourceTabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).style.display = 'block';
        });
    });

    // Synchronize question counts
    const numQuestionsElement = document.getElementById('num-questions');
    const closedQuestionsElement = document.getElementById('closed-questions');
    const openQuestionsElement = document.getElementById('open-questions');
    
    numQuestionsElement.addEventListener('change', () => {
        const total = parseInt(numQuestionsElement.value, 10);
        const closed = parseInt(closedQuestionsElement.value, 10);
        const open = parseInt(openQuestionsElement.value, 10);
        
        if (closed + open !== total) {
            // Adjust closed questions to match the total
            closedQuestionsElement.value = Math.max(0, total - open);
        }
    });
    
    closedQuestionsElement.addEventListener('change', () => {
        const total = parseInt(numQuestionsElement.value, 10);
        const closed = parseInt(closedQuestionsElement.value, 10);
        const open = parseInt(openQuestionsElement.value, 10);
        
        // Update total
        numQuestionsElement.value = closed + open;
    });
    
    openQuestionsElement.addEventListener('change', () => {
        const total = parseInt(numQuestionsElement.value, 10);
        const closed = parseInt(closedQuestionsElement.value, 10);
        const open = parseInt(openQuestionsElement.value, 10);
        
        // Update total
        numQuestionsElement.value = closed + open;
    });

    // YouTube URL handling
    addYoutubeBtn.addEventListener('click', handleYoutubeUrlAdd);

    // Clipboard text handling
    addClipboardBtn.addEventListener('click', handleClipboardTextAdd);
    
    // Add paste functionality
    pasteTextBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            clipboardTextInput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            showNotification('Не удалось прочитать содержимое буфера обмена. Возможно, ваш браузер не поддерживает эту функцию.', 'error');
        }
    });
    
    // Website content handling
    const websiteUrlInput = document.getElementById('website-url-input');
    const addWebsiteBtn = document.getElementById('add-website-btn');
    
    addWebsiteBtn.addEventListener('click', handleWebsiteUrlAdd);

    // Functions
    function loadSources() {
        fetch('/api/sources')
            .then(response => response.json())
            .then(data => {
                sources = data;
                updateSourcesUI();
            })
            .catch(error => {
                console.error('Error loading sources:', error);
            });
    }

    function updateSourcesUI() {
        sourcesContainer.innerHTML = '';
        sourcesCount.textContent = `${sources.length} источников`;
        selectedSourcesCount.textContent = `${selectedSources.length} источников выбрано`;

        if (sources.length === 0) {
            emptyState.style.display = 'flex';
            initialContent.style.display = 'block';
            chatContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
        }

        // Update selection indicator color based on whether any sources are selected
        if (selectedSources.length > 0) {
            document.getElementById('selected-sources-count').style.color = 'var(--accent-blue)';
        } else {
            document.getElementById('selected-sources-count').style.color = 'var(--text-secondary)';
        }

        sources.forEach(source => {
            const isSelected = selectedSources.includes(source.id);
            const sourceItem = document.createElement('div');
            sourceItem.className = `source-item ${isSelected ? 'selected' : ''}`;
            
            // Determine file type for icon
            const fileType = getFileIconType(source.name);
            let fileIcon = '';
            
            switch(fileType) {
                case 'pdf':
                    fileIcon = `<span class="source-icon pdf-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <text x="12" y="16" font-family="monospace" font-size="7" text-anchor="middle" fill="currentColor">PDF</text>
                        </svg>
                    </span>`;
                    break;
                case 'docx':
                    fileIcon = `<span class="source-icon docx-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <text x="12" y="16" font-family="monospace" font-size="7" text-anchor="middle" fill="currentColor">W</text>
                        </svg>
                    </span>`;
                    break;
                case 'pptx':
                    fileIcon = `<span class="source-icon pptx-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <text x="12" y="16" font-family="monospace" font-size="7" text-anchor="middle" fill="currentColor">P</text>
                        </svg>
                    </span>`;
                    break;
                case 'txt':
                    fileIcon = `<span class="source-icon txt-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="8" y1="13" x2="16" y2="13"></line>
                            <line x1="8" y1="17" x2="16" y2="17"></line>
                        </svg>
                    </span>`;
                    break;
                case 'youtube':
                    fileIcon = `<span class="source-icon" style="color: #FF0000;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon>
                        </svg>
                    </span>`;
                    break;
                case 'website':
                    fileIcon = `<span class="source-icon" style="color: #4071ff;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </span>`;
                    break;
                case 'clipboard':
                    fileIcon = `<span class="source-icon" style="color: #36b37e;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                    </span>`;
                    break;
                default:
                    fileIcon = `<span class="source-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </span>`;
            }
            
            let sourceName = source.name;
            
            // For YouTube sources, add a clickable link
            if (source.type === 'youtube' && source.video_id) {
                sourceName = `
                    <span class="source-name">${source.name}</span>
                    <a href="https://www.youtube.com/watch?v=${source.video_id}" target="_blank" class="youtube-link" onclick="event.stopPropagation();" style="margin-left: 5px; font-size: 0.8em; color: #FF0000;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                `;
            }
            
            // For website sources, add a clickable link
            if (source.type === 'website' && source.url) {
                sourceName = `
                    <span class="source-name">${source.name}</span>
                    <a href="${source.url}" target="_blank" class="website-link" onclick="event.stopPropagation();" style="margin-left: 5px; font-size: 0.8em; color: #4071ff;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                `;
            }
            
            sourceItem.innerHTML = `
                ${fileIcon}
                ${sourceName}
                <div class="checkbox ${isSelected ? 'checked' : ''}" data-source-id="${source.id}">
                    ${isSelected ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </div>
            `;
            
            sourceItem.addEventListener('click', () => {
                toggleSourceSelection(source.id);
            });
            
            sourcesContainer.appendChild(sourceItem);
        });

        updateSelectAllCheckbox();
    }

    function toggleSourceSelection(sourceId) {
        const index = selectedSources.indexOf(sourceId);
        if (index === -1) {
            selectedSources.push(sourceId);
        } else {
            selectedSources.splice(index, 1);
        }
        
        updateSourcesUI();
    }

    function toggleSelectAll() {
        if (allSourcesSelected) {
            selectedSources = [];
        } else {
            selectedSources = sources.map(source => source.id);
        }
        
        allSourcesSelected = !allSourcesSelected;
        updateSourcesUI();
    }

    function updateSelectAllCheckbox() {
        if (sources.length === 0) {
            selectAllCheckbox.classList.remove('checked');
            selectAllCheckbox.innerHTML = '';
            allSourcesSelected = false;
            return;
        }
        
        allSourcesSelected = sources.length === selectedSources.length;
        
        if (allSourcesSelected) {
            selectAllCheckbox.classList.add('checked');
            selectAllCheckbox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else {
            selectAllCheckbox.classList.remove('checked');
            selectAllCheckbox.innerHTML = '';
        }
    }

    function handleFileUpload() {
        if (!fileInput.files.length) return;
        
        const file = fileInput.files[0];
        console.log('Attempting to upload file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Determine file type for appropriate loading message
        const fileType = getFileType(file);
        let loadingMessage = 'Загрузка и анализ файла...';
        
        switch(fileType) {
            case 'pdf':
                loadingMessage = 'Загрузка и извлечение текста из PDF. Это может занять некоторое время...';
                break;
            case 'docx':
                loadingMessage = 'Загрузка и извлечение текста из Word документа...';
                break;
            case 'pptx':
                loadingMessage = 'Загрузка и извлечение текста из PowerPoint презентации...';
                break;
        }
            
        fileUploadArea.innerHTML = `
            <div class="loading"></div>
            <p>${loadingMessage}</p>
            <p class="file-info">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
        `;
        
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Upload response status:', response.status);
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON. Check server logs.');
            }
            
            // Don't try to parse JSON for 204 No Content responses
            if (response.status === 204) {
                return {};
            }
            
            // Handle empty response
            if (response.status !== 200) {
                throw new Error(`Server returned status ${response.status}`);
            }
            
            // Try to parse JSON
            return response.text().then(text => {
                if (!text) {
                    console.error('Empty response from server');
                    throw new Error('Empty response from server');
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Invalid JSON:', text);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .then(data => {
            console.log('Upload success:', data);
            fileModal.style.display = 'none';
            // Reset file input and upload area
            fileInput.value = '';
            fileUploadArea.innerHTML = `
                <div class="file-upload-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </div>
                <p class="file-upload-text">Перетащите файлы сюда или нажмите, чтобы выбрать</p>
                <label for="file-input" class="file-input-label">Выбрать файл</label>
            `;
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'notification success-notification';
            notification.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Файл ${file.name} успешно загружен и обработан</span>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
            
            loadSources();
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            fileUploadArea.innerHTML = `
                <div class="file-upload-icon" style="color: var(--icon-color);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <p class="file-upload-text">Произошла ошибка при загрузке файла</p>
                <p class="error-details">${error.message}</p>
                <label for="file-input" class="file-input-label">Попробовать снова</label>
            `;
        });
    }

    // Helper function to determine file type
    function getFileType(file) {
        const name = file.name.toLowerCase();
        if (name.endsWith('.pdf')) return 'pdf';
        if (name.endsWith('.docx')) return 'docx';
        if (name.endsWith('.pptx')) return 'pptx';
        if (name.endsWith('.txt')) return 'txt';
        if (name.endsWith('.doc')) return 'doc';
        if (name.endsWith('.ppt')) return 'ppt';
        return 'other';
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Check if any sources are selected
        if (selectedSources.length === 0) {
            // Show notification to select sources
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Пожалуйста, выберите хотя бы один источник в левой панели</span>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
            
            // Highlight the source list to draw attention
            document.querySelector('.source-list').classList.add('highlight-pulse');
            setTimeout(() => {
                document.querySelector('.source-list').classList.remove('highlight-pulse');
            }, 2000);
            
            return;
        }

        // Add user message to chat
        addMessageToChat('user', message);
        chatInput.value = '';

        // Show loading state
        const loadingMessage = addMessageToChat('assistant', '...');
        
        // Prepare request data
        const requestData = {
            message: message,
            sources: selectedSources
        };

        // Send message to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove loading message
            loadingMessage.remove();
            
            // Add AI response to chat
            addMessageToChat('assistant', data.message);
            
            // Show chat container and hide initial content
            chatContainer.style.display = 'block';
            initialContent.style.display = 'none';
        })
        .catch(error => {
            console.error('Error sending message:', error);
            loadingMessage.remove();
            addMessageToChat('assistant', 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.');
        });
    }

    function addMessageToChat(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Use marked.js to render Markdown if it's an AI message
        if (type === 'assistant' && text !== '...') {
            // Parse markdown to HTML
            messageContent.innerHTML = marked.parse(text);
            
            // Make links open in new tab
            const links = messageContent.querySelectorAll('a');
            links.forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        } else {
            // For user messages or loading indicator, just use text
            messageContent.textContent = text;
        }
        
        messageDiv.appendChild(messageContent);
        chatContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return messageDiv;
    }

    function generateSummary() {
        // Show loading state
        summaryContent.innerHTML = '<div class="loading"></div><p>Генерация конспекта...</p>';
        
        fetch('/api/summarize')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Parse markdown to HTML
                const renderedContent = marked.parse(data.summary);
                
                // Set the HTML content
                summaryContent.innerHTML = renderedContent;
                
                // Make links open in new tab
                const links = summaryContent.querySelectorAll('a');
                links.forEach(link => {
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                });
            })
            .catch(error => {
                console.error('Error generating summary:', error);
                summaryContent.innerHTML = 'Ошибка при генерации конспекта. Пожалуйста, попробуйте еще раз.';
            });
    }

    function generateTest(numClosedQuestions, numOpenQuestions, difficulty) {
        // Check if any sources are selected
        if (selectedSources.length === 0) {
            // Use all sources for test generation
            console.log("No sources selected, using all available sources");
        } else {
            console.log(`Selected ${selectedSources.length} sources for test generation`);
        }
        
        // Show loading state
        testContent.innerHTML = '<div class="loading"></div><p>Генерация теста на основе выбранных материалов...</p>';
        
        fetch('/api/generate-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                num_closed_questions: parseInt(numClosedQuestions, 10),
                num_open_questions: parseInt(numOpenQuestions, 10),
                difficulty: difficulty,
                sources: selectedSources
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Test generation response:", data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.success || !data.questions || data.questions.length === 0) {
                throw new Error("No questions were generated");
            }
            
            // Format and display test questions
            let testHTML = '<div class="test-questions">';
            data.questions.forEach((question, index) => {
                const questionType = question.type || 'closed'; // Default to closed if not specified
                const source = question.source ? question.source : "";
                
                // Start the question container
                testHTML += `
                    <div class="test-question">
                        <h3>Вопрос ${index + 1}</h3>
                        <p>${question.question}</p>
                        ${source ? `<p class="question-source">Источник: ${source}</p>` : ''}
                `;
                
                if (questionType === 'closed') {
                    // Closed (multiple choice) question
                    const options = Array.isArray(question.options) ? question.options : [];
                    const letters = ['A', 'B', 'C', 'D'];
                    
                    testHTML += `<div class="options">`;
                    
                    // Add each option with its letter
                    options.forEach((option, i) => {
                        if (i < 4) { // Ensure we only use 4 options max
                            testHTML += `
                                <div class="option">
                                    <input type="radio" name="q${index}" id="q${index}o${i}" value="${letters[i]}">
                                    <label for="q${index}o${i}">${letters[i]}. ${option}</label>
                                </div>
                            `;
                        }
                    });
                    
                    testHTML += `</div>
                        <div class="answer-explanation" style="display: none;">
                            <p class="correct-answer"><strong>Правильный ответ:</strong> ${question.correct_answer || 'Не указан'}</p>
                            <div class="explanation"><strong>Объяснение:</strong> ${question.explanation ? marked.parse(question.explanation) : 'Нет объяснения.'}</div>
                        </div>
                        <button class="check-answer-btn">Проверить ответ</button>`;
                } else {
                    // Open-ended question
                    testHTML += `
                        <div class="open-question">
                            <textarea placeholder="Введите ваш ответ здесь..." id="open-answer-${index}"></textarea>
                            <button class="check-answer-btn" data-question-index="${index}">Проверить ответ</button>
                            <div class="open-question-feedback" id="open-feedback-${index}">
                                <h4>Оценка ответа</h4>
                                <div class="open-question-score">
                                    <span>Ваш балл:</span>
                                    <span class="score-value" id="open-score-${index}">-</span>
                                </div>
                                <div class="feedback-content" id="open-feedback-content-${index}"></div>
                            </div>
                        </div>
                        <div class="answer-explanation" style="display: none;">
                            <h4>Образцовый ответ:</h4>
                            <div class="model-answer">${question.model_answer ? marked.parse(question.model_answer) : 'Нет образцового ответа.'}</div>
                            <h4>Критерии оценки:</h4>
                            <div class="evaluation-criteria">${question.evaluation_criteria ? marked.parse(question.evaluation_criteria) : 'Критерии оценки не указаны.'}</div>
                        </div>`;
                }
                
                testHTML += `</div>`;
            });
            
            testHTML += `
                <div class="test-score" style="display: none;">
                    <h3>Результат теста: <span id="score">0</span>/${data.questions.length}</h3>
                </div>
                <button class="btn" id="show-all-answers">Показать все ответы</button>
            `;
            
            testHTML += '</div>';
            
            testContent.innerHTML = testHTML;
            
            // Add event listeners for answer checking
            document.querySelectorAll('.check-answer-btn').forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    const questionDiv = btn.closest('.test-question');
                    const questionType = data.questions[index].type || 'closed';
                    
                    if (questionType === 'closed') {
                        // Handle closed question
                        const selectedOption = questionDiv.querySelector('input[type="radio"]:checked');
                        const answerExplanation = questionDiv.querySelector('.answer-explanation');
                        const correctAnswer = data.questions[index].correct_answer;
                        
                        if (selectedOption) {
                            answerExplanation.style.display = 'block';
                            btn.disabled = true;
                            
                            if (selectedOption.value === correctAnswer) {
                                // Correct answer
                                selectedOption.parentElement.classList.add('correct-option');
                                questionDiv.classList.add('answered-correctly');
                            } else {
                                // Incorrect answer
                                selectedOption.parentElement.classList.add('incorrect-option');
                                questionDiv.querySelectorAll('.option').forEach(opt => {
                                    const optionValue = opt.querySelector('input').value;
                                    if (optionValue === correctAnswer) {
                                        opt.classList.add('correct-option');
                                    }
                                });
                            }
                        } else {
                            alert('Пожалуйста, выберите вариант ответа');
                        }
                    } else {
                        // Handle open question
                        const questionIndex = btn.dataset.questionIndex;
                        const answerText = document.getElementById(`open-answer-${questionIndex}`).value.trim();
                        const feedbackDiv = document.getElementById(`open-feedback-${questionIndex}`);
                        const answerExplanation = questionDiv.querySelector('.answer-explanation');
                        
                        if (!answerText) {
                            alert('Пожалуйста, введите ваш ответ');
                            return;
                        }
                        
                        // Show loading state
                        feedbackDiv.style.display = 'block';
                        document.getElementById(`open-feedback-content-${questionIndex}`).innerHTML = '<div class="loading"></div><p>Оценка ответа...</p>';
                        
                        // Send to API for evaluation
                        fetch('/api/evaluate-answer', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                answer: answerText,
                                question: data.questions[questionIndex]
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.error) {
                                throw new Error(result.error);
                            }
                            
                            const score = result.score;
                            const evaluation = result.evaluation;
                            
                            // Update UI with score and feedback
                            const scoreElement = document.getElementById(`open-score-${questionIndex}`);
                            scoreElement.textContent = score + '/10';
                            
                            // Add class based on score
                            if (score >= 8) {
                                scoreElement.className = 'score-value good-score';
                                questionDiv.classList.add('answered-correctly');
                            } else if (score >= 5) {
                                scoreElement.className = 'score-value medium-score';
                            } else {
                                scoreElement.className = 'score-value bad-score';
                            }
                            
                            // Display evaluation feedback
                            document.getElementById(`open-feedback-content-${questionIndex}`).innerHTML = evaluation ? marked.parse(evaluation) : 'Нет обратной связи.';
                            
                            // Show model answer
                            answerExplanation.style.display = 'block';
                            btn.disabled = true;
                        })
                        .catch(error => {
                            console.error('Error evaluating answer:', error);
                            document.getElementById(`open-feedback-content-${questionIndex}`).innerHTML = 
                                `<p class="error">Ошибка при оценке ответа: ${error.message}</p>`;
                        });
                    }
                });
            });
            
            // Add event listener for showing all answers
            document.getElementById('show-all-answers').addEventListener('click', () => {
                document.querySelectorAll('.test-question').forEach((question, index) => {
                    const answerExplanation = question.querySelector('.answer-explanation');
                    const checkButton = question.querySelector('.check-answer-btn');
                    const questionType = data.questions[index].type || 'closed';
                    
                    answerExplanation.style.display = 'block';
                    checkButton.disabled = true;
                    
                    if (questionType === 'closed') {
                        // For closed questions, highlight correct answers
                        const correctAnswer = data.questions[index].correct_answer;
                        question.querySelectorAll('.option').forEach(opt => {
                            const optionValue = opt.querySelector('input').value;
                            if (optionValue === correctAnswer) {
                                opt.classList.add('correct-option');
                            }
                        });
                    } else {
                        // For open questions, show feedback if not already shown
                        const feedbackDiv = question.querySelector('.open-question-feedback');
                        if (feedbackDiv.style.display !== 'block') {
                            feedbackDiv.style.display = 'block';
                            document.getElementById(`open-score-${index}`).textContent = '-';
                            document.getElementById(`open-feedback-content-${index}`).innerHTML = 
                                '<p>Ответ не был проверен.</p>';
                        }
                    }
                });
                
                // Show score for multiple choice questions
                const answeredCorrectly = document.querySelectorAll('.answered-correctly').length;
                const scoreDiv = document.querySelector('.test-score');
                scoreDiv.style.display = 'block';
                document.getElementById('score').textContent = answeredCorrectly;
            });
        })
        .catch(error => {
            console.error('Error generating test:', error);
            testContent.innerHTML = `
                <div class="error-message">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                        <h3>Ошибка при генерации теста</h3>
                        <p>${error.message || 'Пожалуйста, попробуйте еще раз.'}</p>
                        <button class="btn" onclick="document.getElementById('create-test-btn').click()">Попробовать снова</button>
                    </div>
                </div>
            `;
        });
    }

    // Helper function to determine file icon type
    function getFileIconType(filename) {
        const name = filename.toLowerCase();
        if (name.endsWith('.pdf')) return 'pdf';
        if (name.endsWith('.docx') || name.endsWith('.doc')) return 'docx';
        if (name.endsWith('.pptx') || name.endsWith('.ppt')) return 'pptx';
        if (name.endsWith('.txt')) return 'txt';
        if (name.includes('youtube') || name.includes('video')) return 'youtube';
        if (name.includes('http:') || name.includes('https:') || name.includes('.com') || name.includes('.org') || name.includes('.ru')) return 'website';
        if (name.includes('текст') || name.includes('clipboard') || name.includes('буфер')) return 'clipboard';
        return 'other';
    }

    function handleYoutubeUrlAdd() {
        const youtubeUrl = youtubeUrlInput.value.trim();
        if (!youtubeUrl) {
            showNotification('Пожалуйста, введите URL видео YouTube', 'error');
            return;
        }
        
        // Basic URL validation
        if (!youtubeUrl.includes('youtube.com/watch') && !youtubeUrl.includes('youtu.be/')) {
            showNotification('Пожалуйста, введите корректный URL видео YouTube', 'error');
            return;
        }
        
        // Show loading state
        const youtubeTab = document.getElementById('youtube-upload-tab');
        const originalContent = youtubeTab.innerHTML;
        youtubeTab.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem;">Извлечение транскрипции из видео...</p>
                <p class="file-info" style="margin-top: 0.5rem;">${youtubeUrl}</p>
            </div>
        `;
        
        // Send request to server
        fetch('/api/add-youtube', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                youtube_url: youtubeUrl
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to extract transcript');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('YouTube transcript extracted:', data);
            fileModal.style.display = 'none';
            
            // Reset the YouTube tab content
            youtubeTab.innerHTML = originalContent;
            youtubeUrlInput.value = '';
            
            // Show success notification
            showNotification('Транскрипция YouTube видео успешно добавлена', 'success');
            
            // Reload sources
            loadSources();
        })
        .catch(error => {
            console.error('Error extracting YouTube transcript:', error);
            
            // Reset the YouTube tab with error message
            youtubeTab.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="margin-bottom: 1rem; color: var(--icon-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p style="color: var(--icon-color); margin-bottom: 1rem;">Ошибка при извлечении транскрипции</p>
                    <p class="error-details">${error.message}</p>
                    <button id="retry-youtube-btn" class="file-input-label" style="margin-top: 1rem; background-color: var(--bg-tertiary);">Попробовать снова</button>
                </div>
                <p style="color: var(--text-secondary); text-align: center;">Видео должно иметь субтитры на русском, английском или казахском языке</p>
            `;
            
            // Add event listener to retry button
            document.getElementById('retry-youtube-btn').addEventListener('click', () => {
                youtubeTab.innerHTML = originalContent;
                youtubeUrlInput.value = youtubeUrl;
            });
        });
    }

    function handleClipboardTextAdd() {
        const text = clipboardTextInput.value.trim();
        if (!text) {
            showNotification('Пожалуйста, введите или вставьте текст', 'error');
            return;
        }
        
        // Create source name based on text content
        let sourceName = `Текст (${new Date().toLocaleString()})`;
        
        // Try to extract a title from the first line if it's short enough
        const firstLine = text.split('\n')[0].trim();
        if (firstLine && firstLine.length < 50) {
            sourceName = firstLine;
        }
        
        // Show loading state
        const clipboardTab = document.getElementById('clipboard-upload-tab');
        const originalContent = clipboardTab.innerHTML;
        clipboardTab.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem;">Добавление текста...</p>
            </div>
        `;
        
        // Send request to server
        fetch('/api/add-clipboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                name: sourceName
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to add text');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Clipboard text added:', data);
            fileModal.style.display = 'none';
            
            // Reset the clipboard tab content
            clipboardTab.innerHTML = originalContent;
            clipboardTextInput.value = '';
            
            // Show success notification
            showNotification('Текст успешно добавлен как источник', 'success');
            
            // Reload sources
            loadSources();
        })
        .catch(error => {
            console.error('Error adding clipboard text:', error);
            
            // Reset the clipboard tab with error message
            clipboardTab.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="margin-bottom: 1rem; color: var(--icon-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p style="color: var(--icon-color); margin-bottom: 1rem;">Ошибка при добавлении текста</p>
                    <p class="error-details">${error.message}</p>
                    <button id="retry-clipboard-btn" class="file-input-label" style="margin-top: 1rem; background-color: var(--bg-tertiary);">Попробовать снова</button>
                </div>
            `;
            
            // Add event listener to retry button
            document.getElementById('retry-clipboard-btn').addEventListener('click', () => {
                clipboardTab.innerHTML = originalContent;
                clipboardTextInput.value = text;
            });
        });
    }

    function handleWebsiteUrlAdd() {
        const websiteUrl = websiteUrlInput.value.trim();
        if (!websiteUrl) {
            showNotification('Пожалуйста, введите URL веб-страницы', 'error');
            return;
        }
        
        // Basic URL validation
        let url = websiteUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        // Show loading state
        const websiteTab = document.getElementById('website-upload-tab');
        const originalContent = websiteTab.innerHTML;
        websiteTab.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem;">Извлечение содержимого веб-страницы...</p>
                <p class="file-info" style="margin-top: 0.5rem;">${url}</p>
            </div>
        `;
        
        // Send request to server
        fetch('/api/add-website', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Failed to extract website content');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Website content extracted:', data);
            fileModal.style.display = 'none';
            
            // Reset the website tab content
            websiteTab.innerHTML = originalContent;
            websiteUrlInput.value = '';
            
            // Show success notification
            showNotification('Содержимое веб-страницы успешно добавлено', 'success');
            
            // Reload sources
            loadSources();
        })
        .catch(error => {
            console.error('Error extracting website content:', error);
            
            // Reset the website tab with error message
            websiteTab.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="margin-bottom: 1rem; color: var(--icon-color);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p style="color: var(--icon-color); margin-bottom: 1rem;">Ошибка при извлечении содержимого веб-страницы</p>
                    <p class="error-details">${error.message}</p>
                    <button id="retry-website-btn" class="file-input-label" style="margin-top: 1rem; background-color: var(--bg-tertiary);">Попробовать снова</button>
                </div>
                <p style="color: var(--text-secondary); text-align: center;">Убедитесь, что URL корректен и страница доступна</p>
            `;
            
            // Add event listener to retry button
            document.getElementById('retry-website-btn').addEventListener('click', () => {
                websiteTab.innerHTML = originalContent;
                websiteUrlInput.value = websiteUrl;
            });
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}-notification`;
        notification.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});