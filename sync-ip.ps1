# Automatically detects active Wi-Fi IPv4 address and sets REACT_NATIVE_PACKAGER_HOSTNAME
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and 
    $_.InterfaceAlias -notlike "*vEthernet*" 
} | Select-Object -ExpandProperty IPAddress -First 1)

if (-not $ip) {
    Write-Warning "Could not detect active LAN IP. Using 192.168.31.43"
    $ip = "192.168.31.43"
}

Write-Host "Setting Metro Packager Host IP to: $ip" -ForegroundColor Green

Set-Content -Path "apps/user-app/.env.local" -Value "REACT_NATIVE_PACKAGER_HOSTNAME=$ip"
Set-Content -Path "apps/vendor-app/.env.local" -Value "REACT_NATIVE_PACKAGER_HOSTNAME=$ip"

Write-Host "Updated apps/user-app/.env.local and apps/vendor-app/.env.local successfully!" -ForegroundColor Cyan
