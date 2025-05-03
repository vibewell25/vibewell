#!/bin/bash

echo "Setting up A/B testing and user analytics..."

# Create analytics configuration
cat > config/analytics-config.json << EOL
{
  "analytics": {
    "enabled": true,
    "tracking": {
      "pageViews": true,
      "userActions": true,
      "performance": true,
      "errors": true
    },
    "a_b_testing": {
      "enabled": true,
      "variants": {
        "control": 50,
        "variant_a": 25,
        "variant_b": 25
      }
    },
    "metrics": {
      "conversionRate": true,
      "bounceRate": true,
      "timeOnPage": true,
      "clickThroughRate": true
    }
  }
}
EOL

# Create analytics tracking script
cat > scripts/track-analytics.sh << EOL
#!/bin/bash

# Function to assign user to A/B test variant
assign_variant() {
  random=\$((RANDOM % 100))
  if [ \$random -lt 50 ]; then
    echo "control"
  elif [ \$random -lt 75 ]; then
    echo "variant_a"
  else
    echo "variant_b"
  fi
}

# Track user session
track_session() {
  user_id=\$1
  variant=\$(assign_variant)
  timestamp=\$(date +"%Y-%m-%d %H:%M:%S")
  
  echo "[\$timestamp] User \$user_id assigned to \$variant" >> logs/analytics/sessions.log
}

# Track user action
track_action() {
  user_id=\$1
  action=\$2
  timestamp=\$(date +"%Y-%m-%d %H:%M:%S")
  
  echo "[\$timestamp] User \$user_id performed action: \$action" >> logs/analytics/actions.log
}

# Track performance metrics
track_performance() {
  user_id=\$1
  metric=\$2
  value=\$3
  timestamp=\$(date +"%Y-%m-%d %H:%M:%S")
  
  echo "[\$timestamp] User \$user_id - \$metric: \$value" >> logs/analytics/performance.log
}

# Create analytics directories
mkdir -p logs/analytics

echo "Analytics setup complete"
EOL

chmod +x scripts/track-analytics.sh

echo "A/B testing and analytics setup complete" 