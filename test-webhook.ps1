# TESTE DO WEBHOOK - Execute este script para testar
# Primeiro, atualize a URL abaixo com a URL do seu webhook

$webhookUrl = "$env:VITE_SUPABASE_URL/functions/v1/whatsapp-webhook"

Write-Host "Testando webhook: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

$body = Get-Content "test-webhook.json" -Raw

try {
    $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ SUCESSO!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ ERRO!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Mensagem: $($_.Exception.Message)"
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalhes:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
