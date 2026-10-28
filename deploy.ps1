# Manual production deploy to Netlify (podxdubai@gmail.com account).
# First run creates and links the site; later runs just rebuild and redeploy.
# Usage: powershell -ExecutionPolicy Bypass -File deploy.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$name = 'relxpods-guide'

if (-not (Test-Path '.netlify\state.json')) {
  Write-Host "Creating Netlify site '$name' in team pod-x..."
  netlify sites:create --name $name --account-slug pod-x
  if ($LASTEXITCODE -ne 0) { throw 'Site creation failed. If the name is taken, edit $name in deploy.ps1 and run again.' }
}

$siteId = (Get-Content '.netlify\state.json' -Raw | ConvertFrom-Json).siteId
$site = netlify api getSite --data "{\""site_id\"":\""$siteId\""}" | ConvertFrom-Json
$env:SITE_URL = $site.ssl_url
Write-Host "Site: $($site.name)  URL: $($env:SITE_URL)"

npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build or QA failed; nothing was deployed.' }

netlify deploy --prod --dir dist --no-build --message 'Manual deploy from CLI'
if ($LASTEXITCODE -ne 0) { throw 'Deploy failed.' }
Write-Host ''
Write-Host "Live at $($env:SITE_URL)"
