# Rodistaa Platform - Development Startup Script (Windows PowerShell)
# Starts all services for local development

Write-Host "`n🚀 Starting Rodistaa Platform (Local Development)" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop"
    exit 1
}

# Start services
Write-Host "Starting services with docker-compose..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services
Write-Host "`nWaiting for services to be ready...`n" -ForegroundColor Yellow

# Wait for Backend
Write-Host "Backend API: " -NoNewline
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " Ready ✅" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

# Wait for ACS
Write-Host "ACS Service: " -NoNewline
for ($i = 1; $i -le 20; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host " Ready ✅" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

# Wait for Portal
Write-Host "Portal: " -NoNewline
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        Write-Host " Ready ✅" -ForegroundColor Green
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "✅ All services are running!" -ForegroundColor Green
Write-Host "==================================================`n" -ForegroundColor Green

Write-Host "Services:"
Write-Host "  🔧 Backend API:    http://localhost:4000"
Write-Host "  🛡️  ACS Service:    http://localhost:5000"
Write-Host "  🌐 Admin Portal:   http://localhost:3001"
Write-Host "  📊 API Docs:       http://localhost:4000/docs"
Write-Host "  🗄️  PostgreSQL:     localhost:5432"
Write-Host "  📦 Redis:          localhost:6379`n"

Write-Host "Test Credentials:"
Write-Host "  Phone: 9876543210"
Write-Host "  OTP: 123456 (mock)`n"

Write-Host "To stop services:"
Write-Host "  docker-compose down`n"

Write-Host "To view logs:"
Write-Host "  docker-compose logs -f [service-name]`n"

Write-Host "Happy coding! 🚀`n" -ForegroundColor Green

