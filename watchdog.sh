#!/bin/bash
# Watchdog: monitors subagent file changes, retries if no change after timeout
TASK_NAME="$1"
FILE_PATH="$2"
TIMEOUT_SEC="${3:-120}"
MAX_RETRIES="${4:-3}"

RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    echo "🐕 Watchdog: Attempt $((RETRY+1))/$MAX_RETRIES for $TASK_NAME"
    
    # Record file hash before
    BEFORE=$(md5sum "$FILE_PATH" 2>/dev/null | cut -d' ' -f1)
    
    # Signal subagent task (write task file)
    echo "$TASK_NAME" > "/tmp/watchdog-task-$TASK_NAME"
    
    # Wait for file change
    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT_SEC ]; do
        sleep 5
        ELAPSED=$((ELAPSED+5))
        AFTER=$(md5sum "$FILE_PATH" 2>/dev/null | cut -d' ' -f1)
        if [ "$BEFORE" != "$AFTER" ]; then
            echo "✅ Watchdog: File changed after ${ELAPSED}s!"
            rm -f "/tmp/watchdog-task-$TASK_NAME"
            exit 0
        fi
        echo "⏳ Watchdog: Waiting... ${ELAPSED}s/${TIMEOUT_SEC}s"
    done
    
    echo "⚠️ Watchdog: Timeout! Retrying..."
    RETRY=$((RETRY+1))
done

echo "❌ Watchdog: All retries exhausted!"
rm -f "/tmp/watchdog-task-$TASK_NAME"
exit 1
