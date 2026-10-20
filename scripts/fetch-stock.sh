#!/usr/bin/env bash
# One-off: downloads the 4 Adobe Stock images licensed on 20 Oct 2026 into
# media/stock/. The links are pre-signed and expire one hour after licensing;
# if they've expired, ask Claude to refresh them (re-requesting a licensed
# asset doesn't spend another credit).
set -u
cd "$(dirname "$0")/.."
mkdir -p media/stock
ok=0; fail=0
dl() {
  if curl -fsSL --max-time 120 -o "media/stock/$1" "$2"; then ok=$((ok+1)); echo "✓ $1"; else fail=$((fail+1)); echo "✗ $1"; rm -f "media/stock/$1"; fi
}
dl fresh-sausage-rolls-board-adobe-124155825.jpg "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/298d77df1de87702a4f1de4eafc4266aa937ad9d8d5d598e6861977eaf93d104.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_124155825.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20261020%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20261020T214245Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=efc0dc958999b2c05757e6a18ffc32c9db0e37f0c5c306a1b7d2c846256ff2e1"
dl range-sausage-rolls-tray-adobe-232095480.jpg "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/3100f8837346693e21b497ba94f1949be7de9f63167b53d2edb4fef3b30b0366.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_232095480.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20261020%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20261020T214253Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=2b7e0fa27a4aa9ef95844eebdc9c0e9081542662e12c062d55868e08fd440203"
dl hero-full-english-pan-adobe-2170530120.jpg "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/7c92dc9fe8d1d124b21ea0213471fab145c076ee0e7e03f75be3cdd4e9196299.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_2170530120.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20261020%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20261020T214259Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=500c7ec9f7d216a29a84c9d0a8a2eba2ab509bc0d2a5ac5836f46d54ebfbbadf"
dl fresh-full-english-plates-adobe-50355236.jpg "https://stock-apex-images-prod-ew1.s3.eu-west-1.amazonaws.com/718208eae651151873a76694e080f3588c825dc9cfc40fa42875e5484661bb2b.jpg?response-content-disposition=attachment%3B%20filename%3D%22AdobeStock_50355236.jpeg%22&response-content-type=image%2Fjpeg&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAUMGGMQGERDWXM64M%2F20261020%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20261020T214302Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=25e7228206b40751665db0202d0cf878b7b57b57e2f5b41b9069dd555299a285"
echo "Downloaded $ok, failed $fail"
