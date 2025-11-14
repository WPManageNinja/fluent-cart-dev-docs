#!/bin/bash
# Script to test API endpoints and save responses

BASE_URL="https://cart.junior.ninja/wp-json/fluent-cart/v2"
AUTH="$(echo -n 'fluentcart:gPai 6yhG Kp4u ezOe 7VkQ Ucjw' | base64)"
OUTPUT_DIR="/tmp/api-responses"

mkdir -p "$OUTPUT_DIR"

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local output_file=$4
    
    echo "Testing $method $endpoint..."
    
    if [ "$method" = "GET" ]; then
        curl -X GET "${BASE_URL}${endpoint}" \
            -H "Authorization: Basic ${AUTH}" \
            -H "Content-Type: application/json" \
            -s | python3 -m json.tool > "$output_file" 2>&1
    elif [ "$method" = "POST" ]; then
        curl -X POST "${BASE_URL}${endpoint}" \
            -H "Authorization: Basic ${AUTH}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -s | python3 -m json.tool > "$output_file" 2>&1
    elif [ "$method" = "PUT" ]; then
        curl -X PUT "${BASE_URL}${endpoint}" \
            -H "Authorization: Basic ${AUTH}" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -s | python3 -m json.tool > "$output_file" 2>&1
    elif [ "$method" = "DELETE" ]; then
        curl -X DELETE "${BASE_URL}${endpoint}" \
            -H "Authorization: Basic ${AUTH}" \
            -H "Content-Type: application/json" \
            -s | python3 -m json.tool > "$output_file" 2>&1
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Saved to $output_file"
        head -50 "$output_file"
    else
        echo "❌ Failed"
    fi
    echo ""
}

# Test specific endpoint
if [ $# -ge 2 ]; then
    test_endpoint "$1" "$2" "$3" "$OUTPUT_DIR/$(echo $2 | tr '/' '_').json"
else
    echo "Usage: $0 METHOD ENDPOINT [DATA]"
    echo "Example: $0 GET /orders?page=1&per_page=2"
    echo "Example: $0 POST /orders '{\"key\":\"value\"}'"
fi

