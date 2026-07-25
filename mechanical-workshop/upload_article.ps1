$articlePath = "articles/2026-07-24-pp-honeycomb-board-production-line-complete-guide-to-automated-extrusion-forming-automotive-interior-applications.html"
$content = Get-Content $articlePath -Raw
$bytes = [Text.Encoding]::UTF8.GetBytes($content)
$base64 = [Convert]::ToBase64String($bytes)

Write-Host "File content length: $($content.Length)"
Write-Host "Base64 length: $($base64.Length)"

# Save base64 to file for reference
$base64 | Out-File "article_base64.txt" -Encoding utf8
Write-Host "Base64 saved to article_base64.txt"