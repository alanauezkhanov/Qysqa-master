# Qysqa.kz - Intelligent Educational Platform

Qysqa.kz is an intelligent educational platform that helps students effectively prepare for exams through AI-powered note generation and test creation.

## Features

- 🤖 AI-powered content analysis and generation
- 📝 Automatic note creation from lecture materials
- ✍️ Test generation with various question formats
- 💬 Interactive chat interface
- 📊 Real-time monitoring and analytics
- 🔄 Automated CI/CD pipeline

## Tech Stack

- **Backend**: Python + Flask
- **Frontend**: HTML, CSS, JavaScript
- **AI Integration**: Google Gemini AI
- **Database**: Redis
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

## Prerequisites

- Docker and Docker Compose
- Python 3.9+
- Git

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/qysqa.git
cd qysqa
```

2. Build and run the containers:
```bash
docker-compose up --build
```

3. Access the services:
- Main Application: http://localhost:8080
- Grafana Dashboards: http://localhost:3000 (admin/admin)
- Prometheus Metrics: http://localhost:9090

## Project Structure

```
qysqa/
├── app.py              # Main Flask application
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Multi-container setup
├── nginx.conf         # Nginx configuration
├── prometheus.yml     # Prometheus configuration
├── requirements.txt   # Python dependencies
└── .github/
    └── workflows/     # CI/CD configurations
```

## Container Architecture

- **Web**: Flask application container
- **Redis**: Caching and session management
- **Nginx**: Reverse proxy
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization

## Development

1. Set up a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
flask run
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **Test**: Runs automated tests
2. **Build**: Creates Docker images
3. **Deploy**: Deploys to production server

## Monitoring

The platform includes comprehensive monitoring:

- Application performance metrics
- Redis cache usage
- System resource utilization
- Request/response statistics

Access monitoring dashboards:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

## Security

- Non-root user in containers
- Secure configuration for services
- Environment variable management
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please open an issue in the GitHub repository.

![My Canva Image](https://media.canva.com/v2/image-resize/format:PNG/height:257/quality:100/uri:ifs%3A%2F%2F%2Ff23bc718-a9d7-46f4-b167-2ca70dcca45e/watermark:F/width:550?csig=AAAAAAAAAAAAAAAAAAAAAJwKH9XS3dzMvlYQJmQenmr7kjj45G3VyRIJphDq7jHL&exp=1746340438&osig=AAAAAAAAAAAAAAAAAAAAAEGacjdFOv7IhJOJcO7wTqEQzWcRqeWRnyNTR_t0RiIz&signer=media-rpc&x-canva-quality=thumbnail_large)


Отчёт о проделанной работе по проекту Qysqa.kz – Учитесь эффективно
В рамках участия в хакатоне был разработан начальный прототип интеллектуальной образовательной платформы Qysqa.kz, которая помогает студентам эффективно готовиться к экзаменам. Основной акцент сделан на автоматизацию создания конспектов и тестов с использованием искусственного интеллекта.

Выполнено:
Интерфейс и структура платформы:

Разработан прототип веб-интерфейса с использованием HTML, CSS и Flask.

Реализована навигация по разделам: Чат, Конспект, Тест, что соответствует ключевым функциям платформы.

Внедрён модуль загрузки файлов (лекционных материалов), которые в дальнейшем будут анализироваться ИИ.

Интеграция искусственного интеллекта:

Для обработки и генерации учебного контента использован Gemini AI от Google:

Анализ загруженных текстов.

Автоматическая генерация ключевых понятий и кратких конспектов.

Формирование тестовых вопросов разных форматов.

UI/UX-дизайн:

Реализована тёмная тема оформления с минималистичным и понятным интерфейсом.

Добавлены инструкции для пользователя на главном экране и кнопки действий: "Добавить материал", "Тест" и пр.

Интерфейс адаптирован под будущую реализацию личного кабинета преподавателя и студента.

Стек технологий:

Backend: Python + Flask.

Frontend: HTML, CSS, JavaScript (планируется добавление интерактивных элементов).

AI-интеграция: Gemini AI API для обработки текстов и генерации образовательного контента.
