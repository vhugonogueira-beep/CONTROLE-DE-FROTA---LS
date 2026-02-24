# Configuração
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaXp0YXpqcnV4dWp3d3V1cGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODIyNjEsImV4cCI6MjA4NTY1ODI2MX0.lPayB7cqM4yqvnAd5PsJ44DUWTnIu1nUwkEIaY9JMcA"
$url = "https://hqiztazjruxujwwuupfq.supabase.co/rest/v1/fleet_records"

$headers = @{
    "apikey"        = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type"  = "application/json"
    "Prefer"        = "return=representation"
}

# Tenta inserir um registro com a coluna raw_message
$body = @{
    veiculo         = "DIAGNOSTIC_TEST"
    status          = "agendado"
    data_inicial    = "2026-02-04"
    horario_inicial = "12:00"
    responsavel     = "TESTER"
    raw_message     = "Teste de coluna"
} | ConvertTo-Json

Write-Host "Testando INSERT com coluna 'raw_message'..."

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
    Write-Host "SUCESSO: Coluna existe!" -ForegroundColor Green
    # Opcional: deletar o registro de teste
}
catch {
    Write-Host "ERRO DETECTADO:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errorBody = $streamReader.ReadToEnd()
    Write-Host "Detalhes: $errorBody"
}
