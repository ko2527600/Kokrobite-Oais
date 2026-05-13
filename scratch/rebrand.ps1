
$replacements = @{
    "Cookers Delight" = "Kokrobite Oasis"
    "CD Boat" = "KO Eats"
    "CD Admin" = "KO Admin"
    "cd_admin_token" = "ko_admin_token"
    "cd_admin_user" = "ko_admin_user"
    "cd_customer_token" = "ko_customer_token"
    "cd_customer_user" = "ko_customer_user"
    "cd_admin_installed" = "ko_admin_installed"
    "#EC4824" = "#F97316"
    "#872735" = "#1C0A00"
    "Cormorant Garamond" = "Playfair Display"
    "Syne" = "Plus Jakarta Sans"
    "Great Foods. Great People." = "beach bliss. good food. pure vibes"
    "cookersdelight" = "kokrobiteoasis"
    "233243379412" = "UPDATE_WITH_REAL_KO_WHATSAPP"
}

$excludeDirs = @("node_modules", ".git", "dist", ".gemini", "brain", "scratch")
$excludeFiles = @("package-lock.json", "rebrand.ps1")

function Replace-In-Files {
    param (
        [string]$Path
    )

    Get-ChildItem -Path $Path -Recurse -File | Where-Object {
        $filePath = $_.FullName
        $isExcluded = $false
        foreach ($dir in $excludeDirs) {
            if ($filePath -like "*\$dir\*") {
                $isExcluded = $true
                break
            }
        }
        if (-not $isExcluded) {
            foreach ($file in $excludeFiles) {
                if ($_.Name -eq $file) {
                    $isExcluded = $true
                    break
                }
            }
        }
        -not $isExcluded
    } | ForEach-Object {
        $file = $_.FullName
        $content = Get-Content -Path $file -Raw -ErrorAction SilentlyContinue
        if ($null -ne $content) {
            $modified = $false
            foreach ($key in $replacements.Keys) {
                if ($content -contains $key -or $content.Contains($key)) {
                    $content = $content.Replace($key, $replacements[$key])
                    $modified = $true
                }
            }
            if ($modified) {
                Set-Content -Path $file -Value $content -NoNewline
                Write-Host "Updated: $file"
            }
        }
    }
}

Replace-In-Files -Path "c:\Dev\WORK\kokrobite-oasis"
