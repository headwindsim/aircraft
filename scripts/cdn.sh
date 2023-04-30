#!/bin/bash

CDN_URL="https://worker.headwindsim.net"
CDN_PURGE_LINK="https://worker.headwindsim.net/purgeCache"
CDN_DIR=${1:-"addons/a339x/test-3"}
LOCAL_DIR=${2:-"./build-modules"}

MAX_RETRY=5

upload () {
    DEST="$CDN_URL/$CDN_DIR/$(basename -- "$1")"
    echo "Syncing file: $1"
    echo "Destination: $DEST"

    # Try to upload the file up to MAX_RETRY times before failing
    counter=0
    until curl --fail -X PUT -H "X-HDW-Access-Key: $CLOUDFLARE_WORKER_PASSWORD" -T "$1" "$DEST"
    do
        sleep 1
        [[ counter -eq $MAX_RETRY ]] && echo "Failed to upload file '$1'" >&2 && exit 1
        echo "Trying again. Try #$counter"
        ((counter++))
    done
    echo ""; echo ""
}

# Upload all files
for FILE in "${LOCAL_DIR}"/*; do
    upload "$FILE"
done

# Purge after all uploads that the files are somewhat in sync
echo "Purging cache"
curl -X GET -H "X-HDW-Access-Key: $CLOUDFLARE_WORKER_PASSWORD" -H "Content-Length: 0" "$CDN_PURGE_LINK"
