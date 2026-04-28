$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot 'config.js'
if (!(Test-Path $configPath)) {
    Write-Error "config.js not found at $configPath"
    exit 1
}

$configText = Get-Content -Raw -Path $configPath
$cloudMatch = [regex]::Match($configText, "cloudName\s*:\s*'([^']+)'")
$presetMatch = [regex]::Match($configText, "uploadPreset\s*:\s*'([^']*)'")
$signatureEndpointMatch = [regex]::Match($configText, "signatureEndpoint\s*:\s*'([^']*)'")

if (!$cloudMatch.Success) {
    Write-Error 'Could not read cloudName from config.js'
    exit 1
}

$cloudName = $cloudMatch.Groups[1].Value
$uploadPreset = if ($presetMatch.Success) { $presetMatch.Groups[1].Value } else { '' }
$signatureEndpoint = if ($signatureEndpointMatch.Success -and $signatureEndpointMatch.Groups[1].Value) { $signatureEndpointMatch.Groups[1].Value } else { '/api/cloudinary/signature' }

$allowed = @('.jpg', '.jpeg', '.png', '.webp', '.gif')
$images = Get-ChildItem -Path $PSScriptRoot -File | Where-Object { $allowed -contains $_.Extension.ToLower() }

if (-not $images -or $images.Count -eq 0) {
    Write-Error 'No image files found in project root.'
    exit 1
}

$selectedImage = Get-Random -InputObject $images
$endpoint = "https://api.cloudinary.com/v1_1/$cloudName/image/upload"

Write-Output "Testing Cloudinary upload"
Write-Output "Cloud: $cloudName"
Write-Output "Image: $($selectedImage.Name)"
Write-Output "Upload endpoint: $endpoint"

$signatureApiUrl = $signatureEndpoint
if ($signatureApiUrl.StartsWith('/')) {
    $signatureApiUrl = "http://127.0.0.1:8081$signatureApiUrl"
}

$didSignedAttempt = $false
try {
    Write-Output "Requesting signature from: $signatureApiUrl"
    $signatureResponse = Invoke-RestMethod -Method POST -Uri $signatureApiUrl -ContentType 'application/json' -Body (@{ cloudName = $cloudName } | ConvertTo-Json)
    if ($signatureResponse.signature -and $signatureResponse.timestamp -and $signatureResponse.apiKey) {
        $didSignedAttempt = $true
        Write-Output 'Using signed upload mode.'
        $response = curl.exe -s -X POST `
            -F "file=@$($selectedImage.FullName)" `
            -F "api_key=$($signatureResponse.apiKey)" `
            -F "timestamp=$($signatureResponse.timestamp)" `
            -F "signature=$($signatureResponse.signature)" `
            $endpoint

        $json = $response | ConvertFrom-Json
        if ($json.secure_url) {
            Write-Output 'SUCCESS: Signed upload completed.'
            Write-Output "secure_url: $($json.secure_url)"
            if ($json.public_id) { Write-Output "public_id: $($json.public_id)" }
            exit 0
        }

        if ($json.error -and $json.error.message) {
            Write-Output 'FAILED: Signed upload rejected.'
            Write-Output "error: $($json.error.message)"
            exit 2
        }
    }
} catch {
    Write-Output "Signed upload unavailable: $($_.Exception.Message)"
}

if ($uploadPreset) {
    Write-Output "Trying unsigned fallback preset: $uploadPreset"
    $response = curl.exe -s -X POST -F "file=@$($selectedImage.FullName)" -F "upload_preset=$uploadPreset" $endpoint
    $json = $response | ConvertFrom-Json

    if ($json.secure_url) {
        Write-Output 'SUCCESS: Unsigned upload completed.'
        Write-Output "secure_url: $($json.secure_url)"
        if ($json.public_id) { Write-Output "public_id: $($json.public_id)" }
        exit 0
    }

    if ($json.error -and $json.error.message) {
        Write-Output 'FAILED: Unsigned upload rejected.'
        Write-Output "error: $($json.error.message)"
        exit 2
    }
}

if (-not $didSignedAttempt -and -not $uploadPreset) {
    Write-Output 'FAILED: No signed upload available and no unsigned preset configured.'
    exit 2
}

Write-Output 'Unknown response state.'
exit 3
