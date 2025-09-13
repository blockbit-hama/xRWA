#!/bin/bash

# xRWA Platform Start Script
# Backend: Port 8000
# Frontend: Port 8001

echo "🚀 Starting xRWA Platform..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Function to start backend
start_backend() {
    echo "📦 Starting Backend (Port 8000)..."
    cd back
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        npm install
    fi
    
    # Set port environment variable
    export PORT=8000
    
    # Start backend in background
    npm run start:dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    echo "✅ Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🌐 Starting Frontend (Port 8001)..."
    cd front
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        npm install
    fi
    
    # Set port environment variable
    export PORT=8001
    
    # Start frontend in background
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    echo "✅ Frontend started with PID: $FRONTEND_PID"
    cd ..
}

# Function to stop all services
stop_services() {
    echo "🛑 Stopping all services..."
    
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            kill $BACKEND_PID
            echo "✅ Backend stopped (PID: $BACKEND_PID)"
        fi
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            kill $FRONTEND_PID
            echo "✅ Frontend stopped (PID: $FRONTEND_PID)"
        fi
        rm -f logs/frontend.pid
    fi
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    echo "=================="
    
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            echo "✅ Backend: Running (PID: $BACKEND_PID) - http://localhost:8000"
        else
            echo "❌ Backend: Not running"
        fi
    else
        echo "❌ Backend: Not running"
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            echo "✅ Frontend: Running (PID: $FRONTEND_PID) - http://localhost:8001"
        else
            echo "❌ Frontend: Not running"
        fi
    else
        echo "❌ Frontend: Not running"
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Recent Logs:"
    echo "==============="
    
    if [ -f "logs/backend.log" ]; then
        echo "🔧 Backend Logs (last 20 lines):"
        tail -20 logs/backend.log
        echo ""
    fi
    
    if [ -f "logs/frontend.log" ]; then
        echo "🌐 Frontend Logs (last 20 lines):"
        tail -20 logs/frontend.log
        echo ""
    fi
}

# Create logs directory
mkdir -p logs

# Parse command line arguments
case "$1" in
    "start")
        echo "🚀 Starting xRWA Platform..."
        
        # Check ports
        if ! check_port 8000; then
            echo "❌ Cannot start backend - port 8000 is in use"
            exit 1
        fi
        
        if ! check_port 8001; then
            echo "❌ Cannot start frontend - port 8001 is in use"
            exit 1
        fi
        
        # Start services
        start_backend
        sleep 3
        start_frontend
        
        echo ""
        echo "🎉 xRWA Platform started successfully!"
        echo "📊 Backend API: http://localhost:8000"
        echo "🌐 Frontend: http://localhost:8001"
        echo ""
        echo "💡 Use './start.sh status' to check service status"
        echo "💡 Use './start.sh logs' to view logs"
        echo "💡 Use './start.sh stop' to stop services"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        $0 start
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    *)
        echo "xRWA Platform Management Script"
        echo "=============================="
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start backend (8000) and frontend (8001)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show service status"
        echo "  logs    - Show recent logs"
        echo ""
        echo "Services:"
        echo "  Backend API: http://localhost:8000"
        echo "  Frontend:    http://localhost:8001"
        echo ""
        ;;
esac