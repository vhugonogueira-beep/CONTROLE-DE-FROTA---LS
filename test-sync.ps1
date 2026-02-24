# =========================
# CONFIGURAÇÃO
# =========================

$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaXp0YXpqcnV4dWp3d3V1cGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODIyNjEsImV4cCI6MjA4NTY1ODI2MX0.lPayB7cqM4yqvnAd5PsJ44DUWTnIu1nUwkEIaY9JMcA"
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $anonKey"
}

$webhookUrl = "https://hqiztazjruxujwwuupfq.supabase.co/functions/v1/whatsapp-webhook"

# =========================
# PAYLOAD DE TESTE
# =========================

$mensagem = "CONTROLE DE FROTA`nSTATUS: AGENDAMENTO`nID: V002`nPLACA: TVQ3F00`nMODELO: CD EX MF`n`nDATA INICIAL: 07/02/2026`nHORÁRIO INICIAL: 17:00`n`nDATA FINAL: 10/02/2026`nHORÁRIO FINAL: `n`nDESTINO: SANTA IZABEL`n`nKM INICIAL: `nKM FINAL: `n`nRESPONSAVEL: CARLA/ARIANE`nAREA: LICENCIAMENTO`nATIVIDADE: VISITA EM ORGAO PUBLICO`nPROJETO: GERAL`n`nNECESSARIO LAVAGEM?: `nLAVAGEM REALIZADA: `nTANQUE NA DEVOLUÇÃO: `nHOUVE ABASTECIMENTO: `nNECESSARIO ABASTECER:`n`nESTACIONADO: -1"

$body = @{
    message = $mensagem
} | ConvertTo-Json

# =========================
# ENVIO
# =========================

Write-Host "Enviando teste para $webhookUrl..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri $webhookUrl `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "RESPOSTA DO SERVIDOR:" -ForegroundColor Green
    $response | ConvertTo-Json
}
catch {
    Write-Host "ERRO NO TESTE:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.ErrorDetails) { $_.ErrorDetails.Message }
}
