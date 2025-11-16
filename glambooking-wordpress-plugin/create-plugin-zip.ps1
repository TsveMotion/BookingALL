# Create WordPress Plugin ZIP
Write-Host "Creating GlamBooking WordPress Plugin ZIP..." -ForegroundColor Cyan

$pluginName = "glambooking"
$zipPath = Join-Path $PSScriptRoot "$pluginName.zip"

# Remove existing zip
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Removed existing ZIP file" -ForegroundColor Yellow
}

# Create temp directory
$tempDir = Join-Path $env:TEMP $pluginName
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy plugin files
$filesToCopy = @(
    "glambooking.php",
    "readme.txt",
    "admin",
    "includes",
    "public"
)

foreach ($item in $filesToCopy) {
    $source = Join-Path $PSScriptRoot $item
    $dest = Join-Path $tempDir $item
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "  Copied: $item" -ForegroundColor Green
    } else {
        Write-Host "  Missing: $item" -ForegroundColor Red
    }
}

# Create ZIP
Write-Host "`nCreating ZIP archive..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Cleanup
Remove-Item $tempDir -Recurse -Force

# Show result
if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1KB
    Write-Host "`n✓ Plugin ZIP created successfully!" -ForegroundColor Green
    Write-Host "  Location: $zipPath" -ForegroundColor White
    Write-Host "  Size: $([math]::Round($size, 2)) KB" -ForegroundColor White
} else {
    Write-Host "`n✗ Failed to create ZIP file" -ForegroundColor Red
}
