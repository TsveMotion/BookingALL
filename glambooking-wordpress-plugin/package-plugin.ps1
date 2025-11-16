# Package GlamBooking WordPress Plugin
# Creates a ZIP file ready for distribution

Write-Host "📦 Packaging GlamBooking WordPress Plugin..." -ForegroundColor Cyan

# Set plugin directory
$pluginDir = $PSScriptRoot
$outputDir = Join-Path $pluginDir "..\public\wordpress"
$zipFile = Join-Path $outputDir "glambooking-plugin.zip"

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Remove old ZIP if exists
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Write-Host "✓ Preparing files..." -ForegroundColor Green

# Create temporary directory for packaging
$tempDir = Join-Path $env:TEMP "glambooking-plugin"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Define files/folders to include
$includes = @(
    "glambooking.php",
    "readme.txt",
    "includes",
    "admin",
    "public"
)

# Copy files to temp directory
foreach ($item in $includes) {
    $source = Join-Path $pluginDir $item
    $dest = Join-Path $tempDir $item
    
    if (Test-Path $source) {
        if ((Get-Item $source).PSIsContainer) {
            Copy-Item -Path $source -Destination $dest -Recurse -Force
        } else {
            Copy-Item -Path $source -Destination $dest -Force
        }
        Write-Host "  → Copied $item" -ForegroundColor Gray
    }
}

Write-Host "✓ Creating ZIP archive..." -ForegroundColor Green

# Create ZIP file
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

# Get file size
$fileSize = (Get-Item $zipFile).Length / 1KB
$fileSizeFormatted = "{0:N2}" -f $fileSize

Write-Host ""
Write-Host "✅ Plugin packaged successfully!" -ForegroundColor Green
Write-Host "📍 Location: $zipFile" -ForegroundColor Cyan
Write-Host "📊 Size: $fileSizeFormatted KB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload to https://book.glambooking.co.uk/wordpress/" -ForegroundColor White
Write-Host "2. Test download from GlamBooking settings page" -ForegroundColor White
Write-Host "3. Install on test WordPress site" -ForegroundColor White
